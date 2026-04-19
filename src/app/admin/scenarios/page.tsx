"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

import { getAllScenarios } from "@/lib/scenarios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ScenarioCategory } from "@/types";

const categoryLabel: Record<ScenarioCategory, string> = {
  adventure: "모험",
  "daily-life": "일상생활",
  emotion: "감정/성장",
  celebration: "기념일",
  science: "과학",
};

const categoryStyle: Record<ScenarioCategory, string> = {
  adventure: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  "daily-life": "bg-green-100 text-green-700 hover:bg-green-100",
  emotion: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  celebration: "bg-pink-100 text-pink-700 hover:bg-pink-100",
  science: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
};

type GenderStats = {
  total: number;
  completed: number;
  approved: number;
  generating: number;
  failed: number;
};

type ScenarioStats = { boy: GenderStats; girl: GenderStats };

function readyCount(s: GenderStats | undefined): number {
  if (!s) return 0;
  return s.completed + s.approved;
}

function ProgressLine({
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
  const indicator = done
    ? "bg-emerald-500"
    : tone === "blue"
      ? "bg-blue-500"
      : tone === "violet"
        ? "bg-violet-500"
        : "bg-emerald-500";

  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-medium text-foreground/80">{label}</span>
          {generating > 0 && (
            <span className="inline-flex items-center gap-1 text-blue-600">
              <Loader2 className="size-3 animate-spin" />
              생성 중
            </span>
          )}
        </span>
        <span
          className={cn(
            "tabular-nums",
            done ? "text-emerald-600 font-medium" : "text-muted-foreground"
          )}
        >
          {ready}/{total}
        </span>
      </div>
      <Progress
        value={pct}
        className="h-1.5"
        indicatorClassName={indicator}
      />
    </div>
  );
}

export default function AdminScenariosPage() {
  const scenarios = getAllScenarios();
  const [stats, setStats] = useState<Record<string, ScenarioStats>>({});
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/illustrations");
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
    (s) => s.boy.generating > 0 || s.girl.generating > 0
  );

  useEffect(() => {
    if (!hasGenerating) return;
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [hasGenerating, fetchStats]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">시나리오</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {scenarios.length}개 시나리오 · 남아/여아 일러스트 생성 및 승인 현황
          </p>
        </div>
        {loading && (
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            진행률 불러오는 중
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const s = stats[scenario.id];
          const boyReady = readyCount(s?.boy);
          const girlReady = readyCount(s?.girl);
          const total = scenario.pageCount;
          const allDone = s && boyReady >= total && girlReady >= total;

          return (
            <Link
              key={scenario.id}
              href={`/admin/scenarios/${scenario.id}`}
              className="group block focus-visible:outline-none"
            >
              <Card className="h-full gap-4 transition-shadow hover:shadow-md hover:border-foreground/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base group-hover:text-foreground/80">
                        {scenario.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {scenario.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className={categoryStyle[scenario.category]}
                    >
                      {categoryLabel[scenario.category]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{scenario.targetAge}</span>
                    <span>·</span>
                    <span>{total}페이지</span>
                    {allDone && (
                      <>
                        <span>·</span>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        >
                          모두 완료
                        </Badge>
                      </>
                    )}
                    <ArrowRight className="ml-auto size-3.5 text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:text-foreground/70 transition-all" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <ProgressLine
                      label="남아"
                      ready={boyReady}
                      total={total}
                      generating={s?.boy.generating ?? 0}
                      tone="blue"
                    />
                    <ProgressLine
                      label="여아"
                      ready={girlReady}
                      total={total}
                      generating={s?.girl.generating ?? 0}
                      tone="violet"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
