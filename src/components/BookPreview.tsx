"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface BookPreviewProps {
  pages: string[]; // 이미지 URL 배열
  totalPages?: number; // 전체 페이지 수 (locked 모드에서 사용)
  locked?: boolean; // 결제 전이면 미리보기만
}

export default function BookPreview({
  pages,
  totalPages = 12,
  locked = false,
}: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const isLockedPage = locked && currentPage >= pages.length - 1 && pages.length < totalPages;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative aspect-3/4 bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
        {pages[currentPage] ? (
          <img
            src={pages[currentPage]}
            alt={`페이지 ${currentPage + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            이미지 로딩 중...
          </div>
        )}

        {isLockedPage && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white px-6">
              <p className="text-lg font-bold mb-2">미리보기 끝!</p>
              <p className="text-sm">
                전체 {totalPages}페이지 동화책을 보려면 결제해주세요
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          이전
        </Button>

        <span className="text-sm text-gray-500">
          {currentPage + 1} / {locked ? `${pages.length} (전체 ${totalPages})` : pages.length}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= pages.length - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
