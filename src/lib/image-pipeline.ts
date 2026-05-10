import type { ChildGender, ScenarioPage, ThemeId } from "@/types";
import { swapFace } from "@/lib/replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImageFromUrl } from "@/lib/storage/upload-image";
import { fetchPreGeneratedIllustration } from "@/lib/scenarios/illustrations";

const BOOK_BUCKET = "moobook_photos";

const FACE_SWAP_ENABLED = process.env.ENABLE_FACE_SWAP === "true";

function bookPagePath(bookId: string, pageNumber: number) {
  return `generated/${bookId}/page_${String(pageNumber).padStart(2, "0")}_${Date.now()}.png`;
}

export interface GenerateOnePageInput {
  page: ScenarioPage;
  photoUrl: string;
  bookId: string;
  scenarioId: ThemeId;
  gender: ChildGender;
}

/**
 * 단일 페이지 생성 (외부 호출용 래퍼).
 * polling-driven 페이지 생성 서비스에서 사용.
 */
export async function generateOnePage(
  input: GenerateOnePageInput
): Promise<string> {
  return generateSinglePage(
    input.page,
    input.photoUrl,
    input.bookId,
    input.scenarioId,
    input.gender
  );
}

/**
 * 페이지 생성 정책상 복구 불가능한 실패. 호출자(`generateNextPage`)가 잡아서
 * book.status 를 `photo_unsuitable` 로 전이시킨다.
 */
export class PhotoUnsuitableError extends Error {
  readonly pageNumber: number;
  readonly cause: "face_swap_failed" | "missing_pre_illustration";

  constructor(
    pageNumber: number,
    cause: "face_swap_failed" | "missing_pre_illustration",
    detail?: string
  ) {
    super(
      detail
        ? `[p${pageNumber}] ${cause}: ${detail}`
        : `[p${pageNumber}] ${cause}`
    );
    this.name = "PhotoUnsuitableError";
    this.pageNumber = pageNumber;
    this.cause = cause;
  }
}

/**
 * face-swap 결과(외부 Replicate URL)를 우리 Storage로 옮겨 영구 보존.
 * Replicate 출력은 약 1시간 후 만료되므로 그대로 DB에 저장하면 안 됨.
 */
async function persistSwappedIllustration(
  bookId: string,
  pageNumber: number,
  swappedUrl: string
): Promise<string> {
  const supabase = createAdminClient();
  return uploadImageFromUrl(supabase, {
    bucket: BOOK_BUCKET,
    path: bookPagePath(bookId, pageNumber),
    url: swappedUrl,
    upsert: true,
  });
}

/**
 * 단일 경로 페이지 생성:
 *   사전 일러스트(approved/completed) + photo face-swap 1회 → Storage 영구화
 *
 * 정책상 ThemeSelector 가 12장 모두 완비된 시나리오만 노출하므로
 * 사전 일러스트 누락은 정상 흐름에선 발생하지 않는다. 그래도 운영 중
 * 어드민이 일러스트를 회수하는 등의 이유로 missing 이 발생할 수 있어
 * 그 경우와 face-swap 실패는 모두 PhotoUnsuitableError 로 전파한다.
 *
 * face-swap이 비활성(env)인 환경은 dev/mock 전용으로만 의도하며, 그 경우
 * base 일러스트를 그대로 사용한다 (얼굴 합성 없음).
 */
async function generateSinglePage(
  page: ScenarioPage,
  photoUrl: string,
  bookId: string,
  scenarioId: ThemeId,
  gender: ChildGender
): Promise<string> {
  const tag = `[Pipeline] p${page.pageNumber} (${bookId.slice(0, 8)})`;

  const baseUrl = await fetchPreGeneratedIllustration(
    scenarioId,
    page.pageNumber,
    gender
  );
  if (!baseUrl) {
    throw new PhotoUnsuitableError(
      page.pageNumber,
      "missing_pre_illustration",
      `scenario=${scenarioId}, gender=${gender}`
    );
  }

  if (!FACE_SWAP_ENABLED) {
    console.log(`${tag} 사전 일러스트 사용 (face-swap 비활성)`);
    return baseUrl;
  }

  const swap = await swapFace(baseUrl, photoUrl, tag);
  if (!swap.ok) {
    throw new PhotoUnsuitableError(
      page.pageNumber,
      "face_swap_failed",
      swap.reason
    );
  }

  const persistedUrl = await persistSwappedIllustration(
    bookId,
    page.pageNumber,
    swap.url
  );
  console.log(`${tag} 사전 일러스트 + face-swap 완료`);
  return persistedUrl;
}
