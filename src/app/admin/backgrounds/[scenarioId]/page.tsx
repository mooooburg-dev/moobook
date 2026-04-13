"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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

  useEffect(() => {
    fetchBackgrounds();
    const interval = setInterval(fetchBackgrounds, 5000);
    return () => clearInterval(interval);
  }, [fetchBackgrounds]);

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
    action: "approve" | "reject"
  ) {
    setActionLoading(pageNumber);
    try {
      const res = await fetch("/api/admin/backgrounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumber, action }),
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

  async function handleRegenerate(pageNumber: number) {
    setActionLoading(pageNumber);
    try {
      // 해당 페이지를 pending으로 리셋한 후 생성 트리거
      await fetch("/api/admin/backgrounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, pageNumber, action: "reject" }),
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
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/backgrounds")}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; 목록으로
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{scenario.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {scenarioId} · {scenario.pageCount}페이지
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenario.pages.map((page) => {
            const bg = getBackground(page.pageNumber);
            const status = bg?.status ?? "pending";
            const config = statusConfig[status];
            const hasImage = bg?.image_url && status !== "pending";
            const isLoading = actionLoading === page.pageNumber;

            return (
              <div
                key={page.pageNumber}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* 이미지 영역 */}
                <div
                  className={`relative aspect-[3/4] bg-gray-50 ${
                    hasImage ? "cursor-pointer" : ""
                  }`}
                  onClick={() => hasImage && bg?.image_url && setModalImage(bg.image_url)}
                >
                  {hasImage && bg?.image_url ? (
                    <Image
                      src={bg.image_url}
                      alt={`Page ${page.pageNumber}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

                  {/* 페이지 번호 */}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
                    P{page.pageNumber}
                  </div>

                  {/* 상태 뱃지 */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* 정보 영역 */}
                <div className="p-3">
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {page.sceneDescription}
                  </p>

                  {/* 액션 버튼 */}
                  {(status === "completed" || status === "rejected") && (
                    <div className="flex gap-2">
                      {status === "completed" && (
                        <button
                          onClick={() => handleAction(page.pageNumber, "approve")}
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
            <Image
              src={modalImage}
              alt="원본 이미지"
              width={768}
              height={1024}
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
