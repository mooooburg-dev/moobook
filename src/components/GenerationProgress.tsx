"use client";

import ProgressBar from "@/components/ui/ProgressBar";

interface GenerationProgressProps {
  totalPages: number;
  completedPages: number;
  status: string;
}

const statusMessages: Record<string, string> = {
  pending: "준비 중이에요...",
  generating: "동화책을 만들고 있어요!",
  preview_ready: "미리보기가 준비됐어요!",
};

const statusEmojis: Record<string, string> = {
  pending: "📖",
  generating: "🎨",
  preview_ready: "✨",
};

export default function GenerationProgress({
  totalPages,
  completedPages,
  status,
}: GenerationProgressProps) {
  const progress = totalPages > 0 ? (completedPages / totalPages) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto text-center page-enter">
      {/* 동화책 열리는 애니메이션 영역 */}
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-peach rounded-full flex items-center justify-center shadow-inner">
          <span className="text-6xl animate-gentle-bounce">
            {statusEmojis[status] || "📖"}
          </span>
        </div>
        {status === "generating" && (
          <>
            <span className="absolute top-0 right-1/4 text-xl animate-twinkle" style={{ animationDelay: "0s" }}>⭐</span>
            <span className="absolute bottom-2 left-1/4 text-lg animate-twinkle" style={{ animationDelay: "0.7s" }}>✨</span>
            <span className="absolute top-1/4 right-1/6 text-sm animate-twinkle" style={{ animationDelay: "1.4s" }}>🌟</span>
          </>
        )}
      </div>

      <h2
        className="text-xl text-text mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {statusMessages[status] || "처리 중..."}
      </h2>

      <p className="text-sm text-text-light mb-6">
        {completedPages}/{totalPages} 페이지 완성
      </p>

      <ProgressBar
        progress={progress}
        label="동화책 만드는 중"
      />

      <p className="text-xs text-text-lighter mt-4">
        🎨 AI가 열심히 그림을 그리고 있어요. 약 2~3분 정도 걸려요.
      </p>
    </div>
  );
}
