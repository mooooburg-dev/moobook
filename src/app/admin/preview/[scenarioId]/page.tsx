"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { scenarios } from "@/lib/scenarios";
import { replaceChildName } from "@/lib/utils/korean-name";
import type { ScenarioBackground, ThemeId } from "@/types";

const NAME_OPTIONS = ["지환", "서윤", "하윤", "도윤", "시우", "지안", "수아"];

// 인쇄 기준 (페이지 크기 대비 %)
const BLEED_PCT = 3; // 재단 여유 (가장자리에서 잘릴 수 있는 영역)
const SAFE_PCT = 8; // 안전 영역 마진 (텍스트는 이 안쪽에만 배치)

// 문장 단위 분할: 마침표/물음표/느낌표 뒤에서 줄바꿈.
// 대화 닫는 따옴표(" ' ” ’)는 문장부호에 포함해서 함께 끊음.
function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+["'”’]?\s*/g);
  if (!matches) return [text.trim()].filter(Boolean);
  const rest = text.replace(matches.join(""), "").trim();
  const result = matches.map((s) => s.trim()).filter(Boolean);
  if (rest) result.push(rest);
  return result;
}

export default function AdminPreviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.scenarioId as string;
  const scenario = scenarios[scenarioId as ThemeId];

  const [backgrounds, setBackgrounds] = useState<ScenarioBackground[]>([]);
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState<string>("지환");
  const [imageRatio, setImageRatio] = useState<number>(65);
  const [overlayMode, setOverlayMode] = useState<boolean>(true);
  const [overlayPosition, setOverlayPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const [showPrintGuides, setShowPrintGuides] = useState<boolean>(false);
  const [bookShape, setBookShape] = useState<"portrait" | "square">("portrait");
  const [viewMode, setViewMode] = useState<"scroll" | "spread">("spread");
  const [spreadIndex, setSpreadIndex] = useState<number>(0);

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
  }, [fetchBackgrounds]);

  const bgMap = useMemo(() => {
    const map = new Map<number, ScenarioBackground>();
    for (const b of backgrounds) map.set(b.page_number, b);
    return map;
  }, [backgrounds]);

  // 스프레드 시퀀스: [앞표지] [빈|p1] [p2|p3] ... [pN|빈] [뒷표지]
  type Leaf =
    | { type: "cover-front" }
    | { type: "cover-back" }
    | { type: "blank" }
    | { type: "page"; pageNumber: number };

  const spreads: Array<[Leaf, Leaf]> = useMemo(() => {
    const list: Array<[Leaf, Leaf]> = [];
    if (!scenario) return list;
    list.push([{ type: "cover-front" }, { type: "cover-front" }]);
    const pageNums = scenario.pages.map((p) => p.pageNumber);
    if (pageNums.length > 0) {
      list.push([{ type: "blank" }, { type: "page", pageNumber: pageNums[0] }]);
      for (let i = 1; i < pageNums.length; i += 2) {
        const left: Leaf = { type: "page", pageNumber: pageNums[i] };
        const right: Leaf =
          i + 1 < pageNums.length
            ? { type: "page", pageNumber: pageNums[i + 1] }
            : { type: "blank" };
        list.push([left, right]);
      }
    }
    list.push([{ type: "cover-back" }, { type: "cover-back" }]);
    return list;
  }, [scenario]);

  const coverImageUrl = useMemo(() => {
    const first = scenario?.pages[0];
    return first ? bgMap.get(first.pageNumber)?.image_url ?? null : null;
  }, [scenario, bgMap]);

  useEffect(() => {
    if (viewMode !== "spread") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setSpreadIndex((i) => Math.min(i + 1, spreads.length - 1));
      } else if (e.key === "ArrowLeft") {
        setSpreadIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewMode, spreads.length]);

  useEffect(() => {
    setSpreadIndex(0);
  }, [scenarioId, viewMode]);

  if (!scenario) {
    return (
      <div className="text-gray-500">존재하지 않는 시나리오입니다.</div>
    );
  }

  function replaceName(text: string): string {
    return replaceChildName(text, childName);
  }

  const textRatio = 100 - imageRatio;

  const aspectClass =
    bookShape === "square" ? "aspect-square" : "aspect-3/4";

  function renderPageLeaf(pageNumber: number) {
    const page = scenario!.pages.find((p) => p.pageNumber === pageNumber);
    if (!page) return null;
    const bg = bgMap.get(page.pageNumber);
    const imageUrl = bg?.image_url ?? null;
    const sentences = splitSentences(replaceName(page.text));

    if (overlayMode) {
      return (
        <>
          <div className="absolute inset-0 bg-gray-100">
            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                배경 이미지 없음
              </div>
            )}
          </div>
          <div
            className="absolute inset-x-0 pointer-events-none"
            style={{
              top: overlayPosition === "top" ? 0 : "auto",
              bottom: overlayPosition === "bottom" ? 0 : "auto",
              height: "46%",
              background:
                overlayPosition === "bottom"
                  ? "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)"
                  : "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)",
            }}
          />
          <div
            className={`absolute flex ${
              overlayPosition === "top" ? "items-start" : "items-end"
            }`}
            style={{
              top: overlayPosition === "top" ? `${SAFE_PCT}%` : "auto",
              bottom:
                overlayPosition === "bottom" ? `${SAFE_PCT}%` : "auto",
              left: `${SAFE_PCT}%`,
              right: `${SAFE_PCT}%`,
            }}
          >
            <div
              className="text-white text-[17px] sm:text-lg leading-relaxed space-y-1"
              style={{
                fontFamily: "'Jua', sans-serif",
                wordBreak: "keep-all",
                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              }}
            >
              {sentences.map((sentence, i) => (
                <p key={i}>{sentence}</p>
              ))}
            </div>
          </div>
          <span
            className="absolute text-xs text-white/80 tabular-nums"
            style={{
              bottom: `${SAFE_PCT / 2}%`,
              right: `${SAFE_PCT}%`,
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {page.pageNumber} / {scenario!.pageCount}
          </span>
        </>
      );
    }

    return (
      <>
        <div
          className="relative bg-gray-100 overflow-hidden"
          style={{ height: `${imageRatio}%` }}
        >
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={`Page ${page.pageNumber}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              배경 이미지 없음
            </div>
          )}
        </div>
        <div
          className="relative bg-cream px-6 py-5 flex items-center"
          style={{ height: `${textRatio}%` }}
        >
          <div
            className="text-gray-800 leading-relaxed text-[17px] sm:text-lg space-y-1"
            style={{
              fontFamily: "'Jua', sans-serif",
              wordBreak: "keep-all",
            }}
          >
            {sentences.map((sentence, i) => (
              <p key={i}>{sentence}</p>
            ))}
          </div>
          <span className="absolute bottom-2 right-4 text-xs text-gray-400 tabular-nums">
            {page.pageNumber} / {scenario!.pageCount}
          </span>
        </div>
      </>
    );
  }

  function renderCoverFront() {
    return (
      <div className="absolute inset-0 flex flex-col">
        <div className="relative flex-1 bg-linear-to-br from-amber-100 to-rose-100 overflow-hidden">
          {coverImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={coverImageUrl}
              alt="표지"
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
          <div
            className="absolute inset-x-0 bottom-0 px-6 pb-7 pt-14 text-white"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            <div className="text-sm/6 opacity-90 mb-1">
              {childName}(이)의 특별한 이야기
            </div>
            <div
              className="text-3xl sm:text-4xl leading-tight drop-shadow"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
            >
              {scenario!.title}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCoverBack() {
    return (
      <div className="absolute inset-0 bg-linear-to-br from-amber-100 to-rose-100 flex flex-col justify-between p-8">
        <div
          className="text-gray-800 text-base leading-relaxed"
          style={{
            fontFamily: "'Jua', sans-serif",
            wordBreak: "keep-all",
          }}
        >
          {scenario!.educationMessage}
        </div>
        <div className="text-right text-xs text-gray-500 tabular-nums">
          moobook · {childName}
        </div>
      </div>
    );
  }

  function renderLeaf(leaf: Leaf, side: "left" | "right") {
    const baseClass = `relative ${aspectClass} bg-white overflow-hidden flex flex-col`;
    const shadowStyle =
      side === "left"
        ? {
            boxShadow:
              "inset -8px 0 12px -8px rgba(0,0,0,0.25), 0 10px 30px -5px rgba(0,0,0,0.15)",
          }
        : {
            boxShadow:
              "inset 8px 0 12px -8px rgba(0,0,0,0.25), 0 10px 30px -5px rgba(0,0,0,0.15)",
          };

    let content: React.ReactNode = null;
    if (leaf.type === "cover-front") content = renderCoverFront();
    else if (leaf.type === "cover-back") content = renderCoverBack();
    else if (leaf.type === "blank")
      content = <div className="absolute inset-0 bg-cream" />;
    else if (leaf.type === "page") content = renderPageLeaf(leaf.pageNumber);

    return (
      <div className={baseClass} style={shadowStyle}>
        {content}
        {showPrintGuides && leaf.type === "page" && (
          <>
            <div
              className="absolute pointer-events-none border border-red-500"
              style={{
                top: `${BLEED_PCT}%`,
                bottom: `${BLEED_PCT}%`,
                left: `${BLEED_PCT}%`,
                right: `${BLEED_PCT}%`,
              }}
            />
            <div
              className="absolute pointer-events-none border border-dashed border-green-500"
              style={{
                top: `${SAFE_PCT}%`,
                bottom: `${SAFE_PCT}%`,
                left: `${SAFE_PCT}%`,
                right: `${SAFE_PCT}%`,
              }}
            />
          </>
        )}
      </div>
    );
  }

  function renderSpreadView() {
    const spread = spreads[spreadIndex];
    if (!spread) return null;
    const [left, right] = spread;
    const isCover =
      left.type === "cover-front" || left.type === "cover-back";

    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex items-stretch justify-center w-full">
          {isCover ? (
            <div
              className={`w-full max-w-[520px] ${aspectClass} relative rounded-xl overflow-hidden`}
              style={{
                boxShadow:
                  "0 20px 40px -10px rgba(0,0,0,0.3), 0 8px 16px -4px rgba(0,0,0,0.15)",
              }}
            >
              {left.type === "cover-front"
                ? renderCoverFront()
                : renderCoverBack()}
            </div>
          ) : (
            <div className="flex w-full max-w-[1040px] rounded-xl overflow-hidden">
              <div className="flex-1">{renderLeaf(left, "left")}</div>
              <div
                className="w-[2px] bg-linear-to-b from-black/30 via-black/50 to-black/30"
                aria-hidden
              />
              <div className="flex-1">{renderLeaf(right, "right")}</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSpreadIndex((i) => Math.max(i - 1, 0))}
            disabled={spreadIndex === 0}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &larr; 이전
          </button>
          <span className="text-sm text-gray-600 tabular-nums">
            {spreadIndex + 1} / {spreads.length}
          </span>
          <button
            onClick={() =>
              setSpreadIndex((i) => Math.min(i + 1, spreads.length - 1))
            }
            disabled={spreadIndex === spreads.length - 1}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            다음 &rarr;
          </button>
        </div>
        <p className="text-xs text-gray-400">
          ← / → 키로 페이지를 넘길 수 있어요
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/preview")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            &larr; 목록으로
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {scenario.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {scenarioId} · {scenario.pageCount}페이지
          </p>
        </div>
        <button
          disabled
          className="px-4 py-2 text-sm font-medium rounded-md bg-gray-300 text-white cursor-not-allowed"
        >
          PDF로 내보내기
        </button>
      </div>

      {/* 컨트롤 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-6 items-center sticky top-4 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">뷰 모드</label>
          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode("spread")}
              className={`px-3 py-1.5 text-sm ${
                viewMode === "spread"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              펼침
            </button>
            <button
              onClick={() => setViewMode("scroll")}
              className={`px-3 py-1.5 text-sm ${
                viewMode === "scroll"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              스크롤
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">책 형태</label>
          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => setBookShape("portrait")}
              className={`px-3 py-1.5 text-sm ${
                bookShape === "portrait"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              세로형 (3:4)
            </button>
            <button
              onClick={() => setBookShape("square")}
              className={`px-3 py-1.5 text-sm ${
                bookShape === "square"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              정사각형 (1:1)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            아이 이름
          </label>
          <select
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {NAME_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {!overlayMode && (
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              이미지 : 텍스트
            </label>
            <input
              type="range"
              min={60}
              max={80}
              step={1}
              value={imageRatio}
              onChange={(e) => setImageRatio(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 tabular-nums whitespace-nowrap w-16 text-right">
              {imageRatio} : {textRatio}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            오버레이 모드
          </label>
          <button
            onClick={() => setOverlayMode((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              overlayMode ? "bg-gray-900" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                overlayMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            인쇄 가이드
          </label>
          <button
            onClick={() => setShowPrintGuides((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showPrintGuides ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showPrintGuides ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {overlayMode && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              텍스트 위치
            </label>
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
              <button
                onClick={() => setOverlayPosition("top")}
                className={`px-3 py-1.5 text-sm ${
                  overlayPosition === "top"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                상단
              </button>
              <button
                onClick={() => setOverlayPosition("bottom")}
                className={`px-3 py-1.5 text-sm ${
                  overlayPosition === "bottom"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                하단
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400">로딩 중...</div>
      ) : viewMode === "spread" ? (
        renderSpreadView()
      ) : (
        <div className="flex flex-col items-center gap-10 py-4">
          {scenario.pages.map((page) => {
            const bg = bgMap.get(page.pageNumber);
            const imageUrl = bg?.image_url ?? null;

            return (
              <div
                key={page.pageNumber}
                className={`w-full max-w-[480px] ${
                  bookShape === "square" ? "aspect-square" : "aspect-3/4"
                } bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col relative`}
                style={{
                  boxShadow:
                    "0 10px 30px -5px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.05)",
                }}
              >
                {overlayMode ? (
                  <>
                    {/* 풀블리드 이미지 */}
                    <div className="absolute inset-0 bg-gray-100">
                      {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          배경 이미지 없음
                        </div>
                      )}
                    </div>

                    {/* 그라디언트 오버레이 (안전 영역 바깥부터 시작) */}
                    <div
                      className="absolute inset-x-0 pointer-events-none"
                      style={{
                        top: overlayPosition === "top" ? 0 : "auto",
                        bottom: overlayPosition === "bottom" ? 0 : "auto",
                        height: "46%",
                        background:
                          overlayPosition === "bottom"
                            ? "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)"
                            : "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)",
                      }}
                    />

                    {/* 텍스트 (안전 영역 안쪽에만 배치) */}
                    <div
                      className={`absolute flex ${
                        overlayPosition === "top"
                          ? "items-start"
                          : "items-end"
                      }`}
                      style={{
                        top:
                          overlayPosition === "top" ? `${SAFE_PCT}%` : "auto",
                        bottom:
                          overlayPosition === "bottom"
                            ? `${SAFE_PCT}%`
                            : "auto",
                        left: `${SAFE_PCT}%`,
                        right: `${SAFE_PCT}%`,
                      }}
                    >
                      <div
                        className="text-white text-[17px] sm:text-lg leading-relaxed space-y-1"
                        style={{
                          fontFamily: "'Jua', sans-serif",
                          wordBreak: "keep-all",
                          textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                        }}
                      >
                        {splitSentences(replaceName(page.text)).map(
                          (sentence, i) => (
                            <p key={i}>{sentence}</p>
                          )
                        )}
                      </div>
                    </div>

                    <span
                      className="absolute text-xs text-white/80 tabular-nums"
                      style={{
                        bottom: `${SAFE_PCT / 2}%`,
                        right: `${SAFE_PCT}%`,
                        textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                      }}
                    >
                      {page.pageNumber} / {scenario.pageCount}
                    </span>
                  </>
                ) : (
                  <>
                    {/* 이미지 영역 */}
                    <div
                      className="relative bg-gray-100 overflow-hidden"
                      style={{ height: `${imageRatio}%` }}
                    >
                      {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          배경 이미지 없음
                        </div>
                      )}
                    </div>

                    {/* 텍스트 영역 */}
                    <div
                      className="relative bg-cream px-6 py-5 flex items-center"
                      style={{ height: `${textRatio}%` }}
                    >
                      <div
                        className="text-gray-800 leading-relaxed text-[17px] sm:text-lg space-y-1"
                        style={{
                          fontFamily: "'Jua', sans-serif",
                          wordBreak: "keep-all",
                        }}
                      >
                        {splitSentences(replaceName(page.text)).map(
                          (sentence, i) => (
                            <p key={i}>{sentence}</p>
                          )
                        )}
                      </div>
                      <span className="absolute bottom-2 right-4 text-xs text-gray-400 tabular-nums">
                        {page.pageNumber} / {scenario.pageCount}
                      </span>
                    </div>
                  </>
                )}

                {/* 인쇄 가이드 오버레이 */}
                {showPrintGuides && (
                  <>
                    {/* 재단선 (bleed) — 빨간 실선 */}
                    <div
                      className="absolute pointer-events-none border border-red-500"
                      style={{
                        top: `${BLEED_PCT}%`,
                        bottom: `${BLEED_PCT}%`,
                        left: `${BLEED_PCT}%`,
                        right: `${BLEED_PCT}%`,
                      }}
                    />
                    {/* 안전 영역 (safe zone) — 초록 점선 */}
                    <div
                      className="absolute pointer-events-none border border-dashed border-green-500"
                      style={{
                        top: `${SAFE_PCT}%`,
                        bottom: `${SAFE_PCT}%`,
                        left: `${SAFE_PCT}%`,
                        right: `${SAFE_PCT}%`,
                      }}
                    />
                    <span className="absolute top-1 left-1 text-[10px] font-mono bg-red-500 text-white px-1 rounded">
                      TRIM {BLEED_PCT}%
                    </span>
                    <span
                      className="absolute text-[10px] font-mono bg-green-500 text-white px-1 rounded"
                      style={{ top: `${BLEED_PCT}%`, left: `${BLEED_PCT}%` }}
                    >
                      SAFE {SAFE_PCT}%
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
