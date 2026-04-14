"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import PricingTable from "@/components/PricingTable";
import Button from "@/components/ui/Button";
import type { OrderTier } from "@/types";

export default function CheckoutPage() {
  const params = useParams<{ bookId: string }>();
  const [selectedTier, setSelectedTier] = useState<OrderTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handlePayment() {
    if (!selectedTier) return;
    setIsProcessing(true);

    try {
      // TODO: 토스페이먼츠 결제 위젯 연동
      // 1. 서버에서 주문 생성
      // 2. 토스페이먼츠 결제 위젯 호출
      // 3. 결제 완료 콜백에서 /api/payment/confirm 호출
      // 4. 성공 시 주문 완료 페이지로 이동

      console.log(`결제 시작: bookId=${params.bookId}, tier=${selectedTier}`);
      alert("결제 기능은 토스페이먼츠 연동 후 활성화됩니다.");
    } catch (error) {
      console.error("결제 실패:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 page-enter">
      <div className="text-center mb-10">
        <div className="text-4xl mb-3">💳</div>
        <h1
          className="text-2xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          결제하기
        </h1>
        <p className="text-text-light mt-2">
          동화책 옵션을 선택해주세요
        </p>
      </div>

      <PricingTable onSelect={setSelectedTier} />

      {selectedTier && (
        <div className="mt-8 text-center">
          <Button
            size="lg"
            disabled={isProcessing}
            onClick={handlePayment}
          >
            {isProcessing ? "✨ 결제 처리 중..." : "💳 결제하기"}
          </Button>
        </div>
      )}
    </div>
  );
}
