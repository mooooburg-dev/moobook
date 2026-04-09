import Replicate from "replicate";
import type { Scenario, ScenarioPage } from "@/types";

const MOCK_MODE = !process.env.REPLICATE_API_TOKEN;

const replicate = MOCK_MODE
  ? null
  : new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

const MODEL_ID = "lucataco/flux-dev-ip-adapter" as `${string}/${string}`;

const PLACEHOLDER_IMAGE = (pageNumber: number) =>
  `https://placehold.co/768x1024/e8d5f5/7c3aed?text=Page+${pageNumber}`;

// Mock 이미지 URL (Replicate 토큰 없을 때 사용)
const MOCK_IMAGES = Array.from({ length: 12 }, (_, i) =>
  PLACEHOLDER_IMAGE(i + 1)
);

// Rate limit 대응: 페이지 간 호출 간격 (ms)
const REQUEST_INTERVAL_MS = 12_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GeneratePagesInput {
  photoUrl: string;
  scenario: Scenario;
  childName: string;
  bookId: string;
}

/**
 * 429 에러에서 retry_after 값 추출
 */
function getRetryAfter(err: unknown): number | null {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    (err as { response: Response }).response
  ) {
    const res = (err as { response: Response }).response;
    const retryHeader = res.headers?.get?.("retry-after");
    if (retryHeader) return (parseInt(retryHeader, 10) + 1) * 1000;
  }
  return null;
}

function is429Error(err: unknown): boolean {
  return (
    err instanceof Error &&
    err.message?.includes("429")
  );
}

/**
 * 단일 페이지 이미지 생성 (재시도 1회 + rate limit 대기 포함)
 */
async function generateSinglePage(
  page: ScenarioPage,
  photoUrl: string,
  childName: string,
  bookId: string
): Promise<string> {
  const prompt = page.prompt.replace("{name}", childName);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const output = await replicate!.run(MODEL_ID, {
        input: {
          prompt,
          main_face_image: photoUrl,
          width: 768,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
        },
      });

      const urls = output as string[];
      if (urls[0]) return urls[0];
      throw new Error("빈 응답");
    } catch (err) {
      const tag = `[Replicate] 페이지 ${page.pageNumber} (bookId: ${bookId})`;

      if (attempt === 0) {
        // 429면 retry_after만큼 대기 후 재시도
        if (is429Error(err)) {
          const waitMs = getRetryAfter(err) ?? 15_000;
          console.warn(`${tag} rate limited, ${waitMs}ms 대기 후 재시도...`);
          await sleep(waitMs);
        } else {
          console.warn(`${tag} 생성 실패, 재시도...`, err);
        }
      } else {
        console.error(`${tag} 재시도도 실패, placeholder 대체`, err);
      }
    }
  }

  return PLACEHOLDER_IMAGE(page.pageNumber);
}

/**
 * preview용 3페이지만 생성하여 반환
 */
export async function generatePreviewPages({
  photoUrl,
  scenario,
  childName,
  bookId,
}: GeneratePagesInput): Promise<string[]> {
  if (MOCK_MODE) {
    console.log(
      `[MOCK] Replicate 토큰 없음 - mock 이미지로 대체 (bookId: ${bookId})`
    );
    return MOCK_IMAGES.slice(0, 3);
  }

  const previewPages = scenario.pages.slice(0, 3);
  const imageUrls: string[] = [];

  for (let i = 0; i < previewPages.length; i++) {
    if (i > 0) await sleep(REQUEST_INTERVAL_MS);
    const url = await generateSinglePage(previewPages[i], photoUrl, childName, bookId);
    imageUrls.push(url);
  }

  return imageUrls;
}

/**
 * 나머지 페이지(4~12) 생성하여 반환
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

  for (let i = 0; i < remainingPages.length; i++) {
    if (i > 0) await sleep(REQUEST_INTERVAL_MS);
    const url = await generateSinglePage(remainingPages[i], photoUrl, childName, bookId);
    imageUrls.push(url);
  }

  return imageUrls;
}

export async function getPredictionStatus(predictionId: string) {
  if (!replicate) return null;
  return replicate.predictions.get(predictionId);
}
