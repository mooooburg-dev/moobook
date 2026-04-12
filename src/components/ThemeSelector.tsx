"use client";

import { getScenariosByCategory } from "@/lib/scenarios";
import type { ScenarioCategory, ThemeId } from "@/types";

interface ThemeSelectorProps {
  selectedTheme: ThemeId | null;
  onSelect: (themeId: ThemeId) => void;
}

const categoryConfig: Record<
  ScenarioCategory,
  { emoji: string; color: string; selectedBorder: string; selectedBg: string }
> = {
  adventure: {
    emoji: "🏔️",
    color: "text-green-600",
    selectedBorder: "border-secondary",
    selectedBg: "bg-green-50",
  },
  habit: {
    emoji: "✨",
    color: "text-blue-600",
    selectedBorder: "border-accent-blue",
    selectedBg: "bg-blue-50",
  },
  emotion: {
    emoji: "💛",
    color: "text-yellow-600",
    selectedBorder: "border-yellow-400",
    selectedBg: "bg-yellow-50",
  },
  celebration: {
    emoji: "🎉",
    color: "text-pink-600",
    selectedBorder: "border-accent-pink",
    selectedBg: "bg-pink-50",
  },
  dream: {
    emoji: "🌈",
    color: "text-purple-600",
    selectedBorder: "border-purple-400",
    selectedBg: "bg-purple-50",
  },
};

const themeEmojis: Record<ThemeId, string> = {
  "forest-adventure": "🌳",
  "space-explorer": "🚀",
  "brushing-hero": "🪥",
  "bath-mission": "🛁",
  "first-day-school": "🎒",
  "new-sibling": "👶",
  "birthday-adventure": "🎂",
  "santas-gift": "🎅",
  "firefighter-me": "🚒",
  "chef-me": "👨‍🍳",
};

export default function ThemeSelector({
  selectedTheme,
  onSelect,
}: ThemeSelectorProps) {
  const groups = getScenariosByCategory();

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const config = categoryConfig[group.category];

        return (
          <div key={group.category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{config.emoji}</span>
              <h3
                className={`text-base ${config.color}`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {group.label}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.scenarios.map((scenario) => {
                const isSelected = selectedTheme === scenario.id;

                return (
                  <div
                    key={scenario.id}
                    className={`bg-white rounded-2xl shadow-sm p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                      isSelected
                        ? `${config.selectedBorder} ${config.selectedBg} shadow-md -translate-y-0.5`
                        : "border-transparent hover:border-primary/20"
                    }`}
                    onClick={() => onSelect(scenario.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {themeEmojis[scenario.id]}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="text-sm text-text leading-tight"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {scenario.title}
                        </h4>
                        <p className="text-xs text-text-light mt-0.5 leading-snug">
                          {scenario.description}
                        </p>
                        <p className="text-[11px] text-text-lighter mt-1">
                          {scenario.targetAge} · {scenario.pageCount}페이지
                        </p>
                      </div>
                      {isSelected && (
                        <span
                          className="text-primary text-xs shrink-0 mt-0.5"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
