"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import GenerationProgress from "@/components/GenerationProgress";
import BookPreview, { type BookPreviewPage } from "@/components/BookPreview";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { resolveScenario } from "@/lib/scenarios";
import type { Book } from "@/types";

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
      // - 결제 전: 미리보기 3장만 생성. 그 이상은 비용 낭비라 status === preview_ready 면 멈춘다.
      // - 결제 후 (status === paid 또는 그 이후): 12장 모두 생성하기 위해 다시 루프 가동.
      const completed = bookData.all_pages?.length ?? 0;
      const needsPreview =
        bookData.status !== "paid" &&
        bookData.status !== "preview_ready" &&
        completed < 3;
      const needsRemaining =
        bookData.status === "paid" && completed < 12;
      if (needsPreview || needsRemaining) {
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
            photoUnsuitable?: { pageNumber: number; cause: string };
            status?: string;
          };
          // 결과를 받아 DB 갱신 — fetchBook 으로 UI 동기화
          await fetchBook();
          if (data.photoUnsuitable) break;
          if (data.done) break;
          // 결제 전 미리보기 단계가 끝났으면 멈춘다 — 나머지 9장은 결제 후 생성.
          if (data.status === "preview_ready") break;
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

  if (book?.status === "photo_unsuitable") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
        <div className="text-4xl mb-4">📷</div>
        <h1
          className="text-xl text-text mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          사진이 동화책에 맞지 않아요
        </h1>
        <p className="text-text-light text-sm mb-6 leading-relaxed">
          업로드한 사진의 얼굴이 또렷하게 보이지 않아 동화책 일러스트로 합성하기
          어려웠어요. 정면을 바라보고 얼굴이 잘 보이는 다른 사진으로 다시
          시작해 주세요.
        </p>
        <Button onClick={() => router.push("/create")}>
          다른 사진으로 다시 만들기
        </Button>
      </div>
    );
  }

  const previewCount = book?.preview_pages?.length ?? 0;
  const allCount = book?.all_pages?.length ?? 0;
  // 미리보기는 3장. 결제 전까지는 그 이상 만들지 않는다 (비용 절약).
  const PREVIEW_REQUIRED = 3;
  const previewReady = previewCount >= PREVIEW_REQUIRED;
  const showLoading = !initialLoaded || !previewReady;

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

      <div className="mt-10 text-center space-y-2">
        <Button
          size="lg"
          onClick={() => router.push(`/create/${params.bookId}/checkout`)}
        >
          📚 전체 동화책 구매하기
        </Button>
        <p className="text-xs text-text-light">
          나머지 페이지는 결제 후 만들어드려요.
        </p>
      </div>
    </div>
  );
}
