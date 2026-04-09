import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body as {
      paymentKey: string;
      orderId: string;
      amount: number;
    };

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "paymentKey, orderId, amount는 필수 값입니다." },
        { status: 400 }
      );
    }

    // TODO: 토스페이먼츠 결제 승인 API 호출
    // POST https://api.tosspayments.com/v1/payments/confirm
    // Authorization: Basic base64(TOSS_SECRET_KEY + ":")
    // Body: { paymentKey, orderId, amount }

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

    // TODO: Supabase에서 주문 상태 업데이트
    // 1. orders 테이블에서 orderId로 조회
    // 2. payment_status를 'paid'로 변경
    // 3. payment_key 저장
    // 4. book status를 'paid'로 변경
    // 5. PDF 생성 트리거

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
