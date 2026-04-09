import Replicate from "replicate";
import type { Scenario, ScenarioPage } from "@/types";

// USE_MOCK_AI=true → Replicate 호출 없이 placeholder 반환
// REPLICATE_API_TOKEN 없어도 자동 mock
const MOCK_MODE =
  process.env.USE_MOCK_AI === "true" || !process.env.REPLICATE_API_TOKEN;

// DEV_PAGE_LIMIT=3 → 처음 3장만 실제 생성, 나머지 placeholder
const DEV_PAGE_LIMIT = process.env.DEV_PAGE_LIMIT
  ? parseInt(process.env.DEV_PAGE_LIMIT, 10)
  : null;

const replicate = MOCK_MODE
  ? null
  : new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

const MODEL_ID = "lucataco/ip-adapter-faceid";
const MODEL_VERSION =
  "fb81ef963e74776af72e6f380949013533d46dd5c6228a9e586c57db6303d7cd";

const PLACEHOLDER_IMAGE = (pageNumber: number) =>
  `https://placehold.co/768x1024/e8d5f5/7c3aed?text=Page+${pageNumber}`;

const MOCK_IMAGES = Array.from({ length: 12 }, (_, i) =>
  PLACEHOLDER_IMAGE(i + 1)
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GeneratePagesInput {
  photoUrl: string;
  scenario: Scenario;
  childName: string;
  bookId: string;
}

/**
 * 429/rate limit 에러 판별
 */
function is429Error(err: unknown): boolean {
  if (err && typeof err === "object") {
    // ApiError.response.status === 429
    const resp = (err as { response?: { status?: number } }).response;
    if (resp?.status === 429) return true;
    // 메시지 fallback
    if (err instanceof Error && err.message?.includes("429")) return true;
  }
  return false;
}

/**
 * 에러에서 retry_after 초 추출
 */
function getRetryAfterMs(err: unknown): number {
  if (err && typeof err === "object") {
    const resp = (err as { response?: Response }).response;
    if (resp?.headers) {
      const val = resp.headers.get?.("retry-after");
      if (val) return (parseInt(val, 10) + 2) * 1000;
    }
  }
  return 20_000; // 기본 20초 대기
}

/**
 * 단일 페이지 이미지 생성
 * - predictions.create + wait 방식으로 폴링 최소화
 * - 429 시 retry_after 대기 후 재시도 1회
 */
async function generateSinglePage(
  page: ScenarioPage,
  photoUrl: string,
  childName: string,
  bookId: string
): Promise<string> {
  const prompt = page.prompt.replace("{name}", childName);
  const tag = `[Replicate] p${page.pageNumber} (${bookId.slice(0, 8)})`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`${tag} 생성 시작 (시도 ${attempt + 1}/3)`);

      const prediction = await replicate!.predictions.create({
        version: MODEL_VERSION,
        input: {
          prompt,
          face_image: photoUrl,
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 30,
          negative_prompt:
            "monochrome, lowres, bad anatomy, worst quality, low quality, blurry, multiple people",
          agree_to_research_only: true,
        },
        wait: true,
      });

      if (prediction.status === "failed") {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }

      // succeeded인 경우 output에서 URL 추출
      if (prediction.status === "succeeded" && prediction.output) {
        const output = prediction.output as string[];
        if (output[0]) {
          console.log(`${tag} 생성 성공 ✓`);
          return output[0];
        }
      }

      // 아직 processing 중이면 직접 폴링
      if (prediction.status === "starting" || prediction.status === "processing") {
        console.log(`${tag} 아직 처리 중, 폴링...`);
        const result = await replicate!.wait(prediction, {});
        const output = result.output as string[] | undefined;
        if (output?.[0]) {
          console.log(`${tag} 생성 성공 (폴링) ✓`);
          return output[0];
        }
        throw new Error(`Prediction 완료됐지만 output 없음: ${result.status}`);
      }

      throw new Error(`예상치 못한 상태: ${prediction.status}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isRateLimit = is429Error(err);
      const waitMs = isRateLimit ? getRetryAfterMs(err) : 15_000;

      if (attempt < 2) {
        console.warn(
          `${tag} ${isRateLimit ? "rate limited" : "실패"}, ${Math.round(waitMs / 1000)}s 대기 후 재시도 (${errMsg})`
        );
        await sleep(waitMs);
      } else {
        console.error(`${tag} 최종 실패 → placeholder 대체 (${errMsg})`);
      }
    }
  }

  return PLACEHOLDER_IMAGE(page.pageNumber);
}

/**
 * preview용 3페이지 생성
 */
export async function generatePreviewPages({
  photoUrl,
  scenario,
  childName,
  bookId,
}: GeneratePagesInput): Promise<string[]> {
  if (MOCK_MODE) {
    console.log(`[MOCK] mock 이미지 반환 (bookId: ${bookId})`);
    return MOCK_IMAGES.slice(0, 3);
  }

  const previewPages = scenario.pages.slice(0, 3);
  const imageUrls: string[] = [];
  // 지금까지 실제 생성한 누적 수 (preview는 항상 0부터 시작)
  let generated = 0;

  for (const page of previewPages) {
    if (DEV_PAGE_LIMIT !== null && generated >= DEV_PAGE_LIMIT) {
      console.log(`[DEV] DEV_PAGE_LIMIT(${DEV_PAGE_LIMIT}) 도달, p${page.pageNumber} placeholder`);
      imageUrls.push(PLACEHOLDER_IMAGE(page.pageNumber));
    } else {
      const url = await generateSinglePage(page, photoUrl, childName, bookId);
      imageUrls.push(url);
      generated++;
    }
  }

  return imageUrls;
}

/**
 * 나머지 페이지(4~12) 생성
 */
export async function generateRemainingPages({
  photoUrl,
  scenario,
  childName,
  bookId,
}: GeneratePagesInput): Promise<string[]> {
  if (MOCK_MODE) {
    return MOCK_IMAGES.slice(3, scenario.pages.length);
  }

  const remainingPages = scenario.pages.slice(3);
  const imageUrls: string[] = [];
  // preview에서 최대 3장 생성했으므로 누적은 min(3, limit)부터
  const alreadyGenerated = DEV_PAGE_LIMIT !== null ? Math.min(3, DEV_PAGE_LIMIT) : 0;
  let generated = alreadyGenerated;

  for (const page of remainingPages) {
    if (DEV_PAGE_LIMIT !== null && generated >= DEV_PAGE_LIMIT) {
      imageUrls.push(PLACEHOLDER_IMAGE(page.pageNumber));
    } else {
      const url = await generateSinglePage(page, photoUrl, childName, bookId);
      imageUrls.push(url);
      generated++;
    }
  }

  return imageUrls;
}

export async function getPredictionStatus(predictionId: string) {
  if (!replicate) return null;
  return replicate.predictions.get(predictionId);
}
