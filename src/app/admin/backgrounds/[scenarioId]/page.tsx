"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { scenarios } from "@/lib/scenarios";
import type { ScenarioBackground, ThemeId } from "@/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-gray-100 text-gray-600" },
  generating: { label: "생성 중", color: "bg-blue-100 text-blue-700 animate-pulse" },
  completed: { label: "완료", color: "bg-green-100 text-green-700" },
  approved: { label: "승인됨", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "거부됨", color: "bg-red-100 text-red-700" },
};

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
    (b) => b.status === "generating" || b.character_status === "generating"
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
  const referenceUrl = firstPageBg?.reference_image_url ?? null;
  const firstPageCharReady =
    firstPageBg?.character_image_url &&
    (firstPageBg.character_status === "completed" ||
      firstPageBg.character_status === "approved");

  const approvedBgPages = backgrounds.filter((b) => b.status === "approved");
  const charDenom = approvedBgPages.length;
  const charStats = {
    completed: approvedBgPages.filter(
      (b) =>
        b.character_status === "completed" ||
        b.character_status === "approved"
    ).length,
    approved: approvedBgPages.filter(
      (b) => b.character_status === "approved"
    ).length,
    generating: approvedBgPages.filter(
      (b) => b.character_status === "generating"
    ).length,
    failed: approvedBgPages.filter((b) => b.character_status === "rejected")
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
      <div className="text-gray-500">존재하지 않는 시나리오입니다.</div>
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
        body: JSON.stringify({ scenarioId, pageNumber, action, target }),
      });
      if (res.ok) {
        await fetchBackgrounds();
      } else {
        alert("작업 실패");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGenerateFirstPageCharacter() {
    if (firstPageBg?.status !== "approved") {
      alert("1페이지 배경이 승인되어야 해요.");
      return;
    }
    setActionLoading(1);
    try {
      const res = await fetch("/api/admin/generate-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumbers: [1] }),
      });
      if (!res.ok) {
        alert("1페이지 생성 요청 실패");
        return;
      }
      setBackgrounds((prev) =>
        prev.map((b) =>
          b.page_number === 1
            ? { ...b, character_status: "generating", character_image_url: null }
            : b
        )
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGenerateRestCharacters() {
    if (!referenceUrl) {
      alert(
        "레퍼런스가 설정되지 않았어요. 1페이지 캐릭터를 먼저 생성하고 레퍼런스로 설정해 주세요."
      );
      return;
    }
    const targets = backgrounds
      .filter(
        (b) =>
          b.page_number !== 1 &&
          b.status === "approved" &&
          b.character_status !== "completed" &&
          b.character_status !== "approved"
      )
      .map((b) => b.page_number);

    if (targets.length === 0) {
      alert("생성 대상 페이지가 없어요.");
      return;
    }

    // 테스트 단계: 2~3페이지만
    const testTargets = targets.filter((n) => n === 2 || n === 3);
    const willRun = testTargets.length > 0 ? testTargets : targets;

    const msg =
      testTargets.length > 0
        ? `테스트 모드: 2~3페이지(${testTargets.join(", ")})를 레퍼런스 기반으로 생성합니다.\n계속하시겠습니까?`
        : `${willRun.length}페이지를 레퍼런스 기반으로 생성합니다.\n계속하시겠습니까?`;

    if (!confirm(msg)) return;

    setCharAllLoading(true);
    try {
      const res = await fetch("/api/admin/generate-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumbers: willRun }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "캐릭터 생성 요청 실패");
        return;
      }
      setBackgrounds((prev) =>
        prev.map((b) =>
          willRun.includes(b.page_number)
            ? { ...b, character_status: "generating", character_image_url: null }
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
        body: JSON.stringify({ scenarioId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "레퍼런스 설정 실패");
        return;
      }
      await fetchBackgrounds();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClearReference() {
    if (!confirm("레퍼런스를 해제하면 2페이지 이후 생성이 차단됩니다.\n계속할까요?")) {
      return;
    }
    setActionLoading(1);
    try {
      const res = await fetch(
        `/api/admin/backgrounds/reference?scenarioId=${scenarioId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        alert("레퍼런스 해제 실패");
        return;
      }
      await fetchBackgrounds();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRegenerateCharacter(pageNumber: number) {
    if (pageNumber !== 1 && !referenceUrl) {
      alert(
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
        }),
      });
      const res = await fetch("/api/admin/generate-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumbers: [pageNumber] }),
      });
      if (!res.ok) {
        alert("재생성 요청 실패");
        return;
      }
      // 낙관적 업데이트: 이 상태가 hasGenerating=true를 만들어 3초 폴링을 가동시킴.
      // 여기서 fetchBackgrounds()를 호출하면 서버의 아직 비동기 반영 전 pending 상태로
      // 덮어쓰여 폴링이 시작되지 않는 레이스가 발생하므로 호출하지 않는다.
      setBackgrounds((prev) =>
        prev.map((b) =>
          b.page_number === pageNumber
            ? {
                ...b,
                character_status: "generating",
                character_image_url: null,
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
        `[${scenario.title}] 12페이지 전체를 삭제하고 다시 생성합니다.\n계속하시겠습니까?`
      )
    ) {
      return;
    }

    setRegenAllLoading(true);
    try {
      // 1. 기존 레코드 전체 삭제
      const delRes = await fetch(
        `/api/admin/backgrounds?scenarioId=${scenarioId}`,
        { method: "DELETE" }
      );
      if (!delRes.ok) {
        alert("기존 데이터 삭제 실패");
        return;
      }

      // 2. 생성 시작
      const genRes = await fetch("/api/admin/generate-backgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (!genRes.ok) {
        alert("생성 시작 실패");
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
      // 해당 페이지를 pending으로 리셋한 후 생성 트리거
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
        alert("재생성 요청 실패");
      }
      await fetchBackgrounds();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <button
            onClick={() => router.push(`/admin/scenarios/${scenarioId}`)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            &larr; 목록으로
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{scenario.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {scenarioId} · {scenario.pageCount}페이지
          </p>
        </div>
        <div className="flex gap-2">
          {tab === "background" ? (
            <button
              onClick={handleRegenerateAll}
              disabled={regenAllLoading || hasGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {(regenAllLoading || hasGenerating) && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {regenAllLoading
                ? "시작하는 중..."
                : hasGenerating
                  ? "생성 중..."
                  : "배경 전체 재생성"}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === 1 && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                1페이지 생성
              </button>
              <button
                onClick={handleGenerateRestCharacters}
                disabled={charAllLoading || hasGenerating || !referenceUrl}
                title={
                  !referenceUrl
                    ? "레퍼런스를 먼저 설정해 주세요"
                    : "2페이지 이후 레퍼런스 기반 일괄 생성"
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {(charAllLoading || hasGenerating) && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {charAllLoading
                  ? "시작하는 중..."
                  : hasGenerating
                    ? "합성 중..."
                    : "2p~ 일괄 합성"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-4 inline-flex rounded-md border border-gray-300 overflow-hidden">
        <button
          onClick={() => setTab("background")}
          className={`px-4 py-1.5 text-sm ${
            tab === "background"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          배경
        </button>
        <button
          onClick={() => setTab("character")}
          className={`px-4 py-1.5 text-sm ${
            tab === "character"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          캐릭터 합성
        </button>
      </div>

      {/* 진행률 패널 */}
      {tab === "background" ? (
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
      ) : (
        <>
          <div
            className={`mb-3 rounded-md border px-3 py-2 text-xs flex items-center gap-2 ${
              referenceUrl
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <span className="text-base">⭐</span>
            {referenceUrl ? (
              <span>
                레퍼런스 설정됨 — 2페이지 이후는 이 이미지를 기준으로 생성돼요.
              </span>
            ) : (
              <span>
                레퍼런스 미설정 — 1페이지 캐릭터를 먼저 생성한 뒤
                &quot;레퍼런스로 설정&quot; 버튼을 눌러 주세요.
              </span>
            )}
          </div>
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
        </>
      )}

      {loading ? (
        <div className="text-gray-400">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenario.pages.map((page) => {
            const bg = getBackground(page.pageNumber);
            const isLoading = actionLoading === page.pageNumber;

            if (tab === "background") {
              const status = bg?.status ?? "pending";
              const config = statusConfig[status];
              const hasImage = bg?.image_url && status !== "pending";

              return (
                <div
                  key={page.pageNumber}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div
                    className={`relative aspect-3/4 bg-gray-50 ${
                      hasImage ? "cursor-pointer" : ""
                    }`}
                    onClick={() =>
                      hasImage && bg?.image_url && setModalImage(bg.image_url)
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
                      <div className="flex items-center justify-center h-full text-gray-300 text-sm">
                        {status === "generating" ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
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
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {page.sceneDescription}
                    </p>
                    {(status === "completed" || status === "rejected") && (
                      <div className="flex gap-2">
                        {status === "completed" && (
                          <button
                            onClick={() =>
                              handleAction(page.pageNumber, "approve")
                            }
                            disabled={isLoading}
                            className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            승인
                          </button>
                        )}
                        <button
                          onClick={() => handleRegenerate(page.pageNumber)}
                          disabled={isLoading}
                          className="flex-1 px-2 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          재생성
                        </button>
                      </div>
                    )}
                    {status === "approved" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRegenerate(page.pageNumber)}
                          disabled={isLoading}
                          className="flex-1 px-2 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          재생성
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // character 탭
            const bgApproved = bg?.status === "approved";
            const charStatus = bg?.character_status ?? "pending";
            const charConfig = statusConfig[charStatus];
            const hasChar =
              bg?.character_image_url && charStatus !== "pending";

            return (
              <div
                key={page.pageNumber}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* 배경 vs 캐릭터 합성 나란히 */}
                <div className="grid grid-cols-2 gap-px bg-gray-200">
                  <div
                    className="relative aspect-3/4 bg-gray-50 cursor-pointer"
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
                      <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                        배경 없음
                      </div>
                    )}
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      배경
                    </div>
                  </div>

                  <div
                    className={`relative aspect-3/4 bg-gray-50 overflow-hidden ${
                      hasChar ? "cursor-pointer" : ""
                    }`}
                    onClick={() =>
                      hasChar &&
                      bg?.character_image_url &&
                      setModalImage(bg.character_image_url)
                    }
                  >
                    {hasChar && bg?.character_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={bg.character_image_url}
                        src={bg.character_image_url}
                        alt={`Character p${page.pageNumber}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : charStatus === "generating" && bg?.image_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bg.image_url}
                          alt={`Background p${page.pageNumber}`}
                          className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm brightness-75"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                          <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium drop-shadow">
                            캐릭터 합성 중
                          </span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                          <div className="h-full w-full bg-indigo-400/80 animate-pulse" />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                        {charStatus === "generating" ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
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
                        className="absolute top-1 right-1 bg-amber-400 text-amber-900 text-[11px] font-bold px-1.5 py-0.5 rounded shadow"
                        title="이 이미지가 2p~ 생성의 레퍼런스로 사용돼요"
                      >
                        ⭐ REF
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-gray-700">
                      P{page.pageNumber}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${charConfig.color}`}
                    >
                      {charConfig.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {page.sceneDescription}
                  </p>

                  {!bgApproved && (
                    <p className="text-[11px] text-amber-600 mb-2">
                      배경이 승인되어야 캐릭터를 생성할 수 있어요.
                    </p>
                  )}

                  {page.pageNumber !== 1 &&
                    bgApproved &&
                    !referenceUrl &&
                    charStatus !== "generating" && (
                      <p className="text-[11px] text-amber-600 mb-2">
                        레퍼런스가 설정되어야 이 페이지를 생성할 수 있어요.
                      </p>
                    )}

                  {bgApproved && charStatus === "pending" && (
                    <button
                      onClick={() => handleRegenerateCharacter(page.pageNumber)}
                      disabled={
                        isLoading ||
                        (page.pageNumber !== 1 && !referenceUrl)
                      }
                      className="w-full px-2 py-1.5 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      캐릭터 생성
                    </button>
                  )}

                  {/* 1페이지 전용: 레퍼런스 설정 / 해제 */}
                  {page.pageNumber === 1 && firstPageCharReady && (
                    <div className="mt-2">
                      {referenceUrl ? (
                        <button
                          onClick={handleClearReference}
                          disabled={isLoading}
                          className="w-full px-2 py-1.5 text-xs font-medium rounded border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                        >
                          ⭐ 레퍼런스 해제
                        </button>
                      ) : (
                        <button
                          onClick={handleSetReference}
                          disabled={isLoading}
                          className="w-full px-2 py-1.5 text-xs font-medium rounded bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                        >
                          ⭐ 레퍼런스로 설정
                        </button>
                      )}
                    </div>
                  )}

                  {(charStatus === "completed" || charStatus === "rejected") && (
                    <div className="flex gap-2">
                      {charStatus === "completed" && (
                        <button
                          onClick={() =>
                            handleAction(
                              page.pageNumber,
                              "approve",
                              "character"
                            )
                          }
                          disabled={isLoading}
                          className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          승인
                        </button>
                      )}
                      <button
                        onClick={() => handleRegenerateCharacter(page.pageNumber)}
                        disabled={isLoading || !bgApproved}
                        className="flex-1 px-2 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        재생성
                      </button>
                    </div>
                  )}

                  {charStatus === "approved" && (
                    <button
                      onClick={() => handleRegenerateCharacter(page.pageNumber)}
                      disabled={isLoading || !bgApproved}
                      className="w-full px-2 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      재생성
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 이미지 모달 */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-8"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-3xl max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modalImage}
              alt="원본 이미지"
              className="rounded-lg object-contain max-h-[90vh] w-auto"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
          </div>
        </div>
      )}
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
    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              진행 중
            </span>
          )}
        </div>
        <div className="text-sm tabular-nums text-gray-700">
          <span className="font-semibold">{completed}</span>
          <span className="text-gray-400"> / {total}</span>
          <span className="ml-2 text-gray-500">({percent}%)</span>
        </div>
      </div>

      <div className="relative h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${accentClass} transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
        {isRunning && (
          <div
            className="absolute inset-y-0 bg-white/40 animate-pulse"
            style={{
              left: `${percent}%`,
              width: total > 0 ? `${(1 / total) * 100}%` : "0%",
            }}
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          승인 {approved}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          완료 {completed - approved}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          생성 중 {generating}
        </span>
        {failed > 0 && (
          <span className="inline-flex items-center gap-1.5 text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            실패 {failed}
          </span>
        )}
        {isRunning && remaining > 0 && (
          <span className="ml-auto text-gray-400">
            남은 시간 약 {etaMinutes}분
          </span>
        )}
        {!isRunning && emptyHint && (
          <span className="ml-auto text-amber-600">{emptyHint}</span>
        )}
      </div>
    </div>
  );
}
