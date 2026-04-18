import { GoogleGenAI, type Chat } from "@google/genai";

// USE_MOCK_AI=true → Gemini 호출 없이 placeholder 반환
// GEMINI_API_KEY 없어도 자동 mock
const MOCK_MODE =
  process.env.USE_MOCK_AI === "true" || !process.env.GEMINI_API_KEY;

export const GEMINI_MODEL_ID = "gemini-3.1-flash-image-preview";

// 3:4 비율 지시어 (Gemini는 aspect_ratio 파라미터 미지원 → 프롬프트로 전달)
export const ASPECT_DIRECTIVE =
  " Render in portrait orientation, 3:4 aspect ratio (768x1024), character fully visible within frame.";

// 공용 스타일 suffix — 기존 generate-backgrounds/route.ts에서 사용하던 값 이전
export const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const PLACEHOLDER_IMAGE = (pageNumber: number) =>
  `https://placehold.co/768x1024/e8d5f5/7c3aed?text=Page+${pageNumber}`;

const ai = MOCK_MODE
  ? null
  : new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface GeminiImageResult {
  buffer: Buffer;
  mimeType: string;
}

export type ReferenceImage =
  | { buffer: Buffer; mimeType: string }
  | { url: string };

interface GeminiGenerateOptions {
  tag?: string;
  appendStyle?: boolean;
  appendAspect?: boolean;
}

interface GeminiResponseLike {
  candidates?: Array<{
    content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string }; text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

// mock 모드 placeholder Buffer 1회 캐싱
const placeholderBufferCache = new Map<number, GeminiImageResult>();

async function fetchPlaceholderBuffer(
  pageNumber: number
): Promise<GeminiImageResult> {
  const cached = placeholderBufferCache.get(pageNumber);
  if (cached) return cached;

  const res = await fetch(PLACEHOLDER_IMAGE(pageNumber));
  if (!res.ok) {
    throw new Error(`placeholder fetch 실패: ${res.status}`);
  }
  const ab = await res.arrayBuffer();
  const result = {
    buffer: Buffer.from(ab),
    mimeType: res.headers.get("content-type") ?? "image/png",
  };
  placeholderBufferCache.set(pageNumber, result);
  return result;
}

function buildPrompt(
  prompt: string,
  opts?: GeminiGenerateOptions
): string {
  const appendStyle = opts?.appendStyle ?? true;
  const appendAspect = opts?.appendAspect ?? true;
  let full = prompt;
  if (appendStyle && !full.includes("watercolor children's book")) {
    full += STYLE_SUFFIX;
  }
  if (appendAspect) {
    full += ASPECT_DIRECTIVE;
  }
  return full;
}

export function extractBlockReason(
  response: GeminiResponseLike
): string | null {
  if (response.promptFeedback?.blockReason) {
    return response.promptFeedback.blockReason;
  }
  const reason = response.candidates?.[0]?.finishReason;
  if (
    reason &&
    ["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "RECITATION"].includes(reason)
  ) {
    return reason;
  }
  return null;
}

export function extractFirstImage(
  response: GeminiResponseLike
): GeminiImageResult | null {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData;
    if (inline?.data) {
      return {
        buffer: Buffer.from(inline.data, "base64"),
        mimeType: inline.mimeType ?? "image/png",
      };
    }
  }
  return null;
}

function is429(err: unknown): boolean {
  if (err && typeof err === "object") {
    const e = err as { status?: number; message?: string; code?: number };
    if (e.status === 429 || e.code === 429) return true;
    if (typeof e.message === "string") {
      const msg = e.message;
      if (
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("rate limit")
      ) {
        return true;
      }
    }
  }
  return false;
}

async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  tag: string,
  attempts = 3
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const rateLimited = is429(err);
      const waitMs = rateLimited ? 20_000 * (i + 1) : 8_000;
      const errMsg = err instanceof Error ? err.message : String(err);
      if (i < attempts - 1) {
        console.warn(
          `${tag} ${rateLimited ? "rate limited" : "실패"}, ${Math.round(waitMs / 1000)}s 후 재시도 (${errMsg})`
        );
        await sleep(waitMs);
      } else {
        console.error(`${tag} 최종 실패: ${errMsg}`);
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function referenceToInlinePart(
  ref: ReferenceImage
): Promise<{ inlineData: { mimeType: string; data: string } }> {
  if ("buffer" in ref) {
    return {
      inlineData: {
        mimeType: ref.mimeType,
        data: ref.buffer.toString("base64"),
      },
    };
  }
  const res = await fetch(ref.url);
  if (!res.ok) {
    throw new Error(`참조 이미지 fetch 실패: ${res.status} (${ref.url})`);
  }
  const ab = await res.arrayBuffer();
  return {
    inlineData: {
      mimeType: res.headers.get("content-type") ?? "image/png",
      data: Buffer.from(ab).toString("base64"),
    },
  };
}

function handleResponse(
  response: GeminiResponseLike,
  tag: string
): GeminiImageResult {
  const blocked = extractBlockReason(response);
  if (blocked) {
    throw new Error(`Gemini blocked (${blocked})`);
  }
  const image = extractFirstImage(response);
  if (!image) {
    throw new Error(`Gemini response에 이미지 없음 (${tag})`);
  }
  return image;
}

/**
 * 텍스트 프롬프트만으로 이미지 생성 (배경용)
 */
export async function generateImageFromText(
  prompt: string,
  opts: GeminiGenerateOptions & { pageNumber?: number } = {}
): Promise<GeminiImageResult> {
  const tag = opts.tag ?? "[Gemini]";
  if (MOCK_MODE) {
    console.log(`${tag} MOCK 모드, placeholder 반환`);
    return fetchPlaceholderBuffer(opts.pageNumber ?? 1);
  }

  return withGeminiRetry(async () => {
    const response = await ai!.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [
        { role: "user", parts: [{ text: buildPrompt(prompt, opts) }] },
      ],
    });
    return handleResponse(response as GeminiResponseLike, tag);
  }, tag);
}

