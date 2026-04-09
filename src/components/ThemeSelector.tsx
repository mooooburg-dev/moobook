"use client";

import { getAllScenarios } from "@/lib/scenarios";
import type { ThemeId } from "@/types";

interface ThemeSelectorProps {
  selectedTheme: ThemeId | null;
  onSelect: (themeId: ThemeId) => void;
}

const themeConfig: Record<ThemeId, { emoji: string; bgColor: string; borderColor: string; selectedBg: string }> = {
  "forest-adventure": {
    emoji: "🌳",
    bgColor: "bg-green-50",
    borderColor: "border-secondary",
    selectedBg: "bg-green-50",
  },
  "space-explorer": {
    emoji: "🚀",
    bgColor: "bg-indigo-50",
    borderColor: "border-accent-blue",
    selectedBg: "bg-indigo-50",
  },
};

export default function ThemeSelector({
  selectedTheme,
  onSelect,
}: ThemeSelectorProps) {
  const scenarios = getAllScenarios();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {scenarios.map((scenario) => {
        const config = themeConfig[scenario.id];
        const isSelected = selectedTheme === scenario.id;

        return (
          <div
            key={scenario.id}
            className={`bg-white rounded-3xl shadow-md p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center ${
              isSelected
                ? `${config.borderColor} ${config.selectedBg} shadow-lg -translate-y-1`
                : "border-transparent hover:border-primary/20"
            }`}
            onClick={() => onSelect(scenario.id)}
          >
            <div className={`w-20 h-20 mx-auto rounded-full ${config.bgColor} flex items-center justify-center text-5xl mb-3 shadow-inner`}>
              {config.emoji}
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
              <div className="mt-3 text-primary text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                ✓ 선택됨
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
