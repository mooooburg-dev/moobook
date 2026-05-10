"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import GenerationProgress from "@/components/GenerationProgress";
import BookPreview, { type BookPreviewPage } from "@/components/BookPreview";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { resolveScenario } from "@/lib/scenarios";
import { PREVIEW_PAGE_COUNT_BEFORE_PAYMENT } from "@/lib/utils/env";
import type { Book } from "@/types";

const PAGE_GEN_INTERVAL_MS = 1000;
const TOTAL_PAGES = 12;
const PAID_STATUSES = new Set(["paid", "printing", "shipped", "completed"]);

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const redirectedToFaceSelect = useRef(false);
  const pageLoopActiveRef = useRef(false);
  const [shouldRunLoop, setShouldRunLoop] = useState(false);
  // 같은 컴포넌트 라이프사이클 안에서 폴링 루프를 한 번 더 시작해야 할 때
  // (= preview 종료 후 결제 → paid → 12장 채우기) effect dep 를 강제로 바꾸기
  // 위한 nonce. shouldRunLoop 만 false→true 로 바꿔도 같은 batch 안에 합쳐지면
  // effect 가 안 돌 수 있어 nonce 로 보장.
  const [loopNonce, setLoopNonce] = useState(0);

  const lastStatusRef = useRef<Book["status"] | null>(null);
  // active loop 가 진행 중일 때 paid 전환 신호를 받으면, 신호를 잃지 않도록
  // ref 에 기록해 두었다가 루프 종료 직후 재시작 트리거에 사용한다
  // (Codex round 2 #4).
  const pendingPaidRestartRef = useRef(false);

  const fetchBook = useCallback(async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("moobook_books")
      .select("*")
      .eq("id", params.bookId)
      .single();

    if (fetchError) {
      setError("동화책을 찾을 수 없습니다.");
      return null;
    }

    const newBook = data as Book;

    // status 가 paid 로 전환되면 루프를 재가동한다.
    // preview 단계에서 limit 만 채우고 종료된 루프가, 결제 완료 후 같은
    // 컴포넌트 생명주기 안에서 12장까지 마저 채우도록 재시작 (Codex P2 #5).
    const prevStatus = lastStatusRef.current;
    const becamePaid =
      prevStatus !== null &&
      !PAID_STATUSES.has(prevStatus) &&
      PAID_STATUSES.has(newBook.status);
    const stillIncomplete = (newBook.all_pages?.length ?? 0) < TOTAL_PAGES;
    if (becamePaid && stillIncomplete) {
      if (pageLoopActiveRef.current) {
        // 루프가 active 면 set 해도 effect 가 cleanup 되지 않음. 종료 직후
        // 재시작하도록 ref 에 기록 (Codex round 2 #4).
        pendingPaidRestartRef.current = true;
      } else {
        setShouldRunLoop(true);
      }
    }
    lastStatusRef.current = newBook.status;

    setBook((prev) => {
      if (!prev) return newBook;
      const prevAll = prev.all_pages?.length ?? 0;
      const newAll = newBook.all_pages?.length ?? 0;
      const prevPreview = prev.preview_pages?.length ?? 0;
      const newPreview = newBook.preview_pages?.length ?? 0;
      if (
        prev.status !== newBook.status ||
        prevAll !== newAll ||
        prevPreview !== newPreview
      ) {
        return newBook;
      }
      return prev;
    });
    return newBook;
  }, [params.bookId]);

  // 진행 상태 분기 + face-select redirect.
  // anchor 가 아직 없으면 face-select 로 보낸다. status 가 faces_* 라도 anchor
  // 가 이미 있으면 (= 사용자가 방금 선택을 끝낸 케이스) redirect 하지 않는다.
  useEffect(() => {
    async function init() {
      const bookData = await fetchBook();
      if (!bookData) return;

      const hasAnchor = !!bookData.anchor_face_url;
      const hasPhotos = (bookData.photos?.length ?? 0) > 0;
      const needsFaceSelect = hasPhotos && !hasAnchor;

      if (!redirectedToFaceSelect.current && needsFaceSelect) {
        redirectedToFaceSelect.current = true;
        router.replace(`/create/${bookData.id}/face-select`);
        return;
      }

      setInitialLoaded(true);
      // 본문 페이지 생성 루프 시작.
      // 결제 전엔 미리보기 limit (dev=1/prod=3) 까지만, 결제 후엔 12장 전체까지.
      const isPaid = PAID_STATUSES.has(bookData.status);
      const currentCount = bookData.all_pages?.length ?? 0;
      const target = isPaid ? TOTAL_PAGES : PREVIEW_PAGE_COUNT_BEFORE_PAYMENT;
      if (currentCount < target) {
        setShouldRunLoop(true);
      }
    }
    init();
  }, [fetchBook, router]);

  // polling-driven 페이지 생성 루프.
  // dep 를 bookId / shouldRunLoop 로만 잡아 book 객체 변화(예: all_pages 1장 증가)에는
  // cleanup 되지 않는다. cleanup 은 unmount 또는 bookId 변경 시에만 일어남 (Codex #2).
  useEffect(() => {
    if (!shouldRunLoop) return;
    if (pageLoopActiveRef.current) return;

    pageLoopActiveRef.current = true;
    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId: params.bookId }),
          });
          if (!res.ok) {
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }
          const data = (await res.json()) as {
            done?: boolean;
            busy?: boolean;
            generated?: { pageNumber: number; url: string };
            completedPages?: number;
            totalPages?: number;
            retryAfterMs?: number;
          };
          // 결과를 받아 DB 갱신 — fetchBook 으로 UI 동기화
          await fetchBook();
          if (data.done) break;
          if (data.busy) {
            const wait = data.retryAfterMs ?? PAGE_GEN_INTERVAL_MS;
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
          if (
            typeof data.completedPages === "number" &&
            typeof data.totalPages === "number" &&
            data.completedPages >= data.totalPages
          ) {
            break;
          }
          await new Promise((r) => setTimeout(r, PAGE_GEN_INTERVAL_MS));
        } catch (err) {
          console.error("페이지 생성 루프 오류:", err);
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
      pageLoopActiveRef.current = false;
      if (!cancelled) {
        // 루프가 도는 사이 paid 전환 신호가 있었으면 즉시 재시작 (Codex round
        // 2 #4). nonce 를 증가시켜 effect dep 를 강제로 바꿔 cleanup → 재실행
        // 사이클이 한 번 더 일어나도록 한다.
        if (pendingPaidRestartRef.current) {
          pendingPaidRestartRef.current = false;
          setLoopNonce((n) => n + 1);
          setShouldRunLoop(true);
        } else {
          setShouldRunLoop(false);
        }
      }
    };

    loop();

    return () => {
      cancelled = true;
    };
  }, [shouldRunLoop, loopNonce, params.bookId, fetchBook]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
        <div className="text-4xl mb-4">😢</div>
        <p className="text-brand-pink mb-4">{error}</p>
        <Button onClick={() => router.push("/create")}>다시 시작하기</Button>
      </div>
    );
  }

  const previewCount = book?.preview_pages?.length ?? 0;
  const allCount = book?.all_pages?.length ?? 0;
  const totalPages = TOTAL_PAGES;
  // 결제 전엔 미리보기 limit (dev=1/prod=3) 만 채워지면 결제 버튼 활성화.
  // 결제 후엔 12장 모두 차야 다음 단계로.
  const isPaid = book ? PAID_STATUSES.has(book.status) : false;
  const previewReady = previewCount >= PREVIEW_PAGE_COUNT_BEFORE_PAYMENT;
  const allPagesReady = isPaid ? allCount >= totalPages : previewReady;
  const showLoading = !initialLoaded || !previewReady;

  if (!book || showLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <GenerationProgress
          completedPages={allCount}
          totalPages={isPaid ? totalPages : PREVIEW_PAGE_COUNT_BEFORE_PAYMENT}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 page-enter">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">✨</div>
        <h1
          className="text-2xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          미리보기
        </h1>
        <p className="text-text-light mt-1">
          {book.child_name}의 동화책이 준비되었어요! 📖
        </p>
      </div>

      {book.preview_pages && (() => {
        let previewPages: BookPreviewPage[] = book.preview_pages.map((url) => ({
          imageUrl: url,
        }));
        try {
          const scenario = resolveScenario(book);
          previewPages = book.preview_pages.map((url, idx) => ({
            imageUrl: url,
            text: scenario.pages[idx]?.text,
          }));
        } catch {
          // 시나리오 해석 실패 시 이미지만 표시
        }
        return (
          <BookPreview
            pages={previewPages}
            childName={book.child_name}
            locked
          />
        );
      })()}

      <div className="mt-10 text-center">
        {allPagesReady ? (
          <Button
            size="lg"
            onClick={() => router.push(`/create/${params.bookId}/checkout`)}
          >
            📚 전체 동화책 구매하기
          </Button>
        ) : (
          <div className="space-y-2">
            <Button size="lg" disabled>
              📚 동화책 만드는 중... (
              {allCount} / {isPaid ? totalPages : PREVIEW_PAGE_COUNT_BEFORE_PAYMENT}
              )
            </Button>
            <p className="text-xs text-text-light">
              남은 페이지는 자동으로 만들어지고 있어요. 잠시 후 결제할 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
