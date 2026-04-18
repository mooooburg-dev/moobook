"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  RefreshCcw,
  Star,
  StarOff,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { scenarios } from "@/lib/scenarios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ChildGender, ScenarioBackground, ThemeId } from "@/types";

function charImage(bg: ScenarioBackground | undefined, gender: ChildGender) {
  if (!bg) return null;
  return gender === "boy"
    ? bg.character_image_url_boy
    : bg.character_image_url_girl;
}
function charStatus(
  bg: ScenarioBackground | undefined,
  gender: ChildGender
): string {
  if (!bg) return "pending";
  const st =
    gender === "boy" ? bg.character_status_boy : bg.character_status_girl;
  return st ?? "pending";
}
function refUrl(bg: ScenarioBackground | undefined, gender: ChildGender) {
  if (!bg) return null;
  return gender === "boy"
    ? bg.reference_image_url_boy
    : bg.reference_image_url_girl;
}

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
  const scenario = scenarios[scenarioId as ThemeId];

  const [backgrounds, setBackgrounds] = useState<ScenarioBackground[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [regenAllLoading, setRegenAllLoading] = useState(false);
  const [tab, setTab] = useState<"background" | "character">("background");
  const [charAllLoading, setCharAllLoading] = useState(false);
  const [gender, setGender] = useState<ChildGender>("boy");

  const fetchBackgrounds = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/backgrounds?scenarioId=${scenarioId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setBackgrounds(data.backgrounds);
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  const hasGenerating = backgrounds.some(
    (b) => b.status === "generating" || charStatus(b, gender) === "generating"
  );

  const totalPages = scenario?.pageCount ?? 0;

  const bgStats = {
    completed: backgrounds.filter(
      (b) => b.status === "completed" || b.status === "approved"
    ).length,
    approved: backgrounds.filter((b) => b.status === "approved").length,
    generating: backgrounds.filter((b) => b.status === "generating").length,
    failed: backgrounds.filter((b) => b.status === "rejected").length,
  };

  const firstPageBg = backgrounds.find((b) => b.page_number === 1);
  const referenceUrl = refUrl(firstPageBg, gender);
  const firstPageCharStatus = charStatus(firstPageBg, gender);
  const firstPageCharReady =
    !!charImage(firstPageBg, gender) &&
    (firstPageCharStatus === "completed" ||
      firstPageCharStatus === "approved");

  const approvedBgPages = backgrounds.filter((b) => b.status === "approved");
  const charDenom = approvedBgPages.length;
  const charStats = {
    completed: approvedBgPages.filter((b) => {
      const st = charStatus(b, gender);
      return st === "completed" || st === "approved";
    }).length,
    approved: approvedBgPages.filter(
      (b) => charStatus(b, gender) === "approved"
    ).length,
    generating: approvedBgPages.filter(
      (b) => charStatus(b, gender) === "generating"
    ).length,
    failed: approvedBgPages.filter((b) => charStatus(b, gender) === "rejected")
      .length,
  };

  useEffect(() => {
    fetchBackgrounds();
  }, [fetchBackgrounds]);

  useEffect(() => {
    if (!hasGenerating) return;
    const interval = setInterval(fetchBackgrounds, 3000);
    return () => clearInterval(interval);
  }, [hasGenerating, fetchBackgrounds]);

  if (!scenario) {
    return (
      <div className="text-muted-foreground">존재하지 않는 시나리오입니다.</div>
    );
  }

  function getBackground(pageNumber: number): ScenarioBackground | undefined {
    return backgrounds.find((b) => b.page_number === pageNumber);
  }

  async function handleAction(
    pageNumber: number,
    action: "approve" | "reject",
    target: "background" | "character" = "background"
  ) {
    setActionLoading(pageNumber);
    try {
      const res = await fetch("/api/admin/backgrounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          pageNumber,
          action,
          target,
          gender: target === "character" ? gender : undefined,
        }),
      });
      if (res.ok) {
        await fetchBackgrounds();
      } else {
        toast.error("작업 실패");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGenerateFirstPageCharacter() {
    if (firstPageBg?.status !== "approved") {
      toast.warning("1페이지 배경이 승인되어야 해요.");
      return;
    }
    setActionLoading(1);
    try {
      const res = await fetch("/api/admin/generate-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumbers: [1], gender }),
      });
      if (!res.ok) {
        toast.error("1페이지 생성 요청 실패");
        return;
      }
      setBackgrounds((prev) =>
        prev.map((b) =>
          b.page_number === 1
            ? {
                ...b,
                ...(gender === "boy"
                  ? {
                      character_status_boy: "generating",
                      character_image_url_boy: null,
                    }
                  : {
                      character_status_girl: "generating",
                      character_image_url_girl: null,
                    }),
              }
            : b
        )
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGenerateRestCharacters() {
    if (!referenceUrl) {
      toast.warning(
        "레퍼런스가 설정되지 않았어요. 1페이지 캐릭터를 먼저 생성하고 레퍼런스로 설정해 주세요."
      );
      return;
    }
    const targets = backgrounds
      .filter((b) => {
        if (b.page_number === 1) return false;
        if (b.status !== "approved") return false;
        const st = charStatus(b, gender);
        return st !== "completed" && st !== "approved";
      })
      .map((b) => b.page_number);

    if (targets.length === 0) {
      toast.info("생성 대상 페이지가 없어요.");
      return;
    }

    const testTargets = targets.filter((n) => n === 2 || n === 3);
    const willRun = testTargets.length > 0 ? testTargets : targets;

    const msg =
      testTargets.length > 0
        ? `테스트 모드: 2~3페이지(${testTargets.join(", ")})를 레퍼런스 기반으로 생성합니다. 계속할까요?`
        : `${willRun.length}페이지를 레퍼런스 기반으로 생성합니다. 계속할까요?`;

    if (!confirm(msg)) return;

    setCharAllLoading(true);
    try {
      const res = await fetch("/api/admin/generate-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumbers: willRun, gender }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "캐릭터 생성 요청 실패");
        return;
      }
      setBackgrounds((prev) =>
        prev.map((b) =>
          willRun.includes(b.page_number)
            ? {
                ...b,
                ...(gender === "boy"
                  ? {
                      character_status_boy: "generating",
                      character_image_url_boy: null,
                    }
                  : {
                      character_status_girl: "generating",
                      character_image_url_girl: null,
                    }),
              }
            : b
        )
      );
    } finally {
      setCharAllLoading(false);
    }
  }

  async function handleSetReference() {
    setActionLoading(1);
    try {
      const res = await fetch("/api/admin/backgrounds/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, gender }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "레퍼런스 설정 실패");
        return;
      }
      await fetchBackgrounds();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClearReference() {
    if (
      !confirm("레퍼런스를 해제하면 2페이지 이후 생성이 차단됩니다. 계속할까요?")
    ) {
      return;
    }
    setActionLoading(1);
    try {
      const res = await fetch(
        `/api/admin/backgrounds/reference?scenarioId=${scenarioId}&gender=${gender}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        toast.error("레퍼런스 해제 실패");
        return;
      }
      await fetchBackgrounds();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRegenerateCharacter(pageNumber: number) {
    if (pageNumber !== 1 && !referenceUrl) {
      toast.warning(
        "레퍼런스가 설정되지 않았어요. 1페이지 캐릭터를 먼저 생성하고 레퍼런스로 설정해 주세요."
      );
      return;
    }
    setActionLoading(pageNumber);
    try {
      await fetch("/api/admin/backgrounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          pageNumber,
          action: "reset",
          target: "character",
          gender,
        }),
      });
      const res = await fetch("/api/admin/generate-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumbers: [pageNumber], gender }),
      });
      if (!res.ok) {
        toast.error("재생성 요청 실패");
        return;
      }
      setBackgrounds((prev) =>
        prev.map((b) =>
          b.page_number === pageNumber
            ? {
                ...b,
                ...(gender === "boy"
                  ? {
                      character_status_boy: "generating",
                      character_image_url_boy: null,
                    }
                  : {
                      character_status_girl: "generating",
                      character_image_url_girl: null,
                    }),
              }
            : b
        )
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRegenerateAll() {
    if (
      !confirm(
        `[${scenario.title}] 12페이지 전체를 삭제하고 다시 생성합니다. 계속할까요?`
      )
    ) {
      return;
    }

    setRegenAllLoading(true);
    try {
      const delRes = await fetch(
        `/api/admin/backgrounds?scenarioId=${scenarioId}`,
        { method: "DELETE" }
      );
      if (!delRes.ok) {
        toast.error("기존 데이터 삭제 실패");
        return;
      }

      const genRes = await fetch("/api/admin/generate-backgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (!genRes.ok) {
        toast.error("생성 시작 실패");
        return;
      }

      await fetchBackgrounds();
    } finally {
      setRegenAllLoading(false);
    }
  }

  async function handleRegenerate(pageNumber: number) {
    setActionLoading(pageNumber);
    try {
      await fetch("/api/admin/backgrounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumber, action: "reset" }),
      });

      const res = await fetch("/api/admin/generate-backgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (!res.ok) {
        toast.error("재생성 요청 실패");
      }
      await fetchBackgrounds();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/admin/scenarios/${scenarioId}`)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-4" />
            목록으로
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {scenario.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {scenarioId} · {scenario.pageCount}페이지
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {tab === "background" ? (
            <Button
              variant="destructive"
              onClick={handleRegenerateAll}
              disabled={regenAllLoading || hasGenerating}
            >
              {(regenAllLoading || hasGenerating) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {regenAllLoading
                ? "시작하는 중..."
                : hasGenerating
                  ? "생성 중..."
                  : "배경 전체 재생성"}
            </Button>
          ) : (
            <>
              <GenderToggle value={gender} onChange={setGender} />
              <Button
                onClick={handleGenerateFirstPageCharacter}
                disabled={
                  !!actionLoading ||
                  hasGenerating ||
                  firstPageBg?.status !== "approved" ||
                  firstPageCharReady === true
                }
                title={
                  firstPageCharReady
                    ? "1페이지는 이미 완료됨"
                    : "1페이지 캐릭터 생성"
                }
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                {actionLoading === 1 && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                1페이지 생성
              </Button>
              <Button
                onClick={handleGenerateRestCharacters}
                disabled={charAllLoading || hasGenerating || !referenceUrl}
                title={
                  !referenceUrl
                    ? "레퍼런스를 먼저 설정해 주세요"
                    : "2페이지 이후 레퍼런스 기반 일괄 생성"
                }
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {(charAllLoading || hasGenerating) && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {charAllLoading
                  ? "시작하는 중..."
                  : hasGenerating
                    ? "합성 중..."
                    : "2p~ 일괄 합성"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "background" | "character")}
      >
        <TabsList>
          <TabsTrigger value="background">배경</TabsTrigger>
          <TabsTrigger value="character">캐릭터 합성</TabsTrigger>
        </TabsList>

        <TabsContent value="background" className="mt-4 flex flex-col gap-6">
          <ProgressPanel
            label="배경 생성 진행률"
            completed={bgStats.completed}
            total={totalPages}
            approved={bgStats.approved}
            generating={bgStats.generating}
            failed={bgStats.failed}
            isRunning={hasGenerating}
            etaSecondsPerPage={60}
            accentClass="bg-blue-500"
          />

          {loading ? (
            <div className="text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> 로딩 중...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenario.pages.map((page) => {
                const bg = getBackground(page.pageNumber);
                const isLoading = actionLoading === page.pageNumber;
                const status = bg?.status ?? "pending";
                const hasImage = bg?.image_url && status !== "pending";

                return (
                  <Card key={page.pageNumber} className="overflow-hidden p-0 gap-0">
                    <div
                      className={cn(
                        "relative aspect-3/4 bg-muted",
                        hasImage && "cursor-pointer"
                      )}
                      onClick={() =>
                        hasImage &&
                        bg?.image_url &&
                        setModalImage(bg.image_url)
                      }
                    >
                      {hasImage && bg?.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={bg.image_url}
                          alt={`Page ${page.pageNumber}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/60 text-sm">
                          {status === "generating" ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="size-6 animate-spin text-blue-500" />
                              <span>생성 중...</span>
                            </div>
                          ) : (
                            "미생성"
                          )}
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
                        P{page.pageNumber}
                      </div>
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={status} />
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {page.sceneDescription}
                      </p>
                      {(status === "completed" || status === "rejected") && (
                        <div className="flex gap-2">
                          {status === "completed" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAction(page.pageNumber, "approve")
                              }
                              disabled={isLoading}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              승인
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRegenerate(page.pageNumber)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <RefreshCcw className="size-3.5" />
                            재생성
                          </Button>
                        </div>
                      )}
                      {status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRegenerate(page.pageNumber)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          <RefreshCcw className="size-3.5" />
                          재생성
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="character" className="mt-4 flex flex-col gap-6">
          <Card
            className={cn(
              "py-3 border",
              referenceUrl
                ? "bg-amber-50 border-amber-200"
                : "bg-muted/50"
            )}
          >
            <CardContent className="flex items-center gap-2 text-xs">
              <Star
                className={cn(
                  "size-4",
                  referenceUrl ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                )}
              />
              {referenceUrl ? (
                <span className="text-amber-800">
                  레퍼런스 설정됨 — 2페이지 이후는 이 이미지를 기준으로 생성돼요.
                </span>
              ) : (
                <span className="text-muted-foreground">
                  레퍼런스 미설정 — 1페이지 캐릭터를 먼저 생성한 뒤 &quot;레퍼런스로 설정&quot; 버튼을 눌러 주세요.
                </span>
              )}
            </CardContent>
          </Card>

          <ProgressPanel
            label="캐릭터 합성 진행률"
            completed={charStats.completed}
            total={charDenom}
            approved={charStats.approved}
            generating={charStats.generating}
            failed={charStats.failed}
            isRunning={hasGenerating}
            etaSecondsPerPage={45}
            accentClass="bg-indigo-500"
            emptyHint={
              charDenom === 0
                ? "승인된 배경이 없어요. 배경을 먼저 승인해 주세요."
                : undefined
            }
          />

          {loading ? (
            <div className="text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> 로딩 중...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenario.pages.map((page) => {
                const bg = getBackground(page.pageNumber);
                const isLoading = actionLoading === page.pageNumber;
                const bgApproved = bg?.status === "approved";
                const charStatusVal = charStatus(bg, gender);
                const charImageUrl = charImage(bg, gender);
                const hasChar = !!charImageUrl && charStatusVal !== "pending";

                return (
                  <Card key={page.pageNumber} className="overflow-hidden p-0 gap-0">
                    <div className="grid grid-cols-2 gap-px bg-border">
                      <div
                        className="relative aspect-3/4 bg-muted cursor-pointer"
                        onClick={() =>
                          bg?.image_url && setModalImage(bg.image_url)
                        }
                      >
                        {bg?.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={bg.image_url}
                            alt={`Background p${page.pageNumber}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground/60 text-xs">
                            배경 없음
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                          배경
                        </div>
                      </div>

                      <div
                        className={cn(
                          "relative aspect-3/4 bg-muted overflow-hidden",
                          hasChar && "cursor-pointer"
                        )}
                        onClick={() =>
                          hasChar &&
                          charImageUrl &&
                          setModalImage(charImageUrl)
                        }
                      >
                        {hasChar && charImageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={charImageUrl}
                            src={charImageUrl}
                            alt={`Character p${page.pageNumber}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : charStatusVal === "generating" && bg?.image_url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={bg.image_url}
                              alt={`Background p${page.pageNumber}`}
                              className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm brightness-75"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                              <Loader2 className="size-7 animate-spin" />
                              <span className="text-xs font-medium drop-shadow">
                                캐릭터 합성 중
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground/60 text-xs">
                            {charStatusVal === "generating" ? (
                              <div className="flex flex-col items-center gap-1">
                                <Loader2 className="size-5 animate-spin text-indigo-500" />
                                <span>생성 중</span>
                              </div>
                            ) : (
                              "미생성"
                            )}
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-indigo-600/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                          캐릭터
                        </div>
                        {page.pageNumber === 1 && referenceUrl && (
                          <div
                            className="absolute top-1 right-1 inline-flex items-center gap-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow"
                            title="이 이미지가 2p~ 생성의 레퍼런스로 사용돼요"
                          >
                            <Star className="size-3 fill-amber-900" />
                            REF
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium">
                          P{page.pageNumber}
                        </div>
                        <StatusBadge status={charStatusVal} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {page.sceneDescription}
                      </p>

                      {!bgApproved && (
                        <p className="text-[11px] text-amber-600">
                          배경이 승인되어야 캐릭터를 생성할 수 있어요.
                        </p>
                      )}

                      {page.pageNumber !== 1 &&
                        bgApproved &&
                        !referenceUrl &&
                        charStatusVal !== "generating" && (
                          <p className="text-[11px] text-amber-600">
                            레퍼런스가 설정되어야 이 페이지를 생성할 수 있어요.
                          </p>
                        )}

                      {bgApproved && charStatusVal === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleRegenerateCharacter(page.pageNumber)
                          }
                          disabled={
                            isLoading ||
                            (page.pageNumber !== 1 && !referenceUrl)
                          }
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          캐릭터 생성
                        </Button>
                      )}

                      {page.pageNumber === 1 && firstPageCharReady && (
                        <>
                          {referenceUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleClearReference}
                              disabled={isLoading}
                              className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                            >
                              <StarOff className="size-3.5" />
                              레퍼런스 해제
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={handleSetReference}
                              disabled={isLoading}
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              <Star className="size-3.5" />
                              레퍼런스로 설정
                            </Button>
                          )}
                        </>
                      )}

                      {(charStatusVal === "completed" ||
                        charStatusVal === "rejected") && (
                        <div className="flex gap-2">
                          {charStatusVal === "completed" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAction(
                                  page.pageNumber,
                                  "approve",
                                  "character"
                                )
                              }
                              disabled={isLoading}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              승인
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRegenerateCharacter(page.pageNumber)
                            }
                            disabled={isLoading || !bgApproved}
                            className="flex-1"
                          >
                            <RefreshCcw className="size-3.5" />
                            재생성
                          </Button>
                        </div>
                      )}

                      {charStatusVal === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleRegenerateCharacter(page.pageNumber)
                          }
                          disabled={isLoading || !bgApproved}
                          className="w-full"
                        >
                          <RefreshCcw className="size-3.5" />
                          재생성
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!modalImage}
        onOpenChange={(open) => !open && setModalImage(null)}
      >
        <DialogContent
          className="max-w-3xl p-2 bg-transparent border-0 shadow-none"
          showCloseButton={false}
        >
          {modalImage && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalImage}
                alt="원본 이미지"
                className="rounded-lg object-contain max-h-[85vh] w-auto mx-auto"
              />
              <button
                onClick={() => setModalImage(null)}
                className="absolute -top-3 -right-3 size-8 bg-white rounded-full shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GenderToggle({
  value,
  onChange,
}: {
  value: ChildGender;
  onChange: (g: ChildGender) => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-background overflow-hidden">
      <button
        onClick={() => onChange("boy")}
        className={cn(
          "px-3 text-sm font-medium transition-colors cursor-pointer",
          value === "boy"
            ? "bg-blue-600 text-white"
            : "text-foreground hover:bg-muted"
        )}
      >
        👦 남아
      </button>
      <button
        onClick={() => onChange("girl")}
        className={cn(
          "px-3 text-sm font-medium transition-colors cursor-pointer",
          value === "girl"
            ? "bg-pink-500 text-white"
            : "text-foreground hover:bg-muted"
        )}
      >
        👧 여아
      </button>
    </div>
  );
}

function ProgressPanel({
  label,
  completed,
  total,
  approved,
  generating,
  failed,
  isRunning,
  etaSecondsPerPage,
  accentClass,
  emptyHint,
}: {
  label: string;
  completed: number;
  total: number;
  approved: number;
  generating: number;
  failed: number;
  isRunning: boolean;
  etaSecondsPerPage: number;
  accentClass: string;
  emptyHint?: string;
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(total - completed, 0);
  const etaMinutes = Math.ceil((remaining * etaSecondsPerPage) / 60);

  return (
    <Card className="py-4 gap-3">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">{label}</CardTitle>
            {isRunning && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
                <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                진행 중
              </span>
            )}
          </div>
          <div className="text-sm tabular-nums">
            <span className="font-semibold">{completed}</span>
            <span className="text-muted-foreground"> / {total}</span>
            <span className="ml-2 text-muted-foreground">({percent}%)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 flex flex-col gap-3">
        <Progress
          value={percent}
          className="h-2"
          indicatorClassName={accentClass}
        />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            승인 {approved}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            완료 {completed - approved}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
            생성 중 {generating}
          </span>
          {failed > 0 && (
            <span className="inline-flex items-center gap-1.5 text-red-600">
              <span className="size-2 rounded-full bg-red-500" />
              실패 {failed}
            </span>
          )}
          {isRunning && remaining > 0 && (
            <span className="ml-auto">남은 시간 약 {etaMinutes}분</span>
          )}
          {!isRunning && emptyHint && (
            <span className="ml-auto text-amber-600">{emptyHint}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