/**
 * 참조 이미지 + 텍스트 프롬프트로 이미지 생성 (캐릭터 1페이지, partial 경로)
 */
export async function generateImageWithReferences(
  prompt: string,
  references: ReferenceImage[],
  opts: GeminiGenerateOptions & { pageNumber?: number } = {}
): Promise<GeminiImageResult> {
  const tag = opts.tag ?? "[Gemini]";
  if (MOCK_MODE) {
    console.log(`${tag} MOCK 모드, placeholder 반환`);
    return fetchPlaceholderBuffer(opts.pageNumber ?? 1);
  }

  return withGeminiRetry(async () => {
    const inlineParts = await Promise.all(
      references.map((ref) => referenceToInlinePart(ref))
    );
    const response = await ai!.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [...inlineParts, { text: buildPrompt(prompt, opts) }],
        },
      ],
    });
    return handleResponse(response as GeminiResponseLike, tag);
  }, tag);
}

/**
 * 대화형 세션 생성 (시리즈 캐릭터 일관성용)
 */
export function createStoryChatSession(): Chat | null {
  if (MOCK_MODE) return null;
  return ai!.chats.create({ model: GEMINI_MODEL_ID });
}

/**
 * 기존 세션에 다음 페이지 생성 요청
 * references 없으면 텍스트만 전달 → 이전 턴 이미지 컨텍스트 활용
 */
export async function generateNextPageInSession(
  chat: Chat | null,
  prompt: string,
  references: ReferenceImage[] = [],
  opts: GeminiGenerateOptions & { pageNumber?: number } = {}
): Promise<GeminiImageResult> {
  const tag = opts.tag ?? "[Gemini:chat]";
  if (MOCK_MODE || !chat) {
    console.log(`${tag} MOCK 모드, placeholder 반환`);
    return fetchPlaceholderBuffer(opts.pageNumber ?? 1);
  }

  return withGeminiRetry(async () => {
    const inlineParts = await Promise.all(
      references.map((ref) => referenceToInlinePart(ref))
    );
    const message: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [...inlineParts, { text: buildPrompt(prompt, opts) }];
    const response = await chat.sendMessage({ message });
    return handleResponse(response as GeminiResponseLike, tag);
  }, tag);
}

export function isGeminiMockMode(): boolean {
  return MOCK_MODE;
}
