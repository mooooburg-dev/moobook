"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check, Frown } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmState = "confirming" | "success" | "error";

function CheckoutSuccessContent() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ConfirmState>("confirming");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const confirmStartedRef = useRef(false);

  useEffect(() => {
    // StrictMode 이중 mount 에서 confirm 이 두 번 나가는 것 방지
    if (confirmStartedRef.current) return;
    confirmStartedRef.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = Number(searchParams.get("amount"));

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      setState("error");
      setErrorMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const data = (await res.json()) as { success?: boolean; error?: string };
        if (!res.ok || !data.success) {
          throw new Error(data.error || "결제 승인에 실패했습니다.");
        }
        setState("success");
      } catch (err) {
        console.error("결제 승인 실패:", err);
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "결제 승인 중 오류가 발생했습니다."
        );
      }
    })();
  }, [searchParams]);

  if (state === "confirming") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
        <span className="inline-block w-10 h-10 rounded-full border-[3px] border-brand/30 border-t-brand animate-spin mb-6" />
        <h1
          className="text-xl text-text mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          결제를 확인하고 있어요
        </h1>
        <p className="text-sm text-text-light">
          잠시만 기다려주세요. 이 화면을 닫지 마세요.
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-pink/10 flex items-center justify-center">
          <Frown className="w-7 h-7 text-brand-pink" strokeWidth={1.75} />
        </div>
        <h1
          className="text-xl text-text mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          결제를 완료하지 못했어요
        </h1>
        <p className="text-sm text-text-light mb-6">{errorMessage}</p>
        <Button onClick={() => router.replace(`/create/${params.bookId}/checkout`)}>
          다시 시도하기
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand flex items-center justify-center shadow-md">
        <Check className="w-8 h-8 text-white" strokeWidth={3} />
      </div>
      <h1
        className="text-2xl text-text mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        결제가 완료되었어요!
      </h1>
      <p className="text-text-light text-sm mb-8 leading-relaxed">
        이제 남은 페이지를 마저 그려서 12페이지 동화책을 완성해 드려요.
        <br />
        완성까지 몇 분 정도 걸릴 수 있어요.
      </p>
      <Button size="lg" onClick={() => router.replace(`/create/${params.bookId}`)}>
        동화책 완성 보러 가기
      </Button>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
