"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { BookStatus } from "@/types";

interface CandidatesError {
  status?: number;
  code?: string | null;
  message?: string;
  requestId?: string | null;
}

interface CandidatesMetadata {
  createdAt?: string;
  error?: CandidatesError | string;
  attemptId?: string;
}

interface CandidatesResponse {
  status: BookStatus;
  candidates: string[];
  metadata: CandidatesMetadata | null;
  anchorFaceUrl: string | null;
}

const POLL_INTERVAL_MS = 3000;
// 사용자에게 "오래 걸려요" 안내를 띄우는 임계 (Codex 피드백 #5).
// 백엔드 lease TTL(6분)보다 짧게 잡아 UI에서 먼저 stuck을 인지할 수 있게.
const SLOW_THRESHOLD_MS = 90 * 1000;

export default function FaceSelectPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const [candidates, setCandidates] = useState<string[]>([]);
  const [status, setStatus] = useState<BookStatus | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingMs, setWaitingMs] = useState(0);
  const triggerOnceRef = useRef(false);
  const generationStartRef = useRef<number | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/face-candidates?bookId=${params.bookId}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "후보 조회 실패");
      }
      const data = (await res.json()) as CandidatesResponse;
      setStatus(data.status);
      setCandidates(data.candidates ?? []);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "후보 조회 실패");
      return null;
    }
  }, [params.bookId]);

  // 트리거 fetch — fire-and-forget. 페이지가 떠있는 동안 응답을 기다리진 않고
  // 폴링이 결과를 알아옴. (이 페이지에서는 navigation abort 우려가 없음)
  const triggerCandidates = useCallback(
    (force: boolean) => {
      fetch("/api/face-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: params.bookId, force }),
      }).catch(() => undefined);
    },
    [params.bookId]
  );

  // 최초 로드 + 트리거 책임은 이 페이지에 있음.
  // - pending: 정상 트리거
  // - faces_failed: force 재시도
  // - faces_generating + metadata=null → stuck 의심 → force 회수
  useEffect(() => {
    async function init() {
      const state = await fetchState();
      if (!state || triggerOnceRef.current) return;

      if (state.status === "pending") {
        triggerOnceRef.current = true;
        generationStartRef.current = Date.now();
        triggerCandidates(false);
        return;
      }
      if (state.status === "faces_failed") {
        triggerOnceRef.current = true;
        generationStartRef.current = Date.now();
        triggerCandidates(true);
        return;
      }
      if (state.status === "faces_generating") {
        const startedAt = state.metadata?.createdAt
          ? new Date(state.metadata.createdAt).getTime()
          : Date.now();
        generationStartRef.current = startedAt;
        if (!state.metadata) {
          // metadata=null = 시작도 못 함 → 즉시 force로 회수
          triggerOnceRef.current = true;
          triggerCandidates(true);
        }
      }
    }
    init();
  }, [fetchState, triggerCandidates]);

  // 폴링
  useEffect(() => {
    if (!status) return;
    if (status === "faces_ready" || status === "faces_failed") return;
    if (status !== "pending" && status !== "faces_generating") return;

    const interval = setInterval(fetchState, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, fetchState]);

  // 경과 시간 카운터 — 90초 넘으면 "오래 걸려요" 메시지 + 재시도 버튼
  useEffect(() => {
    if (status !== "pending" && status !== "faces_generating") {
      setWaitingMs(0);
      return;
    }
    const tick = () => {
      const start = generationStartRef.current;
      if (!start) return;
      setWaitingMs(Date.now() - start);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [status]);

  async function handleConfirm() {
    if (selectedIndex === null) return;
    setIsConfirming(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/face-candidates?bookId=${params.bookId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateIndex: selectedIndex }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "anchor 선택 실패");
      }

      // 본문 생성 트리거는 /create/[bookId] 페이지가 마운트 시 책임진다.
      // navigation 직전 fire-and-forget fetch는 dev에서 abort되는 사례가 있어
      // face-candidates와 동일하게 책임을 다음 페이지로 일원화.
      router.push(`/create/${params.bookId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setIsConfirming(false);
    }
  }

  async function handleRetry() {
    setIsRetrying(true);
    setError(null);
    try {
      const res = await fetch("/api/face-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: params.bookId, force: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "재생성 실패");
      }
      setCandidates([]);
      setSelectedIndex(null);
      setStatus("faces_generating");
      generationStartRef.current = Date.now();
      setWaitingMs(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "재생성 실패");
    } finally {
      setIsRetrying(false);
    }
  }

  const isGenerating =
    status === "pending" || status === "faces_generating";
  const isReady = status === "faces_ready" && candidates.length > 0;
  const isFailed = status === "faces_failed";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 page-enter">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🪞</div>
        <h1
          className="text-3xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          얼굴 고르기
        </h1>
        <p className="text-text-light mt-2">
          가장 닮은 얼굴을 골라주세요. 선택한 얼굴이 동화책 전체에 사용돼요.
        </p>
      </div>

      {isGenerating && (
        <div className="bg-peach/40 border border-brand/20 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3 animate-pulse">✨</div>
          <p
            className="text-text text-base mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            아이 얼굴을 그리고 있어요
          </p>
          <p className="text-text-light text-sm mb-5">
            보통 30초~1분 정도 걸려요. 잠시만 기다려주세요.
          </p>

          {/* 진행 바 — 50초를 100%로 잡고 시각적 피드백.
              실제 완료 시점은 백엔드가 결정하므로 99%에서 멈춘다. */}
          <div className="max-w-xs mx-auto">
            <div
              className="h-2 rounded-full bg-white/60 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(99, (waitingMs / 50000) * 100)}
            >
              <div
                className="h-full bg-linear-to-r from-brand to-brand-pink transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(99, (waitingMs / 50000) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-text-light mt-2">
              {Math.round(waitingMs / 1000)}초 / 약 50초
            </p>
          </div>

          {waitingMs > SLOW_THRESHOLD_MS && (
            <div className="mt-5 pt-5 border-t border-brand/20">
              <p className="text-sm text-text mb-3">
                생각보다 오래 걸리고 있어요. 다시 시도하시겠어요?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? "다시 시도 중..." : "🔄 처음부터 다시"}
              </Button>
            </div>
          )}
        </div>
      )}

      {isFailed && (
        <div className="bg-brand-pink/10 border border-brand-pink/30 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">😢</div>
          <p
            className="text-text text-base mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            얼굴 생성에 실패했어요
          </p>
          <p className="text-text-light text-sm mb-4">
            다시 시도하거나, 사진을 다른 것으로 올려주세요.
          </p>
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "재시도 중..." : "다시 만들기"}
          </Button>
        </div>
      )}

      {isReady && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {candidates.map((url, idx) => {
              const selected = selectedIndex === idx;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-white ${
                    selected
                      ? "border-brand ring-4 ring-brand/30 shadow-lg scale-[1.02]"
                      : "border-brand/20 hover:border-brand/50"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`후보 ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                  {selected && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm shadow">
                      ✓
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent text-white text-xs py-1.5 text-center">
                    후보 {idx + 1}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              disabled={selectedIndex === null || isConfirming}
              onClick={handleConfirm}
            >
              {isConfirming
                ? "✨ 동화책 만들기 시작..."
                : "이 얼굴로 동화책 만들기 →"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleRetry}
              disabled={isRetrying || isConfirming}
            >
              {isRetrying ? "재생성 중..." : "🔄 다시 만들기"}
            </Button>
          </div>
        </>
      )}

      {error && (
        <p className="text-center text-brand-pink text-sm mt-6">{error}</p>
      )}
    </div>
  );
}
