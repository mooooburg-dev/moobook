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

const MODEL_ID = "black-forest-labs/flux-kontext-pro";

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
    const resp = (err as { response?: { status?: number } }).response;
    if (resp?.status === 429) return true;
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
  return 20_000;
}

/**
 * 단일 페이지 이미지 생성 (flux-kontext-pro)
 * - input_image + prompt로 얼굴 유지 + 스타일 변환
 * - 재시도 최대 3회, 429 시 retry_after 대기
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

      const output = await replicate!.run(MODEL_ID as `${string}/${string}`, {
        input: {
          prompt,
          input_image: photoUrl,
          aspect_ratio: "3:4",
          output_format: "png",
          safety_tolerance: 2,
        },
      });

      // Replicate SDK의 FileOutput은 ReadableStream을 상속하며
      // .url() 메서드 또는 toString()으로 URL을 반환
      console.log(`${tag} output type: ${typeof output}, constructor: ${output?.constructor?.name}`);

      let url: string | null = null;

      if (typeof output === "string") {
        url = output;
      } else if (output && typeof output === "object") {
        // FileOutput 객체: .url() 메서드로 URL 추출
        const obj = output as Record<string, unknown>;
        if (typeof obj.url === "function") {
          url = (obj.url as () => string)();
        } else if (typeof obj.url === "string") {
          url = obj.url;
        } else if (typeof obj.href === "string") {
          url = obj.href;
        }

        // 배열인 경우 첫 번째 요소에서 재귀적 추출
        if (!url && Array.isArray(output)) {
          const first = output[0];
          if (typeof first === "string") {
            url = first;
          } else if (first && typeof first === "object") {
            const f = first as Record<string, unknown>;
            if (typeof f.url === "function") {
              url = (f.url as () => string)();
            } else if (typeof f.url === "string") {
              url = f.url;
            } else if (typeof f.href === "string") {
              url = f.href;
            }
          }
        }
      }

      if (url && url.startsWith("http")) {
        console.log(`${tag} 생성 성공 (${url.slice(0, 60)}...)`);
        return url;
      }

      throw new Error(`예상치 못한 output: type=${typeof output}, value=${JSON.stringify(output)?.slice(0, 200)}`);
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
