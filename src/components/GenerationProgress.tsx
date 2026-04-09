"use client";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";

const PROGRESS_STEPS = [
  { progress: 5, message: "사진을 분석하고 있어요...", emoji: "📷", atMs: 0 },
  { progress: 15, message: "아이의 얼굴을 인식하고 있어요...", emoji: "👶", atMs: 2000 },
  { progress: 25, message: "동화 세계를 준비하고 있어요...", emoji: "🌳", atMs: 5000 },
  { progress: 40, message: "AI가 첫 번째 그림을 그리고 있어요...", emoji: "🎨", atMs: 8000 },
  { progress: 55, message: "색을 입히고 있어요...", emoji: "🖌️", atMs: 16000 },
  { progress: 65, message: "두 번째 그림을 그리고 있어요...", emoji: "✏️", atMs: 24000 },
  { progress: 75, message: "거의 다 됐어요! 마무리 중...", emoji: "🌟", atMs: 32000 },
  { progress: 85, message: "미리보기를 준비하고 있어요...", emoji: "📖", atMs: 42000 },
  { progress: 90, message: "조금만 더 기다려주세요...", emoji: "⏳", atMs: 57000 },
];

const TOTAL_DURATION_MS = 90000;

export default function GenerationProgress() {
  const [elapsed, setElapsed] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // 현재 경과 시간에 해당하는 단계 찾기
  let currentStepIndex = 0;
  for (let i = PROGRESS_STEPS.length - 1; i >= 0; i--) {
    if (elapsed >= PROGRESS_STEPS[i].atMs) {
      currentStepIndex = i;
      break;
    }
  }

  const currentStep = PROGRESS_STEPS[currentStepIndex];
  const nextStep = PROGRESS_STEPS[currentStepIndex + 1];

  let smoothProgress: number;
  if (!mounted) {
    smoothProgress = 0;
  } else if (!nextStep) {
    const extra = Math.min(5, ((elapsed - currentStep.atMs) / TOTAL_DURATION_MS) * 5);
    smoothProgress = currentStep.progress + extra;
  } else {
    const stepElapsed = elapsed - currentStep.atMs;
    const stepDuration = nextStep.atMs - currentStep.atMs;
    const ratio = Math.min(1, stepElapsed / stepDuration);
    smoothProgress =
      currentStep.progress + (nextStep.progress - currentStep.progress) * ratio;
  }

  return (
    <div className="w-full max-w-md mx-auto text-center page-enter">
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-peach rounded-full flex items-center justify-center shadow-inner">
          <span className="text-6xl animate-gentle-bounce">
            {mounted ? currentStep.emoji : "📷"}
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

      <p className="text-sm text-text-light mb-6 h-6">
        {mounted ? currentStep.message : "준비 중이에요..."}
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
