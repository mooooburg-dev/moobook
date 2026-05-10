import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount, bookId } = body as {
      paymentKey: string;
      orderId: string;
      amount: number;
      bookId?: string;
    };

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "paymentKey, orderId, amount는 필수 값입니다." },
        { status: 400 }
      );
    }

    const secretKey = process.env.TOSS_SECRET_KEY!;
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
      const errorData = await response.json();
      console.error("결제 승인 실패:", errorData);
      return NextResponse.json(
        { error: "결제 승인에 실패했습니다.", details: errorData },
        { status: 400 }
      );
    }

    const paymentData = await response.json();

    // 결제 승인 시 book.status 를 paid 로 올리는 동작은 결제 위젯 연동/주문
    // 검증이 갖춰질 때까지 feature flag 뒤에 둔다 (Codex round 2 #2).
    //
    // 비활성 상태로 둔 이유:
    //   1. body.bookId 를 그대로 신뢰함 — moobook_orders 가 아직 없어 결제와
    //      bookId 의 연관을 검증할 수 없음. 임의 bookId 로 호출하면 무관한 book
    //      이 paid 로 올라가는 결함.
    //   2. 결제 직후 사용자 이탈 시 후속 11장이 안 만들어짐 (서버 워커 부재).
    //
    // 활성화는 backlog "결제 confirm 보안 강화" / "결제 후 생성 서버 주도화"
    // 작업과 함께. 그 전까지는 plain 200 만 응답하고 DB 는 건드리지 않는다.
    const ENABLE_BOOK_PAID_UPDATE =
      process.env.ENABLE_PAYMENT_PAID_UPDATE === "true";
    if (ENABLE_BOOK_PAID_UPDATE && bookId) {
      const supabase = createAdminClient();
      const { error: updateError } = await supabase
        .from("moobook_books")
        .update({ status: "paid" })
        .eq("id", bookId);
      if (updateError) {
        console.error("book paid 상태 업데이트 실패:", updateError);
      }
    }

    // TODO: orders 테이블 payment_status, payment_key 저장 / PDF 생성 트리거

    return NextResponse.json({
      success: true,
      payment: paymentData,
    });
  } catch (error) {
    console.error("결제 확인 실패:", error);
    return NextResponse.json(
      { error: "결제 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
