import Replicate from "replicate";
import type { Scenario } from "@/types";

const MOCK_MODE = !process.env.REPLICATE_API_TOKEN;

const replicate = MOCK_MODE
  ? null
  : new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

interface GeneratePagesInput {
  photoUrl: string;
  scenario: Scenario;
  childName: string;
  bookId: string;
}

// Mock 이미지 URL (Replicate 토큰 없을 때 사용)
const MOCK_IMAGES = [
  "https://placehold.co/768x1024/e8d5f5/7c3aed?text=Page+1",
  "https://placehold.co/768x1024/d5e8f5/3a7ced?text=Page+2",
  "https://placehold.co/768x1024/d5f5e8/3aed7c?text=Page+3",
  "https://placehold.co/768x1024/f5e8d5/ed7c3a?text=Page+4",
  "https://placehold.co/768x1024/f5d5e8/ed3a7c?text=Page+5",
  "https://placehold.co/768x1024/e8f5d5/7ced3a?text=Page+6",
  "https://placehold.co/768x1024/d5f5f5/3aeded?text=Page+7",
  "https://placehold.co/768x1024/f5f5d5/eded3a?text=Page+8",
  "https://placehold.co/768x1024/f5d5d5/ed3a3a?text=Page+9",
  "https://placehold.co/768x1024/d5d5f5/3a3aed?text=Page+10",
  "https://placehold.co/768x1024/e8e8d5/7c7c3a?text=Page+11",
  "https://placehold.co/768x1024/d5e8e8/3a7c7c?text=Page+12",
];

export async function generatePages({
  photoUrl,
  scenario,
  childName,
  bookId,
}: GeneratePagesInput): Promise<string[]> {
  if (MOCK_MODE) {
    console.log(`[MOCK] Replicate 토큰 없음 - mock 이미지로 대체 (bookId: ${bookId})`);
    // 실제 API 호출 대신 mock 이미지 반환
    return MOCK_IMAGES.slice(0, scenario.pages.length);
  }

  // Replicate API로 실제 이미지 생성
  const imageUrls: string[] = [];

  for (const page of scenario.pages) {
    const prompt = page.prompt.replace("{name}", childName);

    try {
      const output = await replicate!.run("lucataco/flux-dev-ip-adapter" as `${string}/${string}`, {
        input: {
          prompt,
          main_face_image: photoUrl,
          width: 768,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
        },
      });

      // output은 URL 배열
      const urls = output as string[];
      imageUrls.push(urls[0] || MOCK_IMAGES[page.pageNumber - 1]);
    } catch (err) {
      console.error(`페이지 ${page.pageNumber} 생성 실패:`, err);
      // 실패 시 mock 이미지로 대체
      imageUrls.push(MOCK_IMAGES[page.pageNumber - 1]);
    }
  }

  return imageUrls;
}

export async function getPredictionStatus(predictionId: string) {
  if (!replicate) return null;
  return replicate.predictions.get(predictionId);
}
