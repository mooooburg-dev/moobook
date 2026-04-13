"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAllScenarios } from "@/lib/scenarios";
import type { Scenario } from "@/types";

interface ScenarioStats {
  total: number;
  completed: number;
  approved: number;
  generating: number;
}

export default function AdminBackgroundsPage() {
  const allScenarios = getAllScenarios();
  const [stats, setStats] = useState<Record<string, ScenarioStats>>({});
  const [loading, setLoading] = useState(true);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backgrounds");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  async function handleGenerate(scenarioId: string) {
    setGeneratingIds((prev) => new Set(prev).add(scenarioId));

    const res = await fetch("/api/admin/generate-backgrounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId }),
    });

    if (!res.ok) {
      alert("생성 시작 실패");
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(scenarioId);
        return next;
      });
    }
  }

  function getReadyCount(s: ScenarioStats | undefined): number {
    if (!s) return 0;
    return s.completed + s.approved;
  }

  function getStatusLabel(s: ScenarioStats | undefined, total: number): string {
    if (!s) return `0/${total} 생성됨`;
    const ready = s.completed + s.approved;
    if (ready >= total) return `${total}/${total} 완료`;
    if (s.generating > 0) return `${ready}/${total} 생성됨 (${s.generating}개 생성 중)`;
    return `${ready}/${total} 생성됨`;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Backgrounds</h1>
        <p className="text-sm text-gray-500 mt-1">
          시나리오별 배경 일러스트 사전 생성 관리
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allScenarios.map((scenario: Scenario) => {
            const s = stats[scenario.id];
            const readyCount = getReadyCount(s);
            const progress = (readyCount / scenario.pageCount) * 100;
            const isGenerating =
              generatingIds.has(scenario.id) || (s?.generating ?? 0) > 0;
            const isComplete = readyCount >= scenario.pageCount;

            return (
              <div
                key={scenario.id}
                className="bg-white rounded-lg border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {scenario.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {scenario.id}
                    </p>
                  </div>
                  {isComplete ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                      완료
                    </span>
                  ) : isGenerating ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 animate-pulse">
                      생성 중
                    </span>
                  ) : null}
                </div>

                {/* 프로그레스 바 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{getStatusLabel(s, scenario.pageCount)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerate(scenario.id)}
                    disabled={isGenerating || isComplete}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? "생성 중..." : isComplete ? "생성 완료" : "생성 시작"}
                  </button>
                  <Link
                    href={`/admin/backgrounds/${scenario.id}`}
                    className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    전체 보기
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
