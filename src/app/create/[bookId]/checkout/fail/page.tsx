"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Frown } from "lucide-react";

import { Button } from "@/components/ui/button";

function CheckoutFailContent() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 토스가 failUrl 에 code / message 쿼리를 붙여 보낸다
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  const displayMessage =
    code === "PAY_PROCESS_CANCELED"
      ? "결제를 취소하셨어요. 언제든 다시 시도할 수 있어요."
      : (message ?? "결제 처리 중 문제가 발생했어요.");

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-pink/10 flex items-center justify-center">
        <Frown className="w-7 h-7 text-brand-pink" strokeWidth={1.75} />
      </div>
      <h1
        className="text-xl text-text mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        결제가 진행되지 않았어요
      </h1>
      <p className="text-sm text-text-light mb-6">{displayMessage}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => router.replace(`/create/${params.bookId}/checkout`)}>
          다시 결제하기
        </Button>
        <Button
          variant="outline"
          onClick={() => router.replace(`/create/${params.bookId}`)}
        >
          미리보기로 돌아가기
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFailContent />
    </Suspense>
  );
}
