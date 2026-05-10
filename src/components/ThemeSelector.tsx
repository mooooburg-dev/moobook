"use client";

import { useEffect, useMemo, useState } from "react";
import { getScenariosByCategory } from "@/lib/scenarios";
import type { ChildGender, Scenario, ScenarioCategory, ThemeId } from "@/types";
import ScenarioPreviewModal from "./ScenarioPreviewModal";

interface ThemeSelectorProps {
  selectedTheme: ThemeId | null;
  onSelect: (themeId: ThemeId) => void;
  onSelectCustom?: () => void;
  customKeywords?: [string, string, string] | null;
  customTopic?: string | null;
  /** 성별이 정해지면 사전 일러스트 완비된 시나리오만 노출. 미지정 시 전체 노출(로딩 중 fallback). */
  gender?: ChildGender;
}

type PresetThemeConfigId = Exclude<ThemeId, "custom">;

const themeConfig: Record<PresetThemeConfigId, { emoji: string; bgColor: string; borderColor: string; selectedBg: string }> = {
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
  onSelectCustom,
  customKeywords,
  customTopic,
  gender,
}: ThemeSelectorProps) {
  const categories = getScenariosByCategory();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [completeScenarioIds, setCompleteScenarioIds] = useState<Set<string> | null>(
    null
  );
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    const params = gender ? `?gender=${gender}` : "";
    fetch(`/api/scenarios/thumbnails${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.thumbnails) setThumbnails(data.thumbnails);
        if (Array.isArray(data.completeScenarioIds)) {
          setCompleteScenarioIds(new Set<string>(data.completeScenarioIds));
        }
      })
      .catch(() => {});
  }, [gender]);

  /**
   * 사전 일러스트가 모든 페이지 완비된 시나리오만 보여준다.
   * completeScenarioIds 가 아직 도착하지 않은 동안엔 빈 목록이 아니라 전체를 노출해
   * 로딩 중 깜빡임을 줄인다. 실제 선택 시점에 미완비라면 서버에서 다시 걸러진다.
   */
  const visibleCategories = useMemo(() => {
    if (!completeScenarioIds) return categories;
    return categories
      .map((c) => ({
        ...c,
        scenarios: c.scenarios.filter((s) => completeScenarioIds.has(s.id)),
      }))
      .filter((c) => c.scenarios.length > 0);
  }, [categories, completeScenarioIds]);

  const isCustomSelected = selectedTheme === "custom";

  return (
    <div className="space-y-8">
      {onSelectCustom && (
        <div>
          <h3
            className="text-base text-text-light mb-3 flex items-center gap-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span>✨</span>
            <span>우리 아이만의 이야기</span>
          </h3>
          <div
            className={`bg-gradient-to-br from-brand/10 via-white to-brand-secondary/10 rounded-3xl shadow-md p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              isCustomSelected
                ? "border-brand shadow-lg -translate-y-1"
                : "border-transparent hover:border-brand/30"
            }`}
            onClick={onSelectCustom}
          >
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand/20 to-brand-secondary/30 flex items-center justify-center text-5xl shrink-0 shadow-inner">
                ✨
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg text-text"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  커스텀 만들기
                </h3>
                <p className="text-sm text-text-light mt-1">
                  아이가 좋아하는 키워드 3개로 AI가 즉석에서 만드는 단 하나뿐인 동화
                </p>
                {isCustomSelected && customKeywords && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {customKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white rounded-full px-3 py-1 text-brand border border-brand/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                {isCustomSelected && customTopic && (
                  <div className="mt-2 text-xs text-text-light">
                    핵심 메시지:{" "}
                    <span className="text-brand">{customTopic}</span>
                  </div>
                )}
                {isCustomSelected && (
                  <div
                    className="mt-2 text-brand text-sm"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    ✓ 선택됨
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {visibleCategories.map(({ category, label, scenarios }) => (
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
              const presetId = scenario.id as PresetThemeConfigId;
              const config = themeConfig[presetId];
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
