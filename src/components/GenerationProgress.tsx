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

export default function GenerationProgress({
  totalPages,
  completedPages,
  status,
}: GenerationProgressProps) {
  const progress = totalPages > 0 ? (completedPages / totalPages) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="text-6xl mb-6 animate-bounce">
        {status === "generating" ? "✨" : "📖"}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {statusMessages[status] || "처리 중..."}
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        {completedPages}/{totalPages} 페이지 완성
      </p>

      <ProgressBar
        progress={progress}
        label="동화책 만드는 중"
      />

      <p className="text-xs text-gray-400 mt-4">
        AI가 열심히 그림을 그리고 있어요. 약 2~3분 정도 걸려요.
      </p>
    </div>
  );
}
