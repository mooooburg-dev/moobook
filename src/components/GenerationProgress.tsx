"use client";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";

interface GenerationProgressProps {
  status: string;
}

const PROGRESS_STEPS = [
  { progress: 5, message: "사진을 분석하고 있어요...", emoji: "📷", durationMs: 2000 },
  { progress: 15, message: "아이의 얼굴을 인식하고 있어요...", emoji: "👶", durationMs: 3000 },
  { progress: 25, message: "동화 세계를 준비하고 있어요...", emoji: "🌳", durationMs: 3000 },
  { progress: 40, message: "AI가 첫 번째 그림을 그리고 있어요...", emoji: "🎨", durationMs: 8000 },
  { progress: 55, message: "색을 입히고 있어요...", emoji: "🖌️", durationMs: 8000 },
  { progress: 65, message: "두 번째 그림을 그리고 있어요...", emoji: "✏️", durationMs: 8000 },
  { progress: 75, message: "거의 다 됐어요! 마무리 중...", emoji: "🌟", durationMs: 10000 },
  { progress: 85, message: "미리보기를 준비하고 있어요...", emoji: "📖", durationMs: 15000 },
  { progress: 90, message: "조금만 더 기다려주세요...", emoji: "⏳", durationMs: 30000 },
];

export default function GenerationProgress({ status }: GenerationProgressProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);

  // 단계별 진행
  useEffect(() => {
    if (status !== "pending" && status !== "generating") return;

    const step = PROGRESS_STEPS[stepIndex];
    if (!step) return;

    // 현재 단계의 목표 progress까지 부드럽게 채우기
    const targetProgress = step.progress;
    const increment = setInterval(() => {
      setSmoothProgress((prev) => {
        if (prev >= targetProgress) {
          clearInterval(increment);
          return targetProgress;
        }
        return prev + 0.5;
      });
    }, 100);

    // 다음 단계로 이동
    const nextStepTimer = setTimeout(() => {
      if (stepIndex < PROGRESS_STEPS.length - 1) {
        setStepIndex((prev) => prev + 1);
      }
    }, step.durationMs);

    return () => {
      clearInterval(increment);
      clearTimeout(nextStepTimer);
    };
  }, [stepIndex, status]);

  const currentStep = PROGRESS_STEPS[Math.min(stepIndex, PROGRESS_STEPS.length - 1)];

  return (
    <div className="w-full max-w-md mx-auto text-center page-enter">
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-peach rounded-full flex items-center justify-center shadow-inner">
          <span className="text-6xl animate-gentle-bounce">
            {currentStep.emoji}
          </span>
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

      <p className="text-sm text-text-light mb-6 h-6 transition-opacity duration-500">
        {currentStep.message}
      </p>

      <ProgressBar
        progress={smoothProgress}
        label="동화책 만드는 중"
      />

      <p className="text-xs text-text-lighter mt-4">
        AI가 열심히 그림을 그리고 있어요. 약 1~2분 정도 걸려요.
      </p>
    </div>
  );
}
