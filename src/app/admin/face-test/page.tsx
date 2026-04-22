"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, RefreshCcw, Upload, Wand2, X } from "lucide-react";
import { toast } from "sonner";

import { scenarios, type PresetThemeId } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  ChildGender,
  IllustrationStatus,
  ScenarioIllustration,
} from "@/types";

type Intensity = 1 | 2 | 3 | 4 | 5;
type IllustrationSource = "scenario" | "direct";

interface HistoryEntry {
  id: string;
  childPhotoUrl: string;
  illustrationUrl: string;
  resultUrl: string;
  promptUsed: string;
  intensity: Intensity;
  customPrompt: string;
  mock: boolean;
  createdAt: number;
}

const INTENSITY_LABELS: Record<Intensity, string> = {
  1: "실사 95% (매우 미세한 일러스트 효과)",
  2: "실사 우세 (연한 수채화 터치)",
  3: "균형 (실사 + 일러스트 혼합)",
  4: "일러스트 우세 (얼굴 특징 보존)",
  5: "일러스트 95% (얼굴 특징만 유지)",
};

const scenarioOptions = (Object.keys(scenarios) as PresetThemeId[]).map(
  (id) => ({ id, title: scenarios[id].title })
);

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "업로드 실패");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

function ImageDropzone({
  label,
  description,
  value,
  onChange,
  uploading,
}: {
  label: string;
  description: string;
  value: string | null;
  onChange: (url: string | null) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        toast.error("JPG, PNG, WEBP 만 지원합니다.");
        return;
      }
      try {
        const url = await uploadImage(file);
        onChange(url);
        toast.success("업로드 완료");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "업로드 실패");
      }
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative aspect-square w-full rounded-lg border-2 border-dashed bg-muted/30 transition-colors cursor-pointer overflow-hidden",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt={label}
              fill
              sizes="320px"
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-2 right-2 rounded-full bg-background/90 p-1 shadow hover:bg-background"
              aria-label="제거"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Upload className="size-6" />
            )}
            <span className="text-sm">
              {uploading ? "업로드 중..." : "클릭 또는 드래그해서 업로드"}
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

function ScenarioIllustrationPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [scenarioId, setScenarioId] = useState<PresetThemeId>(
    scenarioOptions[0].id
  );
  const [gender, setGender] = useState<ChildGender>("boy");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [rows, setRows] = useState<ScenarioIllustration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/illustrations?scenarioId=${scenarioId}`
      );
      if (!res.ok) {
        setRows([]);
        return;
      }
      const data = (await res.json()) as {
        illustrations: ScenarioIllustration[];
      };
      setRows(data.illustrations ?? []);
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const current = useMemo(
    () =>
      rows.find(
        (r) => r.gender === gender && r.page_number === pageNumber
      ) ?? null,
    [rows, gender, pageNumber]
  );

  const pageCount = scenarios[scenarioId].pageCount;

  useEffect(() => {
    if (!current?.image_url) {
      if (value !== null) onChange(null);
      return;
    }
    const status: IllustrationStatus = current.status;
    if (status === "completed" || status === "approved") {
      if (value !== current.image_url) {
        onChange(current.image_url);
      }
    } else if (value !== null) {
      onChange(null);
    }
  }, [current, value, onChange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs">시나리오</Label>
          <Select
            value={scenarioId}
            onValueChange={(v) => setScenarioId(v as PresetThemeId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarioOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">성별</Label>
          <Select
            value={gender}
            onValueChange={(v) => setGender(v as ChildGender)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boy">남아</SelectItem>
              <SelectItem value="girl">여아</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">페이지</Label>
          <Select
            value={String(pageNumber)}
            onValueChange={(v) => setPageNumber(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}페이지
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted/30">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : current?.image_url &&
          (current.status === "completed" ||
            current.status === "approved") ? (
          <Image
            src={current.image_url}
            alt="선택된 일러스트"
            fill
            sizes="320px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-muted-foreground px-4">
            {current?.status
              ? `이 페이지 상태: ${current.status} (생성 완료된 일러스트만 사용 가능)`
              : "선택한 페이지에 생성된 일러스트가 없습니다."}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {[entry.childPhotoUrl, entry.illustrationUrl, entry.resultUrl].map(
            (url, idx) => (
              <div
                key={idx}
                className="relative aspect-square overflow-hidden rounded-md bg-muted"
              >
                <Image
                  src={url}
                  alt={["원본", "일러스트", "결과"][idx]}
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-muted px-2 py-0.5">
            강도 {entry.intensity}
          </span>
          {entry.mock && (
            <span className="rounded bg-amber-100 text-amber-700 px-2 py-0.5">
              mock
            </span>
          )}
          <span>{new Date(entry.createdAt).toLocaleTimeString("ko-KR")}</span>
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            사용된 프롬프트 보기
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-3 text-[11px] leading-relaxed">
            {entry.promptUsed}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}

export default function AdminFaceTestPage() {
  const [childPhotoUrl, setChildPhotoUrl] = useState<string | null>(null);
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);
  const [illustrationSource, setIllustrationSource] =
    useState<IllustrationSource>("scenario");
  const [scenarioIllustrationUrl, setScenarioIllustrationUrl] = useState<
    string | null
  >(null);
  const [directIllustrationUrl, setDirectIllustrationUrl] = useState<
    string | null
  >(null);
  const [intensity, setIntensity] = useState<Intensity>(3);
  const [customPrompt, setCustomPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setIllustrationUrl(
      illustrationSource === "scenario"
        ? scenarioIllustrationUrl
        : directIllustrationUrl
    );
  }, [illustrationSource, scenarioIllustrationUrl, directIllustrationUrl]);

  const canSubmit =
    !!childPhotoUrl && !!illustrationUrl && !loading;

  const submit = useCallback(
    async (overridePrompt?: string) => {
      if (!childPhotoUrl || !illustrationUrl) return;
      setLoading(true);
      try {
        const res = await fetch("/api/admin/face-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childPhotoUrl,
            illustrationUrl,
            intensity,
            customPrompt: overridePrompt ?? customPrompt,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "합성 실패");
        }
        const data = (await res.json()) as {
          resultUrl: string;
          promptUsed: string;
          mock: boolean;
        };
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          childPhotoUrl,
          illustrationUrl,
          resultUrl: data.resultUrl,
          promptUsed: data.promptUsed,
          intensity,
          customPrompt: overridePrompt ?? customPrompt,
          mock: data.mock,
          createdAt: Date.now(),
        };
        setCurrent(entry);
        setHistory((prev) => [entry, ...prev]);
        toast.success("합성 완료");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "합성 실패");
      } finally {
        setLoading(false);
      }
    },
    [childPhotoUrl, illustrationUrl, intensity, customPrompt]
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Wand2 className="size-5" />
          얼굴 합성 테스트
        </h1>
        <p className="text-sm text-muted-foreground">
          아이 사진을 일러스트에 합성해 보는 전용 테스트 페이지입니다. 이 페이지의
          결과물은 실제 주문 플로우와 무관하며, 세션 내에서만 히스토리가
          유지됩니다.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">입력</CardTitle>
            <CardDescription>
              아이 사진과 대상 일러스트를 고르고, 합성 강도와 추가 프롬프트를
              조정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ImageDropzone
              label="1. 아이 사진"
              description="JPG, PNG, WEBP (최대 10MB)"
              value={childPhotoUrl}
              onChange={setChildPhotoUrl}
              uploading={false}
            />

            <Separator />

            <div className="flex flex-col gap-3">
              <Label>2. 대상 일러스트</Label>
              <Tabs
                value={illustrationSource}
                onValueChange={(v) =>
                  setIllustrationSource(v as IllustrationSource)
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scenario">시나리오에서 선택</TabsTrigger>
                  <TabsTrigger value="direct">직접 업로드</TabsTrigger>
                </TabsList>
                <TabsContent value="scenario" className="mt-4">
                  <ScenarioIllustrationPicker
                    value={scenarioIllustrationUrl}
                    onChange={setScenarioIllustrationUrl}
                  />
                </TabsContent>
                <TabsContent value="direct" className="mt-4">
                  <ImageDropzone
                    label="일러스트 이미지"
                    description="이미 생성된 일러스트를 직접 올립니다."
                    value={directIllustrationUrl}
                    onChange={setDirectIllustrationUrl}
                    uploading={false}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>3. 합성 강도</Label>
                <span className="text-xs text-muted-foreground">
                  {intensity} / 5
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={intensity}
                onChange={(e) =>
                  setIntensity(Number(e.target.value) as Intensity)
                }
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>실사에 가깝게</span>
                <span>일러스트에 가깝게</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {INTENSITY_LABELS[intensity]}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="custom-prompt">4. 추가 프롬프트 (선택)</Label>
              <textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="예: keep the child smiling, slightly warmer tones"
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            <Button
              onClick={() => submit()}
              disabled={!canSubmit}
              className="w-full"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "합성 중..." : "합성 시작"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">결과</CardTitle>
            <CardDescription>
              원본 사진 · 원본 일러스트 · 합성 결과를 나란히 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {current ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "원본 사진", url: current.childPhotoUrl },
                    { label: "원본 일러스트", url: current.illustrationUrl },
                    { label: "합성 결과", url: current.resultUrl },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1">
                      <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={item.url}
                          alt={item.label}
                          fill
                          sizes="240px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <p className="text-center text-[11px] text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs">사용된 프롬프트</Label>
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-[11px] leading-relaxed">
                    {current.promptUsed}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => submit(current.customPrompt)}
                    disabled={loading}
                  >
                    <RefreshCcw className="size-4" />
                    다시 시도
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomPrompt(current.customPrompt);
                      toast.info(
                        "프롬프트를 에디터에 불러왔어요. 수정 후 다시 [합성 시작]을 눌러주세요."
                      );
                    }}
                    disabled={loading}
                  >
                    프롬프트 수정 후 시도
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                아직 합성 결과가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">히스토리</h2>
          <p className="text-xs text-muted-foreground">
            페이지 새로고침 시 초기화됩니다.
          </p>
        </div>
        {history.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            아직 시도한 합성이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((entry) => (
              <HistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
