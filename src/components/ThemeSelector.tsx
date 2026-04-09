"use client";

import { getAllScenarios } from "@/lib/scenarios";
import type { ThemeId } from "@/types";
import Card from "@/components/ui/Card";

interface ThemeSelectorProps {
  selectedTheme: ThemeId | null;
  onSelect: (themeId: ThemeId) => void;
}

const themeEmojis: Record<ThemeId, string> = {
  "forest-adventure": "🌳",
  "space-explorer": "🚀",
};

export default function ThemeSelector({
  selectedTheme,
  onSelect,
}: ThemeSelectorProps) {
  const scenarios = getAllScenarios();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {scenarios.map((scenario) => (
        <Card
          key={scenario.id}
          hover
          className={`text-center ${
            selectedTheme === scenario.id
              ? "ring-2 ring-violet-500 bg-violet-50"
              : ""
          }`}
          onClick={() => onSelect(scenario.id)}
        >
          <div className="text-5xl mb-3">{themeEmojis[scenario.id]}</div>
          <h3 className="text-lg font-bold text-gray-900">{scenario.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
          <p className="text-xs text-gray-400 mt-2">
            {scenario.targetAge} / {scenario.pageCount}페이지
          </p>
        </Card>
      ))}
    </div>
  );
}
