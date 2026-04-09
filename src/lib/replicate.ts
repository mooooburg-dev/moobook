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

interface GeneratePagesInput {
  photoUrl: string;
  scenario: Scenario;
  childName: string;
  bookId: string;
}

/**
 * 단일 페이지 이미지 생성 (재시도 1회 포함)
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
      if (attempt === 0) {
        console.warn(
          `[Replicate] 페이지 ${page.pageNumber} 생성 실패, 재시도... (bookId: ${bookId})`,
          err
        );
      } else {
        console.error(
          `[Replicate] 페이지 ${page.pageNumber} 재시도도 실패, placeholder 대체 (bookId: ${bookId})`,
          err
        );
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

  for (const page of previewPages) {
    const url = await generateSinglePage(page, photoUrl, childName, bookId);
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

  for (const page of remainingPages) {
    const url = await generateSinglePage(page, photoUrl, childName, bookId);
    imageUrls.push(url);
  }

  return imageUrls;
}

export async function getPredictionStatus(predictionId: string) {
  if (!replicate) return null;
  return replicate.predictions.get(predictionId);
}
