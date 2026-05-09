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
  // completedPages === 0 일 때는 첫 페이지 완성까지 30~50초 동안 0% 정지감을
  // 막기 위해, 진행률을 시간 기반 0~8% 사이로 부드럽게 채운다 (Codex #10).
  let smoothProgress: number;
  let message: string;
  let emoji: string;
  let indeterminate = false;

  const FIRST_PAGE_FAKE_CAP = 8;
  const FIRST_PAGE_FAKE_DURATION = 50000;

  if (typeof completedPages === "number" && totalPages > 0) {
    if (completedPages === 0) {
      indeterminate = true;
      const ratio = Math.min(1, elapsed / FIRST_PAGE_FAKE_DURATION);
      smoothProgress = ratio * FIRST_PAGE_FAKE_CAP;
      emoji = "📷";
      // elapsed 단계별 메시지 변화 — 같은 줄이 30~50초 유지되는 것 방지
      if (elapsed < 8000) {
        message = "사진을 분석하고 있어요...";
      } else if (elapsed < 18000) {
        message = "동화 세계를 준비하고 있어요...";
      } else if (elapsed < 32000) {
        message = "AI가 첫 번째 그림을 그리고 있어요...";
      } else if (elapsed < 50000) {
        message = "색을 입히고 있어요...";
      } else {
        message = "거의 다 됐어요! 첫 그림 마무리 중...";
      }
    } else if (completedPages < 3) {
      smoothProgress = Math.min(99, (completedPages / totalPages) * 100);
      emoji = PAGE_EMOJIS[completedPages % PAGE_EMOJIS.length];
      message = `${completedPages}장 그렸어요! 다음 그림 준비 중...`;
    } else {
      smoothProgress = Math.min(99, (completedPages / totalPages) * 100);
      emoji = PAGE_EMOJIS[completedPages % PAGE_EMOJIS.length];
      message = `${completedPages}장 완성! 미리보기 준비됐어요`;
    }
  } else {
    // fallback (과거 시간 기반)
    const ratio = Math.min(0.95, elapsed / 90000);
    smoothProgress = ratio * 100;
    emoji = "🎨";
    message = "AI가 그림을 그리고 있어요...";
    indeterminate = true;
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
        <div className="relative">
          <Progress
            value={smoothProgress}
            className="h-4 bg-peach"
            indicatorClassName="bg-linear-to-r from-brand to-brand-pink"
          />
          {indeterminate && (
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
              aria-hidden
            >
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/60 to-transparent animate-progress-shimmer" />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-text-lighter mt-4">
        AI가 열심히 그림을 그리고 있어요. 페이지당 약 30초 정도 걸려요.
      </p>
    </div>
  );
}
