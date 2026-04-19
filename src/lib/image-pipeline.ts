import type { ChildGender, Scenario, ScenarioPage, ThemeId } from "@/types";
import {
  generateImageWithReferences,
  isGeminiMockMode,
  PLACEHOLDER_IMAGE,
  type GeminiImageResult,
} from "@/lib/gemini";
import { buildSinglePageRegenerationPrompt } from "@/lib/scenarios/character-prompts";
import { swapFace } from "@/lib/replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImageBuffer } from "@/lib/storage/upload-image";

const MOCK_MODE = isGeminiMockMode();

const DEV_PAGE_LIMIT = process.env.DEV_PAGE_LIMIT
  ? parseInt(process.env.DEV_PAGE_LIMIT, 10)
  : null;

const MOCK_IMAGES = Array.from({ length: 12 }, (_, i) =>
  PLACEHOLDER_IMAGE(i + 1)
);

const BOOK_BUCKET = "moobook_photos";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GeneratePagesInput {
  photoUrl: string;
  scenario: Scenario;
  childName: string;
  bookId: string;
  gender: ChildGender;
}

function bookPagePath(bookId: string, pageNumber: number) {
  return `generated/${bookId}/page_${String(pageNumber).padStart(2, "0")}_${Date.now()}.png`;
}

async function persistIllustration(
  bookId: string,
  pageNumber: number,
  image: GeminiImageResult
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

/**
 * 단일 페이지 이미지 생성 (Gemini 일러스트 → Replicate face-swap)
 * Step 1: Gemini로 아이 사진 기반 일러스트 생성
 * Step 2: Replicate codeplugtech/face-swap으로 얼굴 합성
 * Step 2 실패 시 Step 1 결과로 fallback
 */
async function generateSinglePage(
  page: ScenarioPage,
  photoUrl: string,
  bookId: string,
  scenarioId: ThemeId,
  gender: ChildGender
): Promise<string> {
  const tag = `[Pipeline] p${page.pageNumber} (${bookId.slice(0, 8)})`;
  const prompt = buildSinglePageRegenerationPrompt(scenarioId, page, gender);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`${tag} 생성 시작 (시도 ${attempt + 1}/3)`);

      const image = await generateImageWithReferences(
        prompt,
        [{ url: photoUrl }],
        { tag, pageNumber: page.pageNumber, appendStyle: false }
      );

      const illustrationUrl = await persistIllustration(
        bookId,
        page.pageNumber,
        image
      );
      console.log(`${tag} [Step1] 일러스트 업로드 완료`);

      const finalUrl = await swapFace(illustrationUrl, photoUrl, tag);
      console.log(`${tag} 완료`);
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

export async function generatePreviewPages({
  photoUrl,
  scenario,
  bookId,
  gender,
}: GeneratePagesInput): Promise<string[]> {
  if (MOCK_MODE) {
    console.log(`[MOCK] mock 이미지 반환 (bookId: ${bookId})`);
    return MOCK_IMAGES.slice(0, 3);
  }

  const previewPages = scenario.pages.slice(0, 3);
  const imageUrls: string[] = [];
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
        photoUrl,
        bookId,
        scenario.id,
        gender
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

export async function generateRemainingPages({
  photoUrl,
  scenario,
  bookId,
  gender,
}: GeneratePagesInput): Promise<string[]> {
  if (MOCK_MODE) {
    return MOCK_IMAGES.slice(3, scenario.pages.length);
  }

  const remainingPages = scenario.pages.slice(3);
  const imageUrls: string[] = [];
  const alreadyGenerated =
    DEV_PAGE_LIMIT !== null ? Math.min(3, DEV_PAGE_LIMIT) : 0;
  let generated = alreadyGenerated;

  await sleep(2000);

  for (let i = 0; i < remainingPages.length; i++) {
    const page = remainingPages[i];
    if (DEV_PAGE_LIMIT !== null && generated >= DEV_PAGE_LIMIT) {
      imageUrls.push(PLACEHOLDER_IMAGE(page.pageNumber));
    } else {
      const url = await generateSinglePage(
        page,
        photoUrl,
        bookId,
        scenario.id,
        gender
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
