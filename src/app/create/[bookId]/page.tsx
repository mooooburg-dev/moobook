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

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const generateTriggered = useRef(false);
  const redirectedToFaceSelect = useRef(false);

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
      if (prev.status !== newBook.status) return newBook;
      if (prev.preview_pages?.length !== newBook.preview_pages?.length) return newBook;
      return prev;
    });
    return newBook;
  }, [params.bookId]);

  // 최초 로드 + 흐름 분기
  useEffect(() => {
    async function init() {
      const bookData = await fetchBook();
      if (!bookData) return;

      const isNewFlow =
        (bookData.photos?.length ?? 0) > 0 && !bookData.anchor_face_url;

      // 새 흐름: photos가 있고 anchor 미선택이면 face-select로 redirect
      // 또는 status가 faces_* 단계면 동일하게 redirect
      if (
        !redirectedToFaceSelect.current &&
        (isNewFlow || FACE_SELECT_STATUSES.includes(bookData.status))
      ) {
        redirectedToFaceSelect.current = true;
        router.replace(`/create/${bookData.id}/face-select`);
        return;
      }

      setInitialLoaded(true);

      // 본문 생성 트리거는 이 페이지가 책임진다. 새 흐름(faces_ready)과
      // 레거시(pending) 둘 다 허용. 백엔드 conditional update로 중복 호출 안전.
      if (
        (bookData.status === "pending" || bookData.status === "faces_ready") &&
        !generateTriggered.current
      ) {
        generateTriggered.current = true;
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: bookData.id,
            photoUrl: bookData.photo_url,
          }),
        }).catch((err) => {
          console.error("AI 생성 요청 실패:", err);
        });
      }
    }
    init();
  }, [fetchBook, router]);

  // 폴링 (preview_ready/paid 도달 전까지 3초)
  const bookStatus = book?.status;
  useEffect(() => {
    if (!bookStatus) return;
    if (bookStatus === "preview_ready" || bookStatus === "paid") return;
    if (FACE_SELECT_STATUSES.includes(bookStatus)) return;

    const interval = setInterval(fetchBook, 3000);
    return () => clearInterval(interval);
  }, [bookStatus, fetchBook]);

  const isReady = book?.status === "preview_ready" || book?.status === "paid";
  const showLoading = !initialLoaded || !isReady;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
        <div className="text-4xl mb-4">😢</div>
        <p className="text-brand-pink mb-4">{error}</p>
        <Button onClick={() => router.push("/create")}>다시 시작하기</Button>
      </div>
    );
  }

  if (!book || showLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <GenerationProgress />
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
        <Button
          size="lg"
          onClick={() => router.push(`/create/${params.bookId}/checkout`)}
        >
          📚 전체 동화책 구매하기
        </Button>
      </div>
    </div>
  );
}
