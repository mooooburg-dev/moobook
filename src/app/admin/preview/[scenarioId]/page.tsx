"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { scenarios, type PresetThemeId } from "@/lib/scenarios";
import { replaceChildName } from "@/lib/utils/korean-name";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { ChildGender, ScenarioIllustration } from "@/types";

const NAME_OPTIONS = ["지환", "서윤", "하윤", "도윤", "시우", "지안", "수아"];

const BLEED_PCT = 3;
const SAFE_PCT = 8;

function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+["'”’]?\s*/g);
  if (!matches) return [text.trim()].filter(Boolean);
  const rest = text.replace(matches.join(""), "").trim();
  const result = matches.map((s) => s.trim()).filter(Boolean);
  if (rest) result.push(rest);
  return result;
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; activeClass?: string }[];
}) {
  return (
    <div className="inline-flex rounded-md border bg-background overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 h-8 text-sm font-medium transition-colors cursor-pointer",
            value === opt.value
              ? opt.activeClass ?? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminPreviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.scenarioId as string;
  const scenario = scenarios[scenarioId as PresetThemeId];

  const [illustrations, setIllustrations] = useState<ScenarioIllustration[]>([]);
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
  const [gender, setGender] = useState<ChildGender>("boy");

  function pickImage(bg: ScenarioIllustration | undefined): string | null {
    if (!bg) return null;
    return bg.image_url ?? null;
  }

  const fetchBackgrounds = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/illustrations?scenarioId=${scenarioId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setIllustrations((data.illustrations ?? []) as ScenarioIllustration[]);
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    fetchBackgrounds();
  }, [fetchBackgrounds]);

  const bgMap = useMemo(() => {
    const map = new Map<number, ScenarioIllustration>();
    for (const row of illustrations) {
      if (row.gender !== gender) continue;
      map.set(row.page_number, row);
    }
    return map;
  }, [illustrations, gender]);

  type Leaf =
    | { type: "cover-front" }
    | { type: "cover-back" }
    | { type: "blank" }
    | { type: "letter" }
    | { type: "page"; pageNumber: number };

  const spreads: Array<[Leaf, Leaf]> = useMemo(() => {
    const list: Array<[Leaf, Leaf]> = [];
    if (!scenario) return list;
    list.push([{ type: "cover-front" }, { type: "cover-front" }]);
    const pageNums = scenario.pages.map((p) => p.pageNumber);
    if (pageNums.length > 0) {
      list.push([{ type: "letter" }, { type: "page", pageNumber: pageNums[0] }]);
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
    if (!first) return null;
    const bg = bgMap.get(first.pageNumber);
    if (!bg) return null;
    return bg.image_url ?? null;
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
      <div className="text-muted-foreground">존재하지 않는 시나리오입니다.</div>
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
    const imageUrl = pickImage(bg);
    const sentences = splitSentences(replaceName(page.text));

    if (overlayMode) {
      return (
        <>
          <div className="absolute inset-0 bg-muted">
            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-sm">
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
            className={cn(
              "absolute flex",
              overlayPosition === "top" ? "items-start" : "items-end"
            )}
            style={{
              top: overlayPosition === "top" ? `${SAFE_PCT}%` : "auto",
              bottom: overlayPosition === "bottom" ? `${SAFE_PCT}%` : "auto",
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
          className="relative bg-muted overflow-hidden"
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
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-sm">
              배경 이미지 없음
            </div>
          )}
        </div>
        <div
          className="relative bg-cream px-6 py-5 flex items-center"
          style={{ height: `${textRatio}%` }}
        >
          <div
            className="text-text leading-relaxed text-[17px] sm:text-lg space-y-1"
            style={{
              fontFamily: "'Jua', sans-serif",
              wordBreak: "keep-all",
            }}
          >
            {sentences.map((sentence, i) => (
              <p key={i}>{sentence}</p>
            ))}
          </div>
          <span className="absolute bottom-2 right-4 text-xs text-muted-foreground tabular-nums">
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
          <div className="absolute inset-0 bg-black/25" />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            <div
              className="text-xl sm:text-2xl opacity-95 mb-3"
              style={{ textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}
            >
              {replaceName("{childName}(이)의 특별한 이야기")}
            </div>
            <div
              className="text-5xl sm:text-6xl leading-tight drop-shadow"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.55)" }}
            >
              {scenario!.title}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderLetter() {
    return (
      <div className="absolute inset-0 bg-cream flex flex-col px-8 py-10">
        <div
          className="text-text/80 text-base mb-5"
          style={{ fontFamily: "'Jua', sans-serif" }}
        >
          {replaceName("사랑하는 {childName}(이)에게")}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-full border-b border-dashed border-border"
            />
          ))}
        </div>
        <div
          className="mt-5 text-right text-sm text-muted-foreground"
          style={{ fontFamily: "'Jua', sans-serif" }}
        >
          _______년 ___월 ___일
        </div>
      </div>
    );
  }

  function renderCoverBack() {
    return (
      <div className="absolute inset-0 bg-linear-to-br from-amber-100 to-rose-100 flex flex-col justify-between p-8">
        <div
          className="text-text text-base leading-relaxed"
          style={{
            fontFamily: "'Jua', sans-serif",
            wordBreak: "keep-all",
          }}
        >
          {scenario!.educationMessage}
        </div>
        <div className="text-right text-xs text-muted-foreground tabular-nums">
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
    else if (leaf.type === "letter") content = renderLetter();
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
              className={cn(
                "w-full max-w-[520px] relative rounded-xl overflow-hidden",
                aspectClass
              )}
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
          <Button
            variant="outline"
            onClick={() => setSpreadIndex((i) => Math.max(i - 1, 0))}
            disabled={spreadIndex === 0}
          >
            <ChevronLeft className="size-4" />
            이전
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {spreadIndex + 1} / {spreads.length}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setSpreadIndex((i) => Math.min(i + 1, spreads.length - 1))
            }
            disabled={spreadIndex === spreads.length - 1}
          >
            다음
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          ← / → 키로 페이지를 넘길 수 있어요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/admin/scenarios/${scenarioId}`)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-4" />
            목록으로
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {scenario.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {scenarioId} · {scenario.pageCount}페이지
            </p>
          </div>
        </div>
        <Button disabled variant="secondary">
          PDF로 내보내기
        </Button>
      </div>

      <Card className="sticky top-4 z-10 py-4 gap-0">
        <CardContent className="px-4 flex flex-wrap gap-x-6 gap-y-3 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">뷰 모드</Label>
            <ToggleGroup
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "spread", label: "펼침" },
                { value: "scroll", label: "스크롤" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">책 형태</Label>
            <ToggleGroup
              value={bookShape}
              onChange={setBookShape}
              options={[
                { value: "portrait", label: "세로형 3:4" },
                { value: "square", label: "정사각형" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">성별</Label>
            <ToggleGroup
              value={gender}
              onChange={setGender}
              options={[
                {
                  value: "boy" as ChildGender,
                  label: "👦 남아",
                  activeClass: "bg-blue-600 text-white",
                },
                {
                  value: "girl" as ChildGender,
                  label: "👧 여아",
                  activeClass: "bg-pink-500 text-white",
                },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">아이 이름</Label>
            <Select value={childName} onValueChange={setChildName}>
              <SelectTrigger size="sm" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NAME_OPTIONS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!overlayMode && (
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                이미지 : 텍스트
              </Label>
              <Slider
                min={60}
                max={80}
                step={1}
                value={imageRatio}
                onChange={(e) => setImageRatio(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap w-14 text-right">
                {imageRatio} : {textRatio}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Label htmlFor="overlay-mode" className="text-xs text-muted-foreground">
              오버레이
            </Label>
            <Switch
              id="overlay-mode"
              checked={overlayMode}
              onCheckedChange={setOverlayMode}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="print-guides" className="text-xs text-muted-foreground">
              인쇄 가이드
            </Label>
            <Switch
              id="print-guides"
              checked={showPrintGuides}
              onCheckedChange={setShowPrintGuides}
              className="data-[state=checked]:bg-red-500"
            />
          </div>

          {overlayMode && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">텍스트 위치</Label>
              <ToggleGroup
                value={overlayPosition}
                onChange={setOverlayPosition}
                options={[
                  { value: "top", label: "상단" },
                  { value: "bottom", label: "하단" },
                ]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-muted-foreground inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> 로딩 중...
        </div>
      ) : viewMode === "spread" ? (
        renderSpreadView()
      ) : (
        <div className="flex flex-col items-center gap-10 py-4">
          {scenario.pages.map((page) => {
            const bg = bgMap.get(page.pageNumber);
            const imageUrl = pickImage(bg);

            return (
              <div
                key={page.pageNumber}
                className={cn(
                  "w-full max-w-[480px] bg-white rounded-xl overflow-hidden border flex flex-col relative",
                  bookShape === "square" ? "aspect-square" : "aspect-3/4"
                )}
                style={{
                  boxShadow:
                    "0 10px 30px -5px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.05)",
                }}
              >
                {overlayMode ? (
                  <>
                    <div className="absolute inset-0 bg-muted">
                      {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-sm">
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
                      className={cn(
                        "absolute flex",
                        overlayPosition === "top" ? "items-start" : "items-end"
                      )}
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
                    <div
                      className="relative bg-muted overflow-hidden"
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
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-sm">
                          배경 이미지 없음
                        </div>
                      )}
                    </div>

                    <div
                      className="relative bg-cream px-6 py-5 flex items-center"
                      style={{ height: `${textRatio}%` }}
                    >
                      <div
                        className="text-text leading-relaxed text-[17px] sm:text-lg space-y-1"
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
                      <span className="absolute bottom-2 right-4 text-xs text-muted-foreground tabular-nums">
                        {page.pageNumber} / {scenario.pageCount}
                      </span>
                    </div>
                  </>
                )}

                {showPrintGuides && (
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
