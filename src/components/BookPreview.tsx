"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { replaceChildName } from "@/lib/utils/korean-name";
import { wrapTextWithCanvas } from "@/lib/utils/wrap-text";

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

const TEXT_FONT_SIZE = 16;
const TEXT_FONT_FAMILY = "'Noto Sans KR', sans-serif";
const TEXT_HORIZONTAL_PADDING = 48; // px (좌우 padding 합계)

export default function BookPreview({
  pages,
  childName,
  totalPages = 12,
  locked = false,
}: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 결제 전이고 전체 페이지보다 미리보기가 적으면, 미리보기 마지막 다음에
  // "잠금 안내" 가상 페이지를 한 장 더 추가한다. 이렇게 하면 1~N 미리보기는
  // 깨끗하게 노출되고 (N+1)번째에서 잠금 화면이 나타난다.
  const showLockOverlayPage = locked && pages.length < totalPages;
  const totalDisplayPages = pages.length + (showLockOverlayPage ? 1 : 0);
  const isLockedPage = showLockOverlayPage && currentPage === pages.length;

  // 잠금 페이지에서는 마지막 미리보기 이미지를 배경으로 사용 (블러 처리)
  const current = isLockedPage ? pages[pages.length - 1] : pages[currentPage];
  const resolvedText =
    !isLockedPage && current?.text
      ? replaceChildName(current.text, childName?.trim() || "주인공")
      : null;

  const imageLoading =
    !!current?.imageUrl && loadedImageUrl !== current.imageUrl;

  // PDF 생성기와 동일한 알고리즘으로 줄바꿈. 컨테이너 폭 - 좌우 padding 만큼만 한 줄에.
  const wrappedLines = useMemo(() => {
    if (!resolvedText) return [];
    const maxWidth = Math.max(0, containerWidth - TEXT_HORIZONTAL_PADDING);
    if (maxWidth === 0) return [resolvedText];
    return wrapTextWithCanvas(
      resolvedText,
      `${TEXT_FONT_SIZE}px ${TEXT_FONT_FAMILY}`,
      maxWidth
    );
  }, [resolvedText, containerWidth]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 책 모양 프레임 */}
      <div className="frame-border">
        <div
          ref={containerRef}
          className="relative aspect-3/4 bg-peach rounded-xl overflow-hidden"
        >
          {current?.imageUrl ? (
            <>
              <Image
                key={current.imageUrl}
                src={current.imageUrl}
                alt={`페이지 ${currentPage + 1}`}
                fill
                className={`object-cover transition-opacity duration-200 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                } ${isLockedPage ? "scale-110 blur-md" : ""}`}
                sizes="(max-width: 512px) 100vw, 512px"
                onLoad={() => setLoadedImageUrl(current.imageUrl)}
                onError={() => setLoadedImageUrl(current.imageUrl)}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-peach/40">
                  <span className="inline-block w-8 h-8 rounded-full border-[3px] border-brand/30 border-t-brand animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-lighter gap-2">
              <span className="text-3xl animate-pulse">📖</span>
              <span className="text-sm">이미지 로딩 중...</span>
            </div>
          )}

          {/* 하단 그라데이션 + 본문 텍스트 오버레이 (실제 동화책 페이지 느낌) */}
          {resolvedText && !isLockedPage && (
            <div className="absolute inset-x-0 bottom-0 pt-28 pb-12 px-6 bg-linear-to-t from-black/75 via-black/45 to-transparent pointer-events-none">
              <p
                className="text-white whitespace-pre-line drop-shadow-md"
                style={{
                  fontFamily: TEXT_FONT_FAMILY,
                  fontSize: `${TEXT_FONT_SIZE}px`,
                  lineHeight: 1.6,
                }}
              >
                {wrappedLines.join("\n")}
              </p>
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
          {isLockedPage ? (
            <>미리보기 끝</>
          ) : (
            <>
              {currentPage + 1} /{" "}
              {locked ? `${pages.length} (전체 ${totalPages})` : pages.length}
            </>
          )}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalDisplayPages - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          다음 ▶
        </Button>
      </div>
    </div>
  );
}
