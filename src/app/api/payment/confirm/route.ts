import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/payment/confirm
 * body: { paymentKey, orderId, amount }
 *
 * 토스페이먼츠 결제 승인 흐름:
 *   1) orderId 로 moobook_orders 조회 — 우리가 만든 주문인지 검증
 *   2) 요청 amount 와 주문 amount 대조 — 금액 변조 차단
 *   3) 토스 승인 API 호출
 *   4) 주문 payment_key/payment_status 갱신 + book.status 를 paid 로 승격
 *
 * 같은 주문에 대한 중복 호출(새로고침 등)은 idempotent 하게 성공을 돌려준다.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 });
    }

    const { paymentKey, orderId, amount } = (body ?? {}) as {
      paymentKey?: unknown;
      orderId?: unknown;
      amount?: unknown;
    };

    if (
      typeof paymentKey !== "string" ||
      paymentKey.length === 0 ||
      typeof orderId !== "string" ||
      orderId.length === 0 ||
      typeof amount !== "number" ||
      !Number.isFinite(amount)
    ) {
      return NextResponse.json(
        { error: "paymentKey, orderId, amount는 필수 값입니다." },
        { status: 400 }
      );
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      console.error("TOSS_SECRET_KEY 미설정 — 결제 승인 불가");
      return NextResponse.json(
        { error: "결제 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();

    // 1) 주문 검증 — orderId 는 moobook_orders.id (서버가 발급한 UUID)
    const { data: order, error: orderError } = await supabase
      .from("moobook_orders")
      .select("id, book_id, amount, payment_status, payment_key")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 중복 confirm (성공 페이지 새로고침 등) — 같은 paymentKey 면 성공 처리
    if (order.payment_status === "paid") {
      if (order.payment_key === paymentKey) {
        return NextResponse.json({ success: true, bookId: order.book_id });
      }
      return NextResponse.json(
        { error: "이미 다른 결제로 완료된 주문입니다." },
        { status: 409 }
      );
    }

    // 2) 금액 대조 — 주문 생성 시 서버가 고정한 금액과 일치해야 함
    if (amount !== order.amount) {
      return NextResponse.json(
        { error: "결제 금액이 주문 금액과 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 3) 토스 승인 API
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
      };
      console.error("토스 결제 승인 실패:", errorData);
      return NextResponse.json(
        {
          error: errorData.message ?? "결제 승인에 실패했습니다.",
          code: errorData.code ?? null,
        },
        { status: 400 }
      );
    }

    // 4) DB 반영 — 주문은 pending 인 row 만 갱신 (동시 confirm 경합 가드)
    const { error: orderUpdateError } = await supabase
      .from("moobook_orders")
      .update({ payment_key: paymentKey, payment_status: "paid" })
      .eq("id", order.id)
      .eq("payment_status", "pending");

    if (orderUpdateError) {
      // 승인은 이미 났으므로 실패로 돌리지 않고 로그만 남긴다 (수동 복구 대상)
      console.error("주문 결제 상태 업데이트 실패:", orderUpdateError);
    }

    // book 은 결제 전 상태일 때만 paid 로 승격 — 이미 paid 이후 단계면 유지
    const { error: bookUpdateError } = await supabase
      .from("moobook_books")
      .update({ status: "paid" })
      .eq("id", order.book_id)
      .in("status", ["preview_ready", "generating"]);

    if (bookUpdateError) {
      console.error("book paid 상태 업데이트 실패:", bookUpdateError);
    }

    return NextResponse.json({ success: true, bookId: order.book_id });
  } catch (error) {
    console.error("결제 확인 실패:", error);
    return NextResponse.json(
      { error: "결제 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
