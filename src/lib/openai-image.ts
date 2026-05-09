import OpenAI, { APIError, toFile } from "openai";
import type { ImageEditParamsNonStreaming } from "openai/resources/images";

/**
 * 동작 검증된 모델만 화이트리스트로 둔다.
 * 첫 번째가 우선이고, 실패 시 다음 모델로 fallback.
 */
const MODEL_FALLBACK_CHAIN = [
  "gpt-image-2",
  "gpt-image-1.5",
  "gpt-image-1",
] as const;

export type SupportedImageModel = (typeof MODEL_FALLBACK_CHAIN)[number];

/**
 * `input_fidelity` 파라미터를 지원하는 모델만 화이트리스트.
 * Codex 피드백 #3: gpt-image-2가 아닌 모델이 모두 지원하는 게 아니라
 * 일부 모델만 지원함. 미지원 모델에 넣으면 400/unsupported_parameter.
 */
const INPUT_FIDELITY_SUPPORTED = new Set<string>(["gpt-image-1"]);

function supportsInputFidelity(modelId: string): boolean {
  return INPUT_FIDELITY_SUPPORTED.has(modelId);
}

export function getDefaultImageModel(): string {
  const env = process.env.OPENAI_IMAGE_MODEL;
  if (env && MODEL_FALLBACK_CHAIN.includes(env as SupportedImageModel)) {
    return env;
  }
  return MODEL_FALLBACK_CHAIN[0];
}

export function getModelFallbackChain(preferred?: string): string[] {
  const start =
    preferred && MODEL_FALLBACK_CHAIN.includes(preferred as SupportedImageModel)
      ? (preferred as SupportedImageModel)
      : getDefaultImageModel();
  const chain = [start as string];
  for (const m of MODEL_FALLBACK_CHAIN) {
    if (!chain.includes(m)) chain.push(m);
  }
  return chain;
}

let cachedClient: OpenAI | null = null;
function getClient(): OpenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 환경변수가 설정되지 않음");
  }
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

/**
 * URL → OpenAI 호환 File 객체. face-test/route.ts:85 에서 추출.
 */
export async function fetchAsBlobPart(url: string, fallbackName: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`이미지 fetch 실패 (${fallbackName}): ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/png";
  const ext = contentType.includes("jpeg")
    ? "jpg"
    : contentType.includes("webp")
      ? "webp"
      : "png";
  const filename = `${fallbackName}.${ext}`;
  return toFile(Buffer.from(arrayBuffer), filename, { type: contentType });
}

export interface EditOptions {
  prompt: string;
  references: Array<{ url: string; name: string }>;
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "low" | "medium" | "high";
  /** OpenAI n 파라미터. 일부 모델은 미지원 — 미지원이면 자동으로 1로 fallback. */
  n?: number;
  /** 모델 미지정 시 환경변수/기본 chain 사용 */
  model?: string;
}

export interface EditResult {
  buffers: Buffer[];
  modelUsed: string;
}

interface ParamErrorInfo {
  isModelError: boolean;
  unsupportedParam: string | null;
}

/**
 * OpenAI APIError를 status/code/param 기반으로 분류.
 * Codex 피드백 #2: 메시지 정규식이 아니라 구조화된 필드를 본다.
 */
function classifyApiError(err: unknown): ParamErrorInfo {
  const fallback = { isModelError: false, unsupportedParam: null };
  if (!(err instanceof APIError)) return fallback;

  const status = err.status;
  const code = (err.code ?? null) as string | null;
  const param = (err.param ?? null) as string | null;
  const type = (err.type ?? null) as string | null;

  // 모델 자체 문제 (404 model_not_found, 400 invalid_model)
  if (status === 404 && code === "model_not_found") {
    return { isModelError: true, unsupportedParam: null };
  }
  if (
    status === 400 &&
    (code === "invalid_model" ||
      code === "model_not_supported" ||
      param === "model")
  ) {
    return { isModelError: true, unsupportedParam: null };
  }

  // unsupported parameter — 같은 모델에서 해당 파라미터 빼고 재시도 가능
  if (
    status === 400 &&
    (code === "unsupported_parameter" ||
      code === "invalid_parameter" ||
      type === "invalid_request_error")
  ) {
    if (param) return { isModelError: false, unsupportedParam: param };
  }

  return fallback;
}

function buildParams(
  modelId: string,
  options: EditOptions,
  refFiles: Array<Awaited<ReturnType<typeof toFile>>>,
  overrides: { skipN?: boolean; skipFidelity?: boolean }
): ImageEditParamsNonStreaming {
  const params: ImageEditParamsNonStreaming = {
    model: modelId,
    image: refFiles,
    prompt: options.prompt,
    size: options.size ?? "1024x1024",
    quality: options.quality ?? "low",
  };
  if (!overrides.skipN && options.n && options.n > 1) {
    params.n = options.n;
  }
  if (!overrides.skipFidelity && supportsInputFidelity(modelId)) {
    params.input_fidelity = "high";
  }
  return params;
}

/**
 * 모델 fallback chain을 따라가며 images.edit 호출.
 * - 모델 자체 에러(404/invalid model)는 다음 모델로 fallback
 * - unsupported parameter 에러는 같은 모델에서 해당 파라미터 빼고 재시도
 * - rate limit / content policy / auth 등은 즉시 throw
 */
export async function editImageWithFallback(
  options: EditOptions
): Promise<EditResult> {
  const openai = getClient();
  const refFiles = await Promise.all(
    options.references.map((r) => fetchAsBlobPart(r.url, r.name))
  );

  const chain = getModelFallbackChain(options.model);
  const errors: Array<{ model: string; message: string }> = [];

  for (const modelId of chain) {
    let skipN = false;
    let skipFidelity = false;

    // 같은 모델 안에서 unsupported parameter 재시도 (최대 2회)
    for (let retry = 0; retry < 3; retry++) {
      const params = buildParams(modelId, options, refFiles, {
        skipN,
        skipFidelity,
      });

      try {
        const response = await openai.images.edit(params);
        const items = response.data ?? [];
        const buffers = items
          .map((d) => d.b64_json)
          .filter((b): b is string => !!b)
          .map((b) => Buffer.from(b, "base64"));
        if (buffers.length === 0) {
          throw new Error("OpenAI 응답에 b64_json 이 없습니다.");
        }
        return { buffers, modelUsed: modelId };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const { isModelError, unsupportedParam } = classifyApiError(err);

        if (unsupportedParam === "n") {
          if (skipN) throw err;
          console.warn(
            `[openai-image] 모델 ${modelId} n 미지원, n=1로 재시도`
          );
          skipN = true;
          continue;
        }
        if (unsupportedParam === "input_fidelity") {
          if (skipFidelity) throw err;
          console.warn(
            `[openai-image] 모델 ${modelId} input_fidelity 미지원, 빼고 재시도`
          );
          skipFidelity = true;
          continue;
        }

        if (isModelError) {
          errors.push({ model: modelId, message: msg });
          console.warn(
            `[openai-image] 모델 ${modelId} 사용 불가, 다음 모델로 fallback:`,
            msg
          );
          break; // 다음 모델로
        }

        // rate limit, content policy, auth, quota 등 — 즉시 throw
        throw err;
      }
    }
  }

  throw new Error(
    `모든 fallback 모델 실패: ${errors
      .map((e) => `${e.model}=${e.message}`)
      .join(" | ")}`
  );
}
