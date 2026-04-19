/**
 * @deprecated 배경/캐릭터 이미지 생성은 @/lib/gemini 로 이관됨.
 * 이 파일은 실제 아이 얼굴을 일러스트에 합성하는 face-swap 전용 유틸로만 유지한다.
 */
import Replicate from "replicate";

// REPLICATE_API_TOKEN 없거나 USE_MOCK_AI=true이면 face-swap 스킵 (일러스트 원본 반환)
const MOCK_MODE =
  process.env.USE_MOCK_AI === "true" || !process.env.REPLICATE_API_TOKEN;

const replicate = MOCK_MODE
  ? null
  : new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

const FACE_SWAP_MODEL_VERSION =
  "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34"; // codeplugtech/face-swap

/**
 * codeplugtech/face-swap으로 일러스트에 실제 아이 얼굴 합성
 * 실패 시 일러스트 원본 URL을 그대로 반환 (fallback)
 */
export async function swapFace(
  illustrationUrl: string,
  photoUrl: string,
  tag: string
): Promise<string> {
  if (!replicate) {
    console.log(`${tag} [face-swap MOCK] 일러스트 원본 사용`);
    return illustrationUrl;
  }

  try {
    const prediction = await replicate.predictions.create({
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
      const result = await replicate.wait(prediction, {});
      outputUrl = result.output ? String(result.output) : undefined;
    }

    if (outputUrl?.startsWith("http")) {
      console.log(`${tag} [face-swap] 완료`);
      return outputUrl;
    }

    throw new Error("face swap output URL 없음");
  } catch (err) {
    console.warn(
      `${tag} [face-swap] 실패, 일러스트 원본 사용 (${err instanceof Error ? err.message : err})`
    );
    return illustrationUrl;
  }
}
