import {
  editImageWithFallback,
  getDefaultImageModel,
} from "@/lib/openai-image";
import {
  generateImageWithReferences,
  type GeminiImageResult,
} from "@/lib/gemini";

export type ImageProvider = "openai" | "gemini";

export interface ImageReference {
  url: string;
  /** 디버그/로그용 식별자 */
  name?: string;
}

export interface GenerateImageInput {
  prompt: string;
  references: ImageReference[];
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "low" | "medium" | "high";
  /** book.image_model 또는 env에서 결정된 모델 ID. 미지정 시 기본 chain. */
  modelId?: string;
  /** 호출 추적용 태그 */
  tag?: string;
  pageNumber?: number;
}

export interface GenerateImageResult {
  buffer: Buffer;
  mimeType: string;
  modelUsed: string;
  provider: ImageProvider;
}

function inferProvider(modelId: string): ImageProvider {
  if (modelId.startsWith("gpt-image")) return "openai";
  if (modelId.startsWith("gemini")) return "gemini";
  return "openai";
}

function geminiToResult(
  image: GeminiImageResult,
  modelUsed: string
): GenerateImageResult {
  return {
    buffer: image.buffer,
    mimeType: image.mimeType,
    modelUsed,
    provider: "gemini",
  };
}

/**
 * 모델 ID에 따라 provider를 분기해서 이미지 1장을 생성한다.
 * OpenAI 경로는 fallback chain(`openai-image.ts`)을 따라가며
 * Gemini 경로는 기존 `generateImageWithReferences`를 그대로 호출한다.
 */
export async function generateImageWithModel(
  input: GenerateImageInput
): Promise<GenerateImageResult> {
  const modelId = input.modelId ?? getDefaultImageModel();
  const provider = inferProvider(modelId);

  if (provider === "openai") {
    const result = await editImageWithFallback({
      prompt: input.prompt,
      references: input.references.map((r, i) => ({
        url: r.url,
        name: r.name ?? `ref-${i}`,
      })),
      size: input.size ?? "1024x1536",
      quality: input.quality ?? "high",
      n: 1,
      model: modelId,
    });
    return {
      buffer: result.buffers[0],
      mimeType: "image/png",
      modelUsed: result.modelUsed,
      provider: "openai",
    };
  }

  // gemini fallback (기존 경로)
  const image = await generateImageWithReferences(
    input.prompt,
    input.references.map((r) => ({ url: r.url })),
    {
      tag: input.tag,
      pageNumber: input.pageNumber,
      appendStyle: false,
    }
  );
  return geminiToResult(image, modelId);
}
