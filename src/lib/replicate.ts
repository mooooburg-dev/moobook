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

// 2단계 파이프라인 모델
const ILLUSTRATION_MODEL = "black-forest-labs/flux-kontext-pro";
const FACE_SWAP_MODEL_VERSION =
  "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34"; // codeplugtech/face-swap

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

function is429Error(err: unknown): boolean {
  if (err && typeof err === "object") {
    const resp = (err as { response?: { status?: number } }).response;
    if (resp?.status === 429) return true;
    if (err instanceof Error && err.message?.includes("429")) return true;
  }
  return false;
}

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
 * Step 1: flux-kontext-pro로 동화풍 일러스트 생성
 */
async function generateIllustration(
  prompt: string,
  photoUrl: string,
  tag: string
): Promise<string> {
  const output = await replicate!.run(
    ILLUSTRATION_MODEL as `${string}/${string}`,
    {
      input: {
        prompt,
        input_image: photoUrl,
        aspect_ratio: "3:4",
        output_format: "png",
        safety_tolerance: 2,
      },
    }
  );

  const url = String(output);
  if (!url.startsWith("http")) {
    throw new Error(`일러스트 생성 실패: 유효하지 않은 URL`);
  }

  console.log(`${tag} [Step1] 일러스트 생성 완료`);
  return url;
}

/**
 * Step 2: codeplugtech/face-swap으로 얼굴 합성
 * 실패 시 1단계 일러스트를 그대로 반환 (fallback)
 */
async function swapFace(
  illustrationUrl: string,
  photoUrl: string,
  tag: string
): Promise<string> {
  try {
    const prediction = await replicate!.predictions.create({
      version: FACE_SWAP_MODEL_VERSION,
      input: {
        input_image: illustrationUrl, // 타겟 (일러스트)
        swap_image: photoUrl, // 소스 (원본 사진의 얼굴)
      },
      wait: true,
    });

    if (prediction.status === "failed") {
      throw new Error(`Face swap failed: ${prediction.error}`);
    }

    let outputUrl: string | undefined;

    if (prediction.status === "succeeded" && prediction.output) {
      outputUrl = String(prediction.output);
    } else if (
      prediction.status === "starting" ||
      prediction.status === "processing"
    ) {
      const result = await replicate!.wait(prediction, {});
      outputUrl = result.output ? String(result.output) : undefined;
    }

    if (outputUrl?.startsWith("http")) {
      console.log(`${tag} [Step2] face swap 완료`);
      return outputUrl;
    }

    throw new Error("face swap output URL 없음");
  } catch (err) {
    console.warn(
      `${tag} [Step2] face swap 실패, 일러스트 원본 사용 (${err instanceof Error ? err.message : err})`
    );
    return illustrationUrl;
  }
}

/**
 * 단일 페이지 이미지 생성 (2단계 파이프라인)
 * Step 1: flux-kontext-pro → 동화풍 일러스트
 * Step 2: codeplugtech/face-swap → 얼굴 합성
 * 재시도 최대 3회, Step 2 실패 시 Step 1 결과로 fallback
 */
async function generateSinglePage(
  page: ScenarioPage,
  photoUrl: string,
  childName: string,
  bookId: string
): Promise<string> {
  const prompt = page.illustrationPrompt;
  const tag = `[Replicate] p${page.pageNumber} (${bookId.slice(0, 8)})`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`${tag} 생성 시작 (시도 ${attempt + 1}/3)`);

      // Step 1: 일러스트 생성
      const illustrationUrl = await generateIllustration(
        prompt,
        photoUrl,
        tag
      );

      // Step 2: 얼굴 합성 (실패 시 일러스트 그대로 사용)
      const finalUrl = await swapFace(illustrationUrl, photoUrl, tag);

      console.log(`${tag} 완료 (${finalUrl.slice(0, 60)}...)`);
      return finalUrl;
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

// TODO: 사전 생성된 배경을 scenario_backgrounds에서 조회하고,
// 해당 배경 위에 캐릭터를 합성하는 방식으로 전환 예정
// 현재는 기존 실시간 생성 로직 유지

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
      console.log(
        `[DEV] DEV_PAGE_LIMIT(${DEV_PAGE_LIMIT}) 도달, p${page.pageNumber} placeholder`
      );
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
  const alreadyGenerated =
    DEV_PAGE_LIMIT !== null ? Math.min(3, DEV_PAGE_LIMIT) : 0;
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
