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

// AI_MODEL 환경변수로 모델 전환 (기본: kontext-pro)
// "kontext-pro" | "flux-pulid"
const AI_MODEL = process.env.AI_MODEL || "kontext-pro";

const MODELS = {
  "kontext-pro": {
    id: "black-forest-labs/flux-kontext-pro",
    useVersion: false,
  },
  "flux-pulid": {
    id: "bytedance/flux-pulid",
    useVersion: true,
    version: "8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
  },
} as const;

const currentModel = MODELS[AI_MODEL as keyof typeof MODELS] ?? MODELS["kontext-pro"];

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
  const prompt = page.prompt;
  const tag = `[Replicate] p${page.pageNumber} (${bookId.slice(0, 8)})`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`${tag} 생성 시작 [${AI_MODEL}] (시도 ${attempt + 1}/3)`);

      let output: unknown;

      if (currentModel.useVersion) {
        // community model (flux-pulid 등): version 기반 predictions.create
        const prediction = await replicate!.predictions.create({
          version: (currentModel as typeof MODELS["flux-pulid"]).version,
          input: {
            prompt,
            main_face_image: photoUrl,
            width: 768,
            height: 1024,
            num_outputs: 1,
            num_steps: 20,
            guidance_scale: 4,
            id_weight: 1,
            output_format: "png",
            negative_prompt:
              "bad quality, worst quality, text, signature, watermark, extra limbs, low resolution, deformed, blurry, multiple people",
          },
          wait: true,
        });

        if (prediction.status === "failed") {
          throw new Error(`Prediction failed: ${prediction.error}`);
        }

        if (prediction.status === "succeeded" && prediction.output) {
          output = (prediction.output as string[])[0];
        } else if (prediction.status === "starting" || prediction.status === "processing") {
          const result = await replicate!.wait(prediction, {});
          output = (result.output as string[] | undefined)?.[0];
        } else {
          throw new Error(`예상치 못한 상태: ${prediction.status}`);
        }
      } else {
        // official model (kontext-pro): model 기반 run
        output = await replicate!.run(currentModel.id as `${string}/${string}`, {
          input: {
            prompt,
            input_image: photoUrl,
            aspect_ratio: "3:4",
            output_format: "png",
            safety_tolerance: 2,
          },
        });
      }

      const url = String(output);

      if (url.startsWith("http")) {
        console.log(`${tag} 생성 성공 (${url.slice(0, 80)}...)`);
        return url;
      }

      throw new Error(`유효하지 않은 output URL: ${url.slice(0, 200)}`);
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
