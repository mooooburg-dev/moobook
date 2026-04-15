"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getAllScenarios } from "@/lib/scenarios";
import type { ScenarioCategory } from "@/types";

const categoryLabel: Record<ScenarioCategory, string> = {
  adventure: "모험",
  "daily-life": "일상생활",
  emotion: "감정/성장",
  celebration: "기념일",
  science: "과학",
};

const categoryColor: Record<ScenarioCategory, string> = {
  adventure: "bg-orange-100 text-orange-700",
  "daily-life": "bg-green-100 text-green-700",
  emotion: "bg-yellow-100 text-yellow-700",
  celebration: "bg-pink-100 text-pink-700",
  science: "bg-cyan-100 text-cyan-700",
};

type PhaseStats = {
  total: number;
  completed: number;
  approved: number;
  generating: number;
};

type ScenarioStats = PhaseStats & { character: PhaseStats };

function readyCount(s: PhaseStats | undefined): number {
  if (!s) return 0;
  return s.completed + s.approved;
}

function Progress({
  label,
  ready,
  total,
  generating,
  tone,
}: {
  label: string;
  ready: number;
  total: number;
  generating: number;
  tone: "blue" | "violet" | "emerald";
}) {
  const pct = total === 0 ? 0 : (ready / total) * 100;
  const done = ready >= total && total > 0;
  const barColor = done
    ? "bg-emerald-500"
    : tone === "blue"
      ? "bg-blue-500"
      : tone === "violet"
        ? "bg-violet-500"
        : "bg-emerald-500";

  return (
    <div>
      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
        <span className="flex items-center gap-1">
          <span className="font-medium text-gray-600">{label}</span>
          {generating > 0 && (
            <span className="text-blue-600 animate-pulse">· 생성 중</span>
          )}
        </span>
        <span className={done ? "text-emerald-600 font-medium" : ""}>
          {ready}/{total}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminScenariosPage() {
  const scenarios = getAllScenarios();
  const [stats, setStats] = useState<Record<string, ScenarioStats>>({});
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backgrounds");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats ?? {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const hasGenerating = Object.values(stats).some(
    (s) => s.generating > 0 || s.character.generating > 0
  );

  useEffect(() => {
    if (!hasGenerating) return;
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [hasGenerating, fetchStats]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">시나리오</h1>
        <p className="text-sm text-gray-500 mt-1">
          {scenarios.length}개 시나리오 · 배경·캐릭터 생성 및 승인 현황
        </p>
      </div>

      {loading && (
        <div className="text-sm text-gray-400 mb-4">진행률 불러오는 중...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const s = stats[scenario.id];
          const bgReady = readyCount(s);
          const charReady = readyCount(s?.character);
          const approved = s?.approved ?? 0;
          const total = scenario.pageCount;
          const allDone = s && bgReady >= total && charReady >= total;

          return (
            <Link
              key={scenario.id}
              href={`/admin/scenarios/${scenario.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {scenario.title}
                </h2>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    categoryColor[scenario.category]
                  }`}
                >
                  {categoryLabel[scenario.category]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {scenario.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span>{scenario.targetAge}</span>
                <span>·</span>
                <span>{total}페이지</span>
                {allDone && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-600 font-medium">
                      모두 완료
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <Progress
                  label="배경"
                  ready={bgReady}
                  total={total}
                  generating={s?.generating ?? 0}
                  tone="blue"
                />
                <Progress
                  label="캐릭터"
                  ready={charReady}
                  total={total}
                  generating={s?.character.generating ?? 0}
                  tone="violet"
                />
                <Progress
                  label="승인"
                  ready={approved}
                  total={total}
                  generating={0}
                  tone="emerald"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
