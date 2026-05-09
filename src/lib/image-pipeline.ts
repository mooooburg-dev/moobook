import type { ChildGender, Scenario, ScenarioPage, ThemeId } from "@/types";
import {
  isGeminiMockMode,
  PLACEHOLDER_IMAGE,
} from "@/lib/gemini";
import {
  buildAnchoredPagePrompt,
  buildSinglePageRegenerationPrompt,
} from "@/lib/scenarios/character-prompts";
import { swapFace } from "@/lib/replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImageBuffer } from "@/lib/storage/upload-image";
import {
  generateImageWithModel,
  type GenerateImageResult,
  type ImageReference,
} from "@/lib/image-generators";
import { getDefaultImageModel } from "@/lib/openai-image";

const MOCK_MODE = isGeminiMockMode();

const DEV_PAGE_LIMIT = process.env.DEV_PAGE_LIMIT
  ? parseInt(process.env.DEV_PAGE_LIMIT, 10)
  : null;

const MOCK_IMAGES = Array.from({ length: 12 }, (_, i) =>
  PLACEHOLDER_IMAGE(i + 1)
);

const BOOK_BUCKET = "moobook_photos";

/**
 * /api/generate 응답까지 동기로 생성할 preview 페이지 수.
 * 1로 둔 이유: dev/serverless 환경에서 동기 응답 대기 시간을 줄여
 * 라우트 핸들러가 timeout/abort에 노출되는 윈도우를 좁힌다.
 * 나머지 페이지는 응답 후 백그라운드로 진행되며 클라이언트가 폴링으로 받음.
 */
export const PREVIEW_PAGE_COUNT = 1;

const FACE_SWAP_ENABLED = process.env.ENABLE_FACE_SWAP === "true";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GeneratePagesInput {
  photoUrl: string;
  scenario: Scenario;
  childName: string;
  bookId: string;
  gender: ChildGender;
  /** 부모가 선택한 일러스트 anchor. 없으면 photoUrl을 anchor로 fallback (기존 books 호환) */
  anchorFaceUrl?: string | null;
  /** book별 모델 (없으면 env/기본 chain 사용) */
  imageModel?: string | null;
}

function bookPagePath(bookId: string, pageNumber: number) {
  return `generated/${bookId}/page_${String(pageNumber).padStart(2, "0")}_${Date.now()}.png`;
}

async function persistIllustration(
  bookId: string,
  pageNumber: number,
  image: GenerateImageResult
): Promise<string> {
  const supabase = createAdminClient();
  return uploadImageBuffer(supabase, {
    bucket: BOOK_BUCKET,
    path: bookPagePath(bookId, pageNumber),
    buffer: image.buffer,
    contentType: image.mimeType,
    upsert: true,
  });
}

function buildReferences(
  anchorUrl: string | null | undefined,
  photoUrl: string
): { references: ImageReference[]; hasPhotoReference: boolean; isAnchorMissing: boolean } {
  if (anchorUrl) {
    // anchor + 대표 원본 1장 (Codex 피드백 3번)
    return {
      references: [
        { url: anchorUrl, name: "anchor" },
        { url: photoUrl, name: "primary-photo" },
      ],
      hasPhotoReference: true,
      isAnchorMissing: false,
    };
  }
  // 기존 books 호환 — anchor 없으면 photo 단독
  return {
    references: [{ url: photoUrl, name: "primary-photo" }],
    hasPhotoReference: false,
    isAnchorMissing: true,
  };
}

