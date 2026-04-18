"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import GenerationProgress from "@/components/GenerationProgress";
import BookPreview from "@/components/BookPreview";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/types";

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const generateTriggered = useRef(false);

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
    // status 또는 preview_pages가 바뀔 때만 업데이트
    setBook((prev) => {
      if (!prev) return newBook;
      if (prev.status !== newBook.status) return newBook;
      if (prev.preview_pages?.length !== newBook.preview_pages?.length) return newBook;
      return prev;
    });
    return newBook;
  }, [params.bookId]);

  // 최초 로드 + AI 생성 트리거
  useEffect(() => {
    async function init() {
      const bookData = await fetchBook();
      if (!bookData) return;

      setInitialLoaded(true);

      // pending 상태면 AI 생성 트리거 (fire-and-forget, await 안 함)
      if (bookData.status === "pending" && !generateTriggered.current) {
        generateTriggered.current = true;

        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: bookData.id,
            photoUrl: bookData.photo_url,
            theme: bookData.theme,
          }),
        }).catch((err) => {
          console.error("AI 생성 요청 실패:", err);
        });
      }
    }
    init();
  }, [fetchBook]);

  // 상태 폴링 (3초 간격)
  const bookStatus = book?.status;
  useEffect(() => {
    if (!bookStatus) return;
    if (bookStatus === "preview_ready" || bookStatus === "paid") return;

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

      {book.preview_pages && (
        <BookPreview pages={book.preview_pages} locked />
      )}

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
