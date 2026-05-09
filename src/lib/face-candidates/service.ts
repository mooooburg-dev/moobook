import {
  editImageWithFallback,
  getDefaultImageModel,
} from "@/lib/openai-image";
import { uploadImageBuffer } from "@/lib/storage/upload-image";
import { buildFaceCandidatePrompt } from "@/lib/scenarios/character-prompts";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AnchorMetadata,
  Book,
  ChildGender,
  FaceCandidateMetadata,
  PhotoAsset,
} from "@/types";

const FACE_BUCKET = "moobook_photos";
const FACE_PREFIX = "face-candidates";
const TARGET_COUNT = 3;

/**
 * 얼굴이 아닌 일러스트 해석만 살짝 다르게 유도하는 hint들 (Codex #2).
 */
const VARIANT_HINTS = [
  "slightly softer linework with a clean storybook look",
  "slightly more rounded storybook style with warm rosy tones",
  "slightly brighter palette with crisp watercolor edges",
];

export type CandidateLockResult =
  | { kind: "locked"; book: Book }
  | { kind: "in_progress"; book: Book }
  | { kind: "ready"; book: Book }
  | { kind: "not_found" };

function isMockMode(): boolean {
  return process.env.USE_MOCK_AI === "true" || !process.env.OPENAI_API_KEY;
}

function getPrimaryPhoto(photos: PhotoAsset[]): PhotoAsset {
  const primary = photos.find((p) => p.isPrimary);
  if (primary) return primary;
  return photos.slice().sort((a, b) => a.order - b.order)[0];
}

export function orderedPhotoUrls(photos: PhotoAsset[]): string[] {
  if (photos.length === 0) return [];
  const primary = getPrimaryPhoto(photos);
  const rest = photos
    .filter((p) => p.url !== primary.url)
    .sort((a, b) => a.order - b.order);
  return [primary.url, ...rest.map((p) => p.url)];
}

/**
 * Codex #6 반영: photo_url만 있는 기존 books도 photos 형태로 정상화해서 읽는다.
 */
export function resolvePhotos(book: Book): PhotoAsset[] {
  if (book.photos && book.photos.length > 0) return book.photos;
  if (book.photo_url) {
    return [
      {
        url: book.photo_url,
        order: 0,
        isPrimary: true,
        uploadedAt: book.created_at ?? new Date().toISOString(),
      },
    ];
  }
  return [];
}

export async function loadBook(bookId: string): Promise<Book | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("moobook_books")
    .select("*")
    .eq("id", bookId)
    .single();
  if (error || !data) return null;
  return data as Book;
}

/**
 * stale `faces_generating` 자동 회수 임계 (ms).
 * 이 시간보다 오래 진행 중이면 죽은 작업으로 보고 회수 가능.
 * Vercel maxDuration이 300s라 그보다 살짝 큰 값으로.
 */
const STALE_GENERATING_MS = 6 * 60 * 1000;

function isStaleGenerating(book: Book): boolean {
  if (book.status !== "faces_generating") return false;
  // 진행 흔적이 있다면 그 시각 기준, 없으면 created_at 기준 (insert 직후 stuck 케이스)
  const startedAt =
    (book.face_candidate_metadata as { createdAt?: string } | null)
      ?.createdAt ?? book.created_at;
  if (!startedAt) return true;
  const ageMs = Date.now() - new Date(startedAt).getTime();
  return ageMs > STALE_GENERATING_MS;
}

/**
 * Codex #1 반영: conditional update로 race condition 제거.
 * 허용된 시작 상태에서만 `faces_generating`으로 atomic 전환.
 * - 일반 호출: pending / faces_failed
 * - force=true: 위 + faces_ready + stale faces_generating(>6분)
 * 선점 실패 시 현재 상태를 분석해서 분기.
 */
export async function acquireFaceCandidatesLock(
  bookId: string,
  options: { force?: boolean } = {}
): Promise<CandidateLockResult> {
  const supabase = createAdminClient();

  const allowedStarts = options.force
    ? ["pending", "faces_failed", "faces_ready"]
    : ["pending", "faces_failed"];

  const { data: locked } = await supabase
    .from("moobook_books")
    .update({ status: "faces_generating" })
    .eq("id", bookId)
    .in("status", allowedStarts)
    .select("*")
    .maybeSingle();

  if (locked) {
    return { kind: "locked", book: locked as Book };
  }

  const current = await loadBook(bookId);
  if (!current) return { kind: "not_found" };

  // 강제 회수: faces_generating이지만 stale인 경우
  if (
    (options.force || isStaleGenerating(current)) &&
    current.status === "faces_generating"
  ) {
    const { data: reclaimed } = await supabase
      .from("moobook_books")
      .update({ status: "faces_generating" })
      .eq("id", bookId)
      .eq("status", "faces_generating")
      .select("*")
      .maybeSingle();
    if (reclaimed) {
      console.warn(
        `[face-candidates] stuck faces_generating 회수: bookId=${bookId}`
      );
      return { kind: "locked", book: reclaimed as Book };
    }
  }

  if (
    current.status === "faces_ready" &&
    (current.face_candidate_urls?.length ?? 0) > 0
  ) {
    return { kind: "ready", book: current };
  }
  return { kind: "in_progress", book: current };
}

interface RunOptions {
  bookId: string;
  gender: ChildGender;
  photos: PhotoAsset[];
  preferredModel?: string | null;
}

