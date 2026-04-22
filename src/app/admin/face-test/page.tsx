"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, RefreshCcw, Trash2, Upload, Wand2, X } from "lucide-react";
import { toast } from "sonner";

import { scenarios, type PresetThemeId } from "@/lib/scenarios";
import {
  DEFAULT_FACE_TEST_MODEL_ID,
  FACE_TEST_MODELS,
  findFaceTestModel,
} from "@/lib/face-test/models";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  imageModel: string;
  createdAt: string;
}

interface FaceTestResultRow {
  id: string;
  child_photo_url: string;
  illustration_url: string;
  result_url: string;
  intensity: number;
  custom_prompt: string | null;
  prompt_used: string;
  mock: boolean;
  image_model: string | null;
  created_at: string;
}

function rowToEntry(row: FaceTestResultRow): HistoryEntry {
  return {
    id: row.id,
    childPhotoUrl: row.child_photo_url,
    illustrationUrl: row.illustration_url,
    resultUrl: row.result_url,
    promptUsed: row.prompt_used,
    intensity: row.intensity as Intensity,
    customPrompt: row.custom_prompt ?? "",
    mock: row.mock,
    imageModel: row.image_model ?? DEFAULT_FACE_TEST_MODEL_ID,
    createdAt: row.created_at,
  };
}

function modelLabel(id: string): string {
  return findFaceTestModel(id)?.label ?? id;
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

function HistoryCard({
  entry,
  onPreview,
  onDelete,
  deleting,
}: {
  entry: HistoryEntry;
  onPreview: (url: string, label: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const items: { url: string; label: string }[] = [
    { url: entry.childPhotoUrl, label: "원본 사진" },
    { url: entry.illustrationUrl, label: "원본 일러스트" },
    { url: entry.resultUrl, label: "합성 결과" },
  ];
  const created = new Date(entry.createdAt);
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onPreview(item.url, item.label)}
              className="relative aspect-square overflow-hidden rounded-md bg-muted transition hover:opacity-90 cursor-zoom-in"
            >
              <Image
                src={item.url}
                alt={item.label}
                fill
                sizes="180px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-indigo-100 text-indigo-700 px-2 py-0.5 font-medium">
            {modelLabel(entry.imageModel)}
          </span>
          <span className="rounded bg-muted px-2 py-0.5">
            강도 {entry.intensity}
          </span>
          {entry.mock && (
            <span className="rounded bg-amber-100 text-amber-700 px-2 py-0.5">
              mock
            </span>
          )}
          <span>
            {created.toLocaleDateString("ko-KR")}{" "}
            {created.toLocaleTimeString("ko-KR")}
          </span>
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            사용된 프롬프트 보기
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-3 text-[11px] leading-relaxed">
            {entry.promptUsed}
          </pre>
        </details>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(entry.id)}
            disabled={deleting}
            className="text-destructive hover:text-destructive"
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            삭제
          </Button>
        </div>
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
  const [modelId, setModelId] = useState<string>(DEFAULT_FACE_TEST_MODEL_ID);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [current, setCurrent] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(
    null
  );

  const openPreview = useCallback((url: string, label: string) => {
    setPreview({ url, label });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/face-test");
        if (!res.ok) return;
        const data = (await res.json()) as { results: FaceTestResultRow[] };
        if (cancelled) return;
        setHistory((data.results ?? []).map(rowToEntry));
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!confirm("이 히스토리를 삭제할까요?")) return;
      setDeletingId(id);
      try {
        const res = await fetch(`/api/admin/face-test?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "삭제 실패");
        }
        setHistory((prev) => prev.filter((e) => e.id !== id));
        setCurrent((prev) => (prev?.id === id ? null : prev));
        toast.success("삭제했어요");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "삭제 실패");
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

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
            model: modelId,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "합성 실패");
        }
        const data = (await res.json()) as { result: FaceTestResultRow };
        const entry = rowToEntry(data.result);
        setCurrent(entry);
        setHistory((prev) => [entry, ...prev]);
        toast.success("합성 완료");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "합성 실패");
      } finally {
        setLoading(false);
      }
    },
    [childPhotoUrl, illustrationUrl, intensity, customPrompt, modelId]
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
          결과물은 실제 주문 플로우와 무관하며, 히스토리는 DB에 저장되어 영구
          보존됩니다.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
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
              <Label>3. 이미지 모델</Label>
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FACE_TEST_MODELS.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      disabled={m.disabled}
                    >
                      {m.label}
                      {m.disabled && " (비활성)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {findFaceTestModel(modelId)?.description ?? ""}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>4. 합성 강도</Label>
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
              <Label htmlFor="custom-prompt">5. 추가 프롬프트 (선택)</Label>
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { label: "원본 사진", url: current.childPhotoUrl },
                    { label: "원본 일러스트", url: current.illustrationUrl },
                    { label: "합성 결과", url: current.resultUrl },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => openPreview(item.url, item.label)}
                        className="group relative aspect-square w-full overflow-hidden rounded-md border bg-muted transition hover:opacity-95 cursor-zoom-in"
                      >
                        <Image
                          src={item.url}
                          alt={item.label}
                          fill
                          sizes="(min-width: 1024px) 360px, (min-width: 768px) 30vw, 90vw"
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                      <p className="text-center text-xs text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded bg-indigo-100 text-indigo-700 px-2 py-0.5 font-medium">
                    {modelLabel(current.imageModel)}
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                    강도 {current.intensity}
                  </span>
                  {current.mock && (
                    <span className="rounded bg-amber-100 text-amber-700 px-2 py-0.5">
                      mock
                    </span>
                  )}
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
          <h2 className="text-lg font-semibold tracking-tight">
            히스토리
            {history.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({history.length})
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            최근 50개까지 표시됩니다.
          </p>
        </div>
        {historyLoading ? (
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground gap-2">
            <Loader2 className="size-4 animate-spin" />
            불러오는 중...
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            아직 시도한 합성이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                onPreview={openPreview}
                onDelete={deleteEntry}
                deleting={deletingId === entry.id}
              />
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent
          className="sm:max-w-[min(96vw,1280px)] p-0 overflow-hidden border-0 bg-transparent shadow-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {preview?.label ?? "이미지 확대"}
          </DialogTitle>
          {preview && (
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 z-10 rounded-full bg-background/90 p-2 shadow hover:bg-background"
                aria-label="닫기"
              >
                <X className="size-4" />
              </button>
              <div className="relative w-full max-h-[90vh] aspect-square bg-black/80 rounded-lg overflow-hidden">
                <Image
                  src={preview.url}
                  alt={preview.label}
                  fill
                  sizes="96vw"
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs shadow">
                {preview.label}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
