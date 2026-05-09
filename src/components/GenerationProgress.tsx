"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface GenerationProgressProps {
  /** 완성된 페이지 수 (polling-driven 기반의 실제 진행률) */
  completedPages?: number;
  /** 전체 페이지 수 (default: 12) */
  totalPages?: number;
}

const PAGE_EMOJIS = ["📷", "🎨", "🖌️", "✏️", "🌟", "📖", "✨", "🌈"];

export default function GenerationProgress({
  completedPages,
  totalPages = 12,
}: GenerationProgressProps = {}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // 페이지 진행률을 알면 그걸 우선 사용. 모르면 시간 기반 fake 진행률.
  let smoothProgress: number;
  let message: string;
  let emoji: string;

  if (typeof completedPages === "number" && totalPages > 0) {
    smoothProgress = Math.min(99, (completedPages / totalPages) * 100);
    if (completedPages === 0) {
      emoji = "📷";
      message = "AI가 첫 번째 그림을 그리고 있어요...";
    } else if (completedPages < 3) {
      emoji = PAGE_EMOJIS[completedPages % PAGE_EMOJIS.length];
      message = `${completedPages}장 그렸어요! 다음 그림 준비 중...`;
    } else {
      emoji = PAGE_EMOJIS[completedPages % PAGE_EMOJIS.length];
      message = `${completedPages}장 완성! 미리보기 준비됐어요`;
    }
  } else {
    // fallback (과거 시간 기반)
    const ratio = Math.min(0.95, elapsed / 90000);
    smoothProgress = ratio * 100;
    emoji = "🎨";
    message = "AI가 그림을 그리고 있어요...";
  }

  return (
    <div className="w-full max-w-md mx-auto text-center page-enter">
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-peach rounded-full flex items-center justify-center shadow-inner">
          <span className="text-6xl animate-gentle-bounce">{emoji}</span>
        </div>
        <span className="absolute top-0 right-1/4 text-xl animate-twinkle" style={{ animationDelay: "0s" }}>⭐</span>
        <span className="absolute bottom-2 left-1/4 text-lg animate-twinkle" style={{ animationDelay: "0.7s" }}>✨</span>
        <span className="absolute top-1/4 right-1/6 text-sm animate-twinkle" style={{ animationDelay: "1.4s" }}>🌟</span>
      </div>

      <h2
        className="text-xl text-text mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        동화책을 만들고 있어요!
      </h2>

      <p className="text-sm text-text-light mb-6 h-6">{message}</p>

      <div className="w-full">
        <div className="flex justify-between mb-2 text-sm text-text-light">
          <span>
            {typeof completedPages === "number"
              ? `${completedPages} / ${totalPages} 페이지`
              : "동화책 만드는 중"}
          </span>
          <span>{Math.round(smoothProgress)}%</span>
        </div>
        <Progress
          value={smoothProgress}
          className="h-4 bg-peach"
          indicatorClassName="bg-linear-to-r from-brand to-brand-pink"
        />
      </div>

      <p className="text-xs text-text-lighter mt-4">
        AI가 열심히 그림을 그리고 있어요. 페이지당 약 30초 정도 걸려요.
      </p>
    </div>
  );
}
