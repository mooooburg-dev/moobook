"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { replaceChildName } from "@/lib/utils/korean-name";

export interface BookPreviewPage {
  imageUrl: string;
  text?: string;
}

interface BookPreviewProps {
  pages: BookPreviewPage[];
  childName?: string | null;
  totalPages?: number; // 전체 페이지 수 (locked 모드에서 사용)
  locked?: boolean; // 결제 전이면 미리보기만
}

export default function BookPreview({
  pages,
  childName,
  totalPages = 12,
  locked = false,
}: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const isLockedPage =
    locked && currentPage >= pages.length - 1 && pages.length < totalPages;

  const current = pages[currentPage];
  const resolvedText = current?.text
    ? replaceChildName(current.text, childName?.trim() || "주인공")
    : null;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 책 모양 프레임 */}
      <div className="frame-border">
        <div className="relative aspect-3/4 bg-peach rounded-xl overflow-hidden">
          {current?.imageUrl ? (
            <Image
              src={current.imageUrl}
              alt={`페이지 ${currentPage + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-lighter gap-2">
              <span className="text-3xl animate-pulse">📖</span>
              <span className="text-sm">이미지 로딩 중...</span>
            </div>
          )}

          {isLockedPage && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white px-6 bg-black/30 rounded-2xl py-6">
                <span className="text-3xl block mb-2">🔒</span>
                <p
                  className="text-lg mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  미리보기 끝!
                </p>
                <p className="text-sm opacity-80">
                  전체 {totalPages}페이지 동화책을 보려면 결제해주세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {resolvedText && (
        <div className="mt-5 bg-white border border-brand/10 rounded-2xl px-5 py-4 shadow-sm">
          <p
            className="text-[15px] leading-relaxed text-text whitespace-pre-line"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {resolvedText}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ◀ 이전
        </Button>

        <span
          className="text-sm text-text-light"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {currentPage + 1} /{" "}
          {locked ? `${pages.length} (전체 ${totalPages})` : pages.length}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= pages.length - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          다음 ▶
        </Button>
      </div>
    </div>
  );
}
