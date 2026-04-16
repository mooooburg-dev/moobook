"use client";

import { useEffect } from "react";
import type { Scenario } from "@/types";
import Button from "./ui/Button";

interface ScenarioPreviewModalProps {
  scenario: Scenario | null;
  thumbnail?: string;
  onClose: () => void;
  onSelect: () => void;
}

const emotionEmoji: Record<string, string> = {
  excited: "✨",
  curious: "🧐",
  wonder: "🌟",
  awe: "😮",
  intrigued: "🤔",
  determined: "💪",
  worried: "😟",
  grateful: "🙏",
  joyful: "😊",
  thrilled: "🤩",
  touched: "🥰",
  happy: "😄",
  brave: "🦁",
  proud: "🏆",
  calm: "😌",
  surprised: "😲",
  nervous: "😬",
  confident: "😎",
  loved: "💖",
  sleepy: "😴",
};

function pickBeats(scenario: Scenario) {
  const { pages } = scenario;
  if (pages.length <= 3) return pages;
  const mid = Math.floor(pages.length / 2);
  return [pages[0], pages[mid], pages[pages.length - 1]];
}

const beatLabels = ["이야기의 시작", "모험의 한가운데", "따뜻한 결말"];

export default function ScenarioPreviewModal({
  scenario,
  thumbnail,
  onClose,
  onSelect,
}: ScenarioPreviewModalProps) {
  useEffect(() => {
    if (!scenario) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [scenario, onClose]);

  if (!scenario) return null;

  const beats = pickBeats(scenario);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 sm:h-56 overflow-hidden sm:rounded-t-3xl rounded-t-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
          {thumbnail ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbnail}
              alt={scenario.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">
              📖
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-text-light text-xl"
            aria-label="닫기"
          >
            ✕
          </button>
          <div className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1 text-xs text-text-light">
            {scenario.targetAge} · {scenario.pageCount}페이지
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2
              className="text-2xl text-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {scenario.title}
            </h2>
            <p className="text-sm text-text-light mt-2 leading-relaxed">
              {scenario.description}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="text-xs text-amber-700 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              💛 이 이야기가 전하는 메시지
            </div>
            <p className="text-sm text-text leading-relaxed">
              {scenario.educationMessage}
            </p>
          </div>

          <div>
            <div
              className="text-sm text-text-light mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              이야기 살짝 엿보기
            </div>
            <ol className="space-y-4">
              {beats.map((page, idx) => (
                <li key={page.pageNumber} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    {idx < beats.length - 1 && (
                      <div className="w-px flex-1 bg-primary/20 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div
                      className="text-xs text-text-lighter mb-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {beatLabels[idx]}{" "}
                      <span>{emotionEmoji[page.emotion] ?? "✨"}</span>
                    </div>
                    <p className="text-sm text-text leading-relaxed">
                      {page.sceneDescription}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-text-lighter mt-3 text-center">
              * 실제 이야기에는 {scenario.pageCount}페이지의 풍성한 여정이 담겨요
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              닫기
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={onSelect}
            >
              이 테마로 만들기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