export interface RunResult {
  candidateUrls: string[];
  metadata: FaceCandidateMetadata;
}

/**
 * 핵심 후보 생성 로직. route와 smoke 가 공통으로 호출.
 */
export async function runFaceCandidatesGeneration(
  opts: RunOptions
): Promise<RunResult> {
  const supabase = createAdminClient();
  const sourceUrls = orderedPhotoUrls(opts.photos);
  const promptUsed = buildFaceCandidatePrompt(opts.gender, VARIANT_HINTS[0]);

  if (isMockMode()) {
    const mockUrls = Array.from(
      { length: TARGET_COUNT },
      (_, i) =>
        `https://placehold.co/1024x1024/ffd5b5/7c3aed?text=face-candidate+${i + 1}`
    );
    const metadata: FaceCandidateMetadata = {
      model: "mock",
      prompt: promptUsed,
      variantHints: VARIANT_HINTS,
      sourcePhotoUrls: sourceUrls,
      attempts: 1,
      createdAt: new Date().toISOString(),
    };
    await supabase
      .from("moobook_books")
      .update({
        status: "faces_ready",
        face_candidate_urls: mockUrls,
        face_candidate_metadata: metadata,
      })
      .eq("id", opts.bookId);
    return { candidateUrls: mockUrls, metadata };
  }

  let buffers: Buffer[] = [];
  const requestedModel = opts.preferredModel ?? getDefaultImageModel();
  let modelUsed = requestedModel;
  let attempts = 0;

  try {
    const first = await editImageWithFallback({
      prompt: buildFaceCandidatePrompt(opts.gender, VARIANT_HINTS[0]),
      references: sourceUrls.map((url, i) => ({
        url,
        name: i === 0 ? "primary-photo" : `photo-${i}`,
      })),
      size: "1024x1024",
      quality: "low",
      n: TARGET_COUNT,
      model: requestedModel,
    });
    attempts += 1;
    buffers = first.buffers;
    modelUsed = first.modelUsed;

    let hintIndex = 1;
    while (buffers.length < TARGET_COUNT && hintIndex < VARIANT_HINTS.length) {
      const extra = await editImageWithFallback({
        prompt: buildFaceCandidatePrompt(opts.gender, VARIANT_HINTS[hintIndex]),
        references: sourceUrls.map((url, i) => ({
          url,
          name: i === 0 ? "primary-photo" : `photo-${i}`,
        })),
        size: "1024x1024",
        quality: "low",
        n: 1,
        model: modelUsed,
      });
      attempts += 1;
      buffers.push(...extra.buffers);
      hintIndex += 1;
    }
    buffers = buffers.slice(0, TARGET_COUNT);
  } catch (err) {
    await supabase
      .from("moobook_books")
      .update({
        status: "faces_failed",
        face_candidate_metadata: {
          model: modelUsed,
          prompt: promptUsed,
          variantHints: VARIANT_HINTS,
          sourcePhotoUrls: sourceUrls,
          attempts,
          createdAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
        },
      })
      .eq("id", opts.bookId);
    throw err;
  }

  const uploadedUrls: string[] = [];
  for (let i = 0; i < buffers.length; i++) {
    const path = `${FACE_PREFIX}/${opts.bookId}/${i}.png`;
    const url = await uploadImageBuffer(supabase, {
      bucket: FACE_BUCKET,
      path,
      buffer: buffers[i],
      contentType: "image/png",
      upsert: true,
    });
    uploadedUrls.push(url);
  }

  const metadata: FaceCandidateMetadata = {
    model: modelUsed,
    prompt: promptUsed,
    variantHints: VARIANT_HINTS.slice(0, attempts),
    sourcePhotoUrls: sourceUrls,
    attempts,
    createdAt: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("moobook_books")
    .update({
      status: "faces_ready",
      face_candidate_urls: uploadedUrls,
      face_candidate_metadata: metadata,
    })
    .eq("id", opts.bookId);
  if (updateError) {
    throw new Error(`상태 업데이트 실패: ${updateError.message}`);
  }

  return { candidateUrls: uploadedUrls, metadata };
}

/**
 * 후보에서 anchor 선택. PATCH endpoint와 smoke가 공통으로 호출.
 */
export async function selectAnchorForBook(
  bookId: string,
  candidateIndex: number
): Promise<{ anchorFaceUrl: string; anchorMetadata: AnchorMetadata }> {
  const book = await loadBook(bookId);
  if (!book) throw new Error("book을 찾을 수 없음");
  const candidates = book.face_candidate_urls ?? [];
  if (candidateIndex < 0 || candidateIndex >= candidates.length) {
    throw new Error("candidateIndex 가 후보 범위를 벗어났습니다.");
  }

  const anchorUrl = candidates[candidateIndex];
  const anchorMetadata: AnchorMetadata = {
    selectedAt: new Date().toISOString(),
    candidateIndex,
    model: book.face_candidate_metadata?.model ?? "unknown",
    quality: "low",
  };

  const supabase = createAdminClient();
  const { error: updateError } = await supabase
    .from("moobook_books")
    .update({
      anchor_face_url: anchorUrl,
      anchor_metadata: anchorMetadata,
    })
    .eq("id", bookId);
  if (updateError) {
    throw new Error(`anchor 저장 실패: ${updateError.message}`);
  }
  return { anchorFaceUrl: anchorUrl, anchorMetadata };
}
