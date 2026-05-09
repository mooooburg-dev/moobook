import { APIError } from "openai";

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
  FaceCandidateError,
  FaceCandidateMetadata,
  FaceGenerationLease,
  PhotoAsset,
} from "@/types";

const FACE_BUCKET = "moobook_photos";
const FACE_PREFIX = "face-candidates";
const TARGET_COUNT = 3;

const VARIANT_HINTS = [
  "slightly softer linework with a clean storybook look",
  "slightly more rounded storybook style with warm rosy tones",
  "slightly brighter palette with crisp watercolor edges",
];

/**
 * lease 만료 시간. 워커가 살아있다고 보는 최대 작업 시간.
 * Vercel maxDuration이 300s라서 그보다 살짝 큰 값.
 * Codex 피드백 #4/#7: created_at 기반 stale 판정은 부정확하므로 lock 시점에 명시 기록.
 */
const LEASE_TTL_MS = 6 * 60 * 1000;

export type CandidateLockResult =
  | { kind: "locked"; book: Book; lease: FaceGenerationLease }
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

function isLeaseExpired(lease: FaceGenerationLease | null): boolean {
  if (!lease?.leaseUntil) return true;
  return new Date(lease.leaseUntil).getTime() <= Date.now();
}

function buildLease(previousAttempt = 0): FaceGenerationLease {
  const now = Date.now();
  return {
    startedAt: new Date(now).toISOString(),
    leaseUntil: new Date(now + LEASE_TTL_MS).toISOString(),
    attemptId: crypto.randomUUID(),
    attempt: previousAttempt + 1,
  };
}

/**
 * Codex 피드백 #4/#7 반영: lock 획득 시 lease를 명시 기록한다.
 * - 정상 시작 상태(pending/faces_failed): 락 + 새 lease
 * - force=true: 위 + faces_ready (재생성)
 * - faces_generating + lease 만료: stuck으로 보고 회수, 새 attemptId로 lease 갱신
 *
 * "lease 만료" 판정은 lease.leaseUntil < now 만 본다 (created_at 휴리스틱 X).
 */
export async function acquireFaceCandidatesLock(
  bookId: string,
  options: { force?: boolean } = {}
): Promise<CandidateLockResult> {
  const supabase = createAdminClient();

  const allowedStarts = options.force
    ? ["pending", "faces_failed", "faces_ready"]
    : ["pending", "faces_failed"];

  // 1차: 정상 시작 상태에서 락 + 새 lease 기록
  const freshLease = buildLease();
  const { data: locked } = await supabase
    .from("moobook_books")
    .update({
      status: "faces_generating",
      face_generation_lease: freshLease,
    })
    .eq("id", bookId)
    .in("status", allowedStarts)
    .select("*")
    .maybeSingle();

  if (locked) {
    return { kind: "locked", book: locked as Book, lease: freshLease };
  }

  const current = await loadBook(bookId);
  if (!current) return { kind: "not_found" };

  // 2차: faces_generating에 lease 만료 또는 force일 때 회수
  if (current.status === "faces_generating") {
    const expired = isLeaseExpired(current.face_generation_lease);
    if (options.force || expired) {
      const previousAttempt = current.face_generation_lease?.attempt ?? 0;
      const reclaimedLease = buildLease(previousAttempt);

      // attemptId 가 동일한 row에서만 회수 (다른 워커가 막 lease를 갱신했으면 통과 안 함)
      let query = supabase
        .from("moobook_books")
        .update({
          status: "faces_generating",
          face_generation_lease: reclaimedLease,
        })
        .eq("id", bookId)
        .eq("status", "faces_generating");

      if (current.face_generation_lease?.attemptId) {
        query = query.eq(
          "face_generation_lease->>attemptId",
          current.face_generation_lease.attemptId
        );
      }

      const { data: reclaimed } = await query.select("*").maybeSingle();
      if (reclaimed) {
        console.warn(
          `[face-candidates] lease 만료 회수: bookId=${bookId} prevAttempt=${previousAttempt} reason=${
            options.force ? "force" : "stale"
          }`
        );
        return {
          kind: "locked",
          book: reclaimed as Book,
          lease: reclaimedLease,
        };
      }
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
  /** acquireFaceCandidatesLock 으로 받은 lease — attemptId/attempt 기록용 */
  lease: FaceGenerationLease;
}

export interface RunResult {
  candidateUrls: string[];
  metadata: FaceCandidateMetadata;
}

/**
 * Codex 피드백 #13: OpenAI 에러를 status/code/param/request_id 까지 구조화.
 */
function structureError(err: unknown, fallbackMessage: string): FaceCandidateError {
  if (err instanceof APIError) {
    return {
      status: err.status,
      code: (err.code ?? null) as string | null,
      param: (err.param ?? null) as string | null,
      requestId: (err.requestID ?? err.headers?.["x-request-id"] ?? null) as
        | string
        | null,
      message: err.message,
    };
  }
  return {
    message: err instanceof Error ? err.message : String(err) || fallbackMessage,
  };
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
      attemptId: opts.lease.attemptId,
    };
    await supabase
      .from("moobook_books")
      .update({
        status: "faces_ready",
        face_candidate_urls: mockUrls,
        face_candidate_metadata: metadata,
        face_generation_lease: null,
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
    const structured = structureError(err, "후보 생성 실패");
    // 다른 워커가 우리보다 먼저 회수해서 attemptId가 바뀌었을 수 있으므로
    // attemptId 가 동일할 때만 실패 상태를 기록한다.
    await supabase
      .from("moobook_books")
      .update({
        status: "faces_failed",
        face_generation_lease: null,
        face_candidate_metadata: {
          model: modelUsed,
          prompt: promptUsed,
          variantHints: VARIANT_HINTS,
          sourcePhotoUrls: sourceUrls,
          attempts,
          createdAt: new Date().toISOString(),
          attemptId: opts.lease.attemptId,
          error: structured,
        },
      })
      .eq("id", opts.bookId)
      .eq("face_generation_lease->>attemptId", opts.lease.attemptId);
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
    attemptId: opts.lease.attemptId,
  };

  const { error: updateError } = await supabase
    .from("moobook_books")
    .update({
      status: "faces_ready",
      face_candidate_urls: uploadedUrls,
      face_candidate_metadata: metadata,
      face_generation_lease: null,
    })
    .eq("id", opts.bookId)
    .eq("face_generation_lease->>attemptId", opts.lease.attemptId);
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