async function generateSinglePage(
  page: ScenarioPage,
  photoUrl: string,
  bookId: string,
  scenarioId: ThemeId,
  gender: ChildGender,
  anchorFaceUrl: string | null | undefined,
  imageModel: string
): Promise<string> {
  const tag = `[Pipeline] p${page.pageNumber} (${bookId.slice(0, 8)})`;
  const { references, hasPhotoReference, isAnchorMissing } = buildReferences(
    anchorFaceUrl,
    photoUrl
  );

  // anchor가 있으면 anchor-based prompt, 없으면 기존 single-page regeneration prompt
  const prompt = isAnchorMissing
    ? buildSinglePageRegenerationPrompt(scenarioId, page, gender)
    : buildAnchoredPagePrompt(scenarioId, page, gender, hasPhotoReference);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(
        `${tag} 생성 시작 (시도 ${attempt + 1}/3, model=${imageModel}, anchor=${!isAnchorMissing})`
      );

      const image = await generateImageWithModel({
        prompt,
        references,
        size: "1024x1536",
        quality: "high",
        modelId: imageModel,
        tag,
        pageNumber: page.pageNumber,
      });

      const illustrationUrl = await persistIllustration(
        bookId,
        page.pageNumber,
        image
      );
      console.log(`${tag} [Step1] 일러스트 업로드 완료 (model=${image.modelUsed})`);

      if (!FACE_SWAP_ENABLED) {
        console.log(`${tag} 완료 (face-swap 비활성)`);
        return illustrationUrl;
      }

      const finalUrl = await swapFace(illustrationUrl, photoUrl, tag);
      console.log(`${tag} 완료 (face-swap 적용)`);
      return finalUrl;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (attempt < 2) {
        console.warn(`${tag} 실패, 10s 후 재시도 (${errMsg})`);
        await sleep(10_000);
      } else {
        console.error(`${tag} 최종 실패 → placeholder 대체 (${errMsg})`);
      }
    }
  }

  return PLACEHOLDER_IMAGE(page.pageNumber);
}

function resolveModel(input: GeneratePagesInput): string {
  return input.imageModel ?? getDefaultImageModel();
}

export async function generatePreviewPages(
  input: GeneratePagesInput
): Promise<string[]> {
  if (MOCK_MODE) {
    console.log(`[MOCK] mock 이미지 반환 (bookId: ${input.bookId})`);
    return MOCK_IMAGES.slice(0, PREVIEW_PAGE_COUNT);
  }

  const previewPages = input.scenario.pages.slice(0, PREVIEW_PAGE_COUNT);
  const imageUrls: string[] = [];
  const model = resolveModel(input);
  let generated = 0;

  for (let i = 0; i < previewPages.length; i++) {
    const page = previewPages[i];
    if (DEV_PAGE_LIMIT !== null && generated >= DEV_PAGE_LIMIT) {
      console.log(
        `[DEV] DEV_PAGE_LIMIT(${DEV_PAGE_LIMIT}) 도달, p${page.pageNumber} placeholder`
      );
      imageUrls.push(PLACEHOLDER_IMAGE(page.pageNumber));
    } else {
      const url = await generateSinglePage(
        page,
        input.photoUrl,
        input.bookId,
        input.scenario.id,
        input.gender,
        input.anchorFaceUrl,
        model
      );
      imageUrls.push(url);
      generated++;
      if (i < previewPages.length - 1) {
        await sleep(2000);
      }
    }
  }

  return imageUrls;
}

export async function generateRemainingPages(
  input: GeneratePagesInput
): Promise<string[]> {
  if (MOCK_MODE) {
    return MOCK_IMAGES.slice(PREVIEW_PAGE_COUNT, input.scenario.pages.length);
  }

  const remainingPages = input.scenario.pages.slice(PREVIEW_PAGE_COUNT);
  const imageUrls: string[] = [];
  const model = resolveModel(input);
  const alreadyGenerated =
    DEV_PAGE_LIMIT !== null
      ? Math.min(PREVIEW_PAGE_COUNT, DEV_PAGE_LIMIT)
      : 0;
  let generated = alreadyGenerated;

  await sleep(2000);

  for (let i = 0; i < remainingPages.length; i++) {
    const page = remainingPages[i];
    if (DEV_PAGE_LIMIT !== null && generated >= DEV_PAGE_LIMIT) {
      imageUrls.push(PLACEHOLDER_IMAGE(page.pageNumber));
    } else {
      const url = await generateSinglePage(
        page,
        input.photoUrl,
        input.bookId,
        input.scenario.id,
        input.gender,
        input.anchorFaceUrl,
        model
      );
      imageUrls.push(url);
      generated++;
      if (i < remainingPages.length - 1) {
        await sleep(2000);
      }
    }
  }

  return imageUrls;
}
