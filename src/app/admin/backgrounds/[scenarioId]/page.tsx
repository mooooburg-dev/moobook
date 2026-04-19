"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { scenarios, type PresetThemeId } from "@/lib/scenarios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ChildGender, IllustrationStatus, ScenarioIllustration } from "@/types";

const statusBadge: Record<
  string,
  { label: string; className: string; pulse?: boolean }
> = {
  pending: {
    label: "대기",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
  generating: {
    label: "생성 중",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    pulse: true,
  },
  completed: {
    label: "완료",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  approved: {
    label: "승인됨",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  rejected: {
    label: "거부됨",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusBadge[status] ?? statusBadge.pending;
  return (
    <Badge
      variant="secondary"
      className={cn("border-0", cfg.className, cfg.pulse && "animate-pulse")}
    >
      {cfg.label}
    </Badge>
  );
}

export default function AdminBackgroundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.scenarioId as string;
  const scenario = scenarios[scenarioId as PresetThemeId];

  const [illustrations, setIllustrations] = useState<ScenarioIllustration[]>([]);
  const [gender, setGender] = useState<ChildGender>("boy");
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/illustrations?scenarioId=${scenarioId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setIllustrations((data.illustrations ?? []) as ScenarioIllustration[]);
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentRows = useMemo(
    () => illustrations.filter((row) => row.gender === gender),
    [illustrations, gender]
  );
  const byPage = useMemo(() => {
    const map = new Map<number, ScenarioIllustration>();
    for (const row of currentRows) {
      map.set(row.page_number, row);
    }
    return map;
  }, [currentRows]);

  const stats = useMemo(() => {
    const s = {
      total: scenario?.pageCount ?? 12,
      completed: 0,
      approved: 0,
      generating: 0,
      failed: 0,
    };
    for (const row of currentRows) {
      if (row.status === "completed") s.completed++;
      else if (row.status === "approved") s.approved++;
      else if (row.status === "generating") s.generating++;
      else if (row.status === "rejected") s.failed++;
    }
    return s;
  }, [currentRows, scenario]);

  const ready = stats.completed + stats.approved;
  const pct = stats.total === 0 ? 0 : (ready / stats.total) * 100;
  const hasGenerating = stats.generating > 0;

  useEffect(() => {
    if (!hasGenerating) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [hasGenerating, fetchData]);

  const handleAction = async (
    pageNumber: number,
    action: "approve" | "reject" | "reset"
  ) => {
    setActionLoading(pageNumber);
    try {
      const res = await fetch("/api/admin/illustrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          pageNumber,
          gender,
          action,
        }),
      });
      if (!res.ok) throw new Error("실패");
      const labels = {
        approve: "승인했어요",
        reject: "거부했어요",
        reset: "상태를 초기화했어요",
      };
      toast.success(labels[action]);
      fetchData();
    } catch {
      toast.error("요청 실패");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateAll = async () => {
    setBatchLoading(true);
    try {
      const res = await fetch("/api/admin/generate-illustrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, gender }),
      });
      if (!res.ok) throw new Error("실패");
      toast.success(`${gender === "boy" ? "남아" : "여아"} 전체 생성 시작`);
      fetchData();
    } catch {
      toast.error("요청 실패");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleRegenerate = async (pageNumber: number) => {
    setActionLoading(pageNumber);
    try {
      const res = await fetch("/api/admin/generate-illustrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          gender,
          pageNumbers: [pageNumber],
        }),
      });
      if (!res.ok) throw new Error("실패");
      toast.success(`${pageNumber}페이지 재생성 시작`);
      fetchData();
    } catch {
      toast.error("요청 실패");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`${gender === "boy" ? "남아" : "여아"} 전체 이미지를 삭제할까요? 되돌릴 수 없습니다.`))
      return;
    setBatchLoading(true);
    try {
      const res = await fetch(
        `/api/admin/illustrations?scenarioId=${scenarioId}&gender=${gender}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("실패");
      toast.success("삭제했어요");
      fetchData();
    } catch {
      toast.error("요청 실패");
    } finally {
      setBatchLoading(false);
    }
  };

  if (!scenario) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        시나리오를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/scenarios")}
          className="mb-3 -ml-2"
        >
          <ChevronLeft className="size-4" />
          시나리오 목록
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {scenario.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {scenario.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border p-0.5">
              <button
                type="button"
                onClick={() => setGender("boy")}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-sm transition",
                  gender === "boy"
                    ? "bg-blue-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                👦 남아
              </button>
              <button
                type="button"
                onClick={() => setGender("girl")}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-sm transition",
                  gender === "girl"
                    ? "bg-pink-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                👧 여아
              </button>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">
                {gender === "boy" ? "남아" : "여아"} 일러스트 진행률
              </CardTitle>
              {hasGenerating && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="size-3 animate-spin" />
                  생성 중
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleGenerateAll}
                disabled={batchLoading || hasGenerating}
              >
                {batchLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCcw className="size-4" />
                )}
                {gender === "boy" ? "남아" : "여아"} 전체 생성
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteAll}
                disabled={batchLoading || hasGenerating}
              >
                전체 삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                승인 {stats.approved} · 완료 {stats.completed} · 생성중{" "}
                {stats.generating} · 실패 {stats.failed}
              </span>
              <span className="font-medium text-foreground">
                {ready}/{stats.total}
              </span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin inline mr-2" />
          불러오는 중
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {scenario.pages.map((page) => {
            const row = byPage.get(page.pageNumber);
            const status: IllustrationStatus =
              row?.status ?? "pending";
            const imageUrl = row?.image_url ?? null;
            const isFirstPage = page.pageNumber === 1;
            const canApprove = status === "completed";
            const canRegenerate =
              status === "completed" ||
              status === "approved" ||
              status === "rejected" ||
              status === "pending";

            return (
              <Card key={page.pageNumber} className="overflow-hidden">
                <div
                  className="relative aspect-3/4 bg-muted cursor-pointer"
                  onClick={() => imageUrl && setModalImage(imageUrl)}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={`page ${page.pageNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      이미지 없음
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={status} />
                  </div>
                  <div className="absolute top-2 right-2 size-7 rounded-full bg-white/90 text-foreground text-xs font-bold flex items-center justify-center shadow">
                    {page.pageNumber}
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {page.sceneDescription}
                  </p>
                  {isFirstPage && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1 leading-snug">
                      ⚠️ 1페이지를 재생성하면 2~12페이지도 다시 생성해야
                      캐릭터 일관성이 맞습니다.
                    </p>
                  )}
                  <div className="flex gap-1.5">
                    {canApprove && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1 h-7 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                        disabled={actionLoading === page.pageNumber}
                        onClick={() => handleAction(page.pageNumber, "approve")}
                      >
                        승인
                      </Button>
                    )}
                    {status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1 h-7"
                        disabled={actionLoading === page.pageNumber}
                        onClick={() => handleAction(page.pageNumber, "reset")}
                      >
                        승인 해제
                      </Button>
                    )}
                    {canRegenerate && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1 h-7"
                        disabled={
                          actionLoading === page.pageNumber ||
                          hasGenerating
                        }
                        onClick={() => handleRegenerate(page.pageNumber)}
                      >
                        {actionLoading === page.pageNumber ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "재생성"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!modalImage}
        onOpenChange={(open) => !open && setModalImage(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {modalImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={modalImage} alt="preview" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
