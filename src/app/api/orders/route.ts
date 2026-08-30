import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { SOFTCOVER_PRICE } from "@/lib/pricing";

/**
 * POST /api/orders
 * body: { bookId }
 *
 * 결제 위젯 호출 전에 서버에서 주문을 생성한다.
 * 금액은 클라이언트 입력을 받지 않고 서버 가격표(SOFTCOVER_PRICE)로 고정 —
 * 이후 /api/payment/confirm 에서 토스 승인 금액과 이 주문 금액을 대조한다.
 */

/** 결제를 시작할 수 있는 book 상태 (미리보기 완료 이후, 결제 전) */
const PAYABLE_BOOK_STATUSES = new Set(["preview_ready", "generating"]);
const PAID_BOOK_STATUSES = new Set(["paid", "printing", "shipped", "completed"]);

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 });
    }

    const { bookId } = (body ?? {}) as { bookId?: unknown };
    if (typeof bookId !== "string" || bookId.length === 0) {
      return NextResponse.json(
        { error: "bookId는 필수 값입니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: book, error: bookError } = await supabase
      .from("moobook_books")
      .select("id, status, child_name")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { error: "동화책을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (PAID_BOOK_STATUSES.has(book.status)) {
      return NextResponse.json(
        { error: "이미 결제가 완료된 동화책입니다." },
        { status: 409 }
      );
    }

    if (!PAYABLE_BOOK_STATUSES.has(book.status)) {
      return NextResponse.json(
        { error: "아직 결제할 수 있는 상태가 아닙니다." },
        { status: 409 }
      );
    }

    // 같은 book 의 미결제 주문이 있으면 재사용 — 결제 시도 반복 시 주문 중복 방지.
    const { data: existing } = await supabase
      .from("moobook_orders")
      .select("id, amount")
      .eq("book_id", bookId)
      .eq("payment_status", "pending")
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        orderId: existing.id,
        amount: existing.amount,
        orderName: buildOrderName(book.child_name),
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("moobook_orders")
      .insert({
        book_id: bookId,
        tier: "softcover",
        amount: SOFTCOVER_PRICE,
        payment_status: "pending",
      })
      .select("id, amount")
      .single();

    if (orderError || !order) {
      console.error("주문 생성 실패:", orderError);
      return NextResponse.json(
        { error: "주문 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      orderName: buildOrderName(book.child_name),
    });
  } catch (error) {
    console.error("주문 생성 오류:", error);
    return NextResponse.json(
      { error: "주문 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** 토스 orderName 제약(최대 100자)에 맞춘 주문명 */
function buildOrderName(childName: string | null): string {
  const base = "무북 소프트커버 동화책";
  if (!childName) return base;
  return `${base} (${childName.slice(0, 20)})`;
}
