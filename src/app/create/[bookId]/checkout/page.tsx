"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Check, CreditCard } from "lucide-react";
import {
  loadTossPayments,
  ANONYMOUS,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";

import { Button } from "@/components/ui/button";
import { SOFTCOVER_PRICE, formatKrw } from "@/lib/pricing";

const ORDER_FEATURES = [
  "12페이지 풀 컬러",
  "소프트커버 실물 책",
  "무료 배송 (3~5일)",
];

export default function CheckoutPage() {
  const params = useParams<{ bookId: string }>();
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initStartedRef = useRef(false);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  useEffect(() => {
    if (!clientKey) return;
    // React StrictMode 의 이중 mount 에서 위젯이 두 번 렌더되는 것 방지
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const w = tossPayments.widgets({ customerKey: ANONYMOUS });
        await w.setAmount({ currency: "KRW", value: SOFTCOVER_PRICE });
        if (cancelled) return;
        await Promise.all([
          w.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          w.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        if (cancelled) return;
        setWidgets(w);
        setWidgetReady(true);
      } catch (err) {
        console.error("결제 위젯 초기화 실패:", err);
        if (!cancelled) {
          setError("결제 화면을 불러오지 못했어요. 새로고침 후 다시 시도해주세요.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientKey]);

  async function handlePayment() {
    if (!widgets || !widgetReady || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      // 1. 서버에서 주문 생성 (금액은 서버가 고정)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: params.bookId }),
      });
      const orderData = (await orderRes.json()) as {
        orderId?: string;
        orderName?: string;
        error?: string;
      };
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "주문 생성에 실패했습니다.");
      }

      // 2. 결제 요청 — 성공/실패 시 리다이렉트로 이어진다
      const origin = window.location.origin;
      await widgets.requestPayment({
        orderId: orderData.orderId,
        orderName: orderData.orderName ?? "무북 소프트커버 동화책",
        successUrl: `${origin}/create/${params.bookId}/checkout/success`,
        failUrl: `${origin}/create/${params.bookId}/checkout/fail`,
      });
    } catch (err) {
      const e = err as { code?: string; message?: string };
      // 사용자가 결제창을 직접 닫은 경우는 에러로 표시하지 않는다
      if (e.code !== "USER_CANCEL") {
        console.error("결제 요청 실패:", err);
        setError(e.message || "결제 요청 중 오류가 발생했습니다.");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 page-enter">
      <div className="text-center mb-10">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white shadow-md flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-brand" strokeWidth={1.75} />
        </div>
        <h1
          className="text-2xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          결제하기
        </h1>
        <p className="text-text-light mt-2">
          주문 내용을 확인하고 결제를 진행해주세요
        </p>
      </div>

      {/* 주문 요약 */}
      <div className="bg-white rounded-3xl shadow-md p-6 border-2 border-brand mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-peach flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-brand" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-lg text-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              소프트커버 책
            </h2>
            <p className="text-sm text-text-light">실물 동화책 배송</p>
          </div>
          <div
            className="text-xl text-brand shrink-0"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatKrw(SOFTCOVER_PRICE)}
          </div>
        </div>
        <ul className="mt-4 pt-4 border-t border-brand/10 text-sm text-text-light space-y-1.5">
          {ORDER_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-brand shrink-0" strokeWidth={3} />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {!clientKey ? (
        <div className="bg-brand-pink/10 border border-brand-pink/30 rounded-2xl p-6 text-center text-sm text-text">
          결제 모듈이 아직 설정되지 않았어요. 잠시 후 다시 시도해주세요.
        </div>
      ) : (
        <>
          {/* 토스페이먼츠 결제 위젯 */}
          <div className="bg-white rounded-3xl shadow-md overflow-hidden mb-6">
            <div id="payment-method" />
            <div id="agreement" />
            {!widgetReady && !error && (
              <p className="py-10 text-center text-sm text-text-light animate-pulse">
                결제 수단을 불러오고 있어요...
              </p>
            )}
          </div>

          {error && (
            <p className="text-center text-brand-pink text-sm mb-4">{error}</p>
          )}

          <div className="text-center">
            <Button
              size="lg"
              className="w-full sm:w-auto sm:min-w-64"
              disabled={!widgetReady || isProcessing}
              onClick={handlePayment}
            >
              {isProcessing
                ? "결제 진행 중..."
                : `${formatKrw(SOFTCOVER_PRICE)} 결제하기`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
