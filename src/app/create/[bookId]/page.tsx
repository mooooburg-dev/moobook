"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import GenerationProgress from "@/components/GenerationProgress";
import BookPreview, { type BookPreviewPage } from "@/components/BookPreview";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { resolveScenario } from "@/lib/scenarios";
import type { Book } from "@/types";

const FACE_SELECT_STATUSES: Book["status"][] = [
  "faces_generating",
  "faces_ready",
  "faces_failed",
];

const PAGE_GEN_INTERVAL_MS = 1000;

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const redirectedToFaceSelect = useRef(false);
  const pageLoopActiveRef = useRef(false);
  const [shouldRunLoop, setShouldRunLoop] = useState(false);

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

  // 진행 상태 분기 + face-select redirect
  useEffect(() => {
    async function init() {
      const bookData = await fetchBook();
      if (!bookData) return;

      const isNewFlow =
        (bookData.photos?.length ?? 0) > 0 && !bookData.anchor_face_url;

      if (
        !redirectedToFaceSelect.current &&
        (isNewFlow || FACE_SELECT_STATUSES.includes(bookData.status))
      ) {
        redirectedToFaceSelect.current = true;
        router.replace(`/create/${bookData.id}/face-select`);
        return;
      }

      setInitialLoaded(true);
      // 본문 페이지 생성 루프 시작 — 이 effect 가 한 번 트리거되고,
      // 루프 자체는 별도 effect 에서 bookId 단위로만 dep 를 잡는다.
      if (
        bookData.status !== "paid" &&
        (bookData.all_pages?.length ?? 0) < 12
      ) {
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
    };

    loop();

    return () => {
      cancelled = true;
    };
  }, [shouldRunLoop, params.bookId, fetchBook]);

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
  const totalPages = 12;
  const allPagesReady = allCount >= totalPages;
  // preview_pages 가 3장 이상 차야 미리보기 화면 진입 (Codex #7)
  const showLoading = !initialLoaded || previewCount < 3;

  if (!book || showLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <GenerationProgress completedPages={allCount} totalPages={12} />
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
              📚 동화책 만드는 중... ({allCount} / {totalPages})
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
