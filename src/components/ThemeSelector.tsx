"use client";

import { useEffect, useState } from "react";
import { getScenariosByCategory } from "@/lib/scenarios";
import type { Scenario, ScenarioCategory, ThemeId } from "@/types";
import ScenarioPreviewModal from "./ScenarioPreviewModal";

interface ThemeSelectorProps {
  selectedTheme: ThemeId | null;
  onSelect: (themeId: ThemeId) => void;
}

const themeConfig: Record<ThemeId, { emoji: string; bgColor: string; borderColor: string; selectedBg: string }> = {
  "forest-adventure": {
    emoji: "🌳",
    bgColor: "bg-green-50",
    borderColor: "border-brand-secondary",
    selectedBg: "bg-green-50",
  },
  "ocean-friends": {
    emoji: "🐠",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-400",
    selectedBg: "bg-cyan-50",
  },
  "brushing-hero": {
    emoji: "🪥",
    bgColor: "bg-mint-50",
    borderColor: "border-teal-400",
    selectedBg: "bg-teal-50",
  },
  "bath-mission": {
    emoji: "🛁",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
    selectedBg: "bg-blue-50",
  },
  "cooking-magic": {
    emoji: "🧁",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-400",
    selectedBg: "bg-rose-50",
  },
  "animal-school": {
    emoji: "🐻",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    selectedBg: "bg-yellow-50",
  },
  "first-day-school": {
    emoji: "🎒",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    selectedBg: "bg-amber-50",
  },
  "birthday-adventure": {
    emoji: "🎂",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-400",
    selectedBg: "bg-pink-50",
  },
  "space-explorer": {
    emoji: "🚀",
    bgColor: "bg-indigo-50",
    borderColor: "border-brand-blue",
    selectedBg: "bg-indigo-50",
  },
  "dinosaur-world": {
    emoji: "🦕",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    selectedBg: "bg-amber-50",
  },
};

const categoryEmoji: Record<ScenarioCategory, string> = {
  adventure: "🏔️",
  "daily-life": "🌟",
  emotion: "💛",
  celebration: "🎂",
  science: "🔬",
};

export default function ThemeSelector({
  selectedTheme,
  onSelect,
}: ThemeSelectorProps) {
  const categories = getScenariosByCategory();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    fetch("/api/scenarios/thumbnails")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.thumbnails) setThumbnails(data.thumbnails);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {categories.map(({ category, label, scenarios }) => (
        <div key={category}>
          <h3
            className="text-base text-text-light mb-3 flex items-center gap-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span>{categoryEmoji[category]}</span>
            <span>{label}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scenarios.map((scenario) => {
              const config = themeConfig[scenario.id];
              const isSelected = selectedTheme === scenario.id;
              const thumbnail = thumbnails[scenario.id];

              return (
                <div
                  key={scenario.id}
                  className={`bg-white rounded-3xl shadow-md p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center ${
                    isSelected
                      ? `${config.borderColor} ${config.selectedBg} shadow-lg -translate-y-1`
                      : "border-transparent hover:border-brand/20"
                  }`}
                  onClick={() => onSelect(scenario.id)}
                >
                  <div
                    className={`w-20 h-20 mx-auto rounded-full ${config.bgColor} flex items-center justify-center text-5xl mb-3 shadow-inner overflow-hidden`}
                  >
                    {thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumbnail}
                        alt={scenario.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      config.emoji
                    )}
                  </div>
                  <h3
                    className="text-lg text-text"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-text-light mt-1">{scenario.description}</p>
                  <p className="text-xs text-text-lighter mt-2">
                    {scenario.targetAge} / {scenario.pageCount}페이지
                  </p>
                  {isSelected && (
                    <div className="mt-3 text-brand text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                      ✓ 선택됨
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewScenario(scenario);
                    }}
                    className="mt-3 text-xs text-text-light hover:text-brand underline underline-offset-2 transition-colors"
                  >
                    이야기 미리보기
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <ScenarioPreviewModal
        scenario={previewScenario}
        thumbnail={previewScenario ? thumbnails[previewScenario.id] : undefined}
        onClose={() => setPreviewScenario(null)}
        onSelect={() => {
          if (previewScenario) {
            onSelect(previewScenario.id);
            setPreviewScenario(null);
          }
        }}
      />
    </div>
  );
}
