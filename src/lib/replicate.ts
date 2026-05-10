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

export type FaceSwapResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/**
 * Replicate prediction output 은 모델/버전에 따라 string | string[] | FileOutput
 * 등 다양한 형태로 떨어진다. 가장 첫 번째 http URL 만 뽑는다.
 */
function extractOutputUrl(output: unknown): string | undefined {
  if (!output) return undefined;
  if (typeof output === "string") {
    return output.startsWith("http") ? output : undefined;
  }
  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractOutputUrl(item);
      if (url) return url;
    }
    return undefined;
  }
  // FileOutput (ReadableStream + url()) 대응
  if (typeof output === "object" && output !== null) {
    const candidate = output as { url?: () => URL | string };
    if (typeof candidate.url === "function") {
      try {
        const u = candidate.url();
        const str = typeof u === "string" ? u : u.toString();
        return str.startsWith("http") ? str : undefined;
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

const SWAP_MAX_ATTEMPTS = 2;
const SWAP_RETRY_DELAY_MS = 2000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * codeplugtech/face-swap으로 일러스트에 실제 아이 얼굴 합성.
 * 일시 장애 대응을 위해 1회 retry. 최종 실패 시 ok:false.
 *
 * 주의: 반환되는 url은 Replicate 호스팅 URL(prediction TTL 약 1시간)이므로
 * 호출자가 즉시 영구 Storage로 옮겨야 한다.
 */
export async function swapFace(
  illustrationUrl: string,
  photoUrl: string,
  tag: string
): Promise<FaceSwapResult> {
  if (!replicate) {
    // mock/dev: face-swap 우회. 일러스트 원본 URL을 성공으로 그대로 반환해
    // 클라이언트 흐름(폴링·DB 갱신·UI)이 비용 없이 검증 가능하도록 한다.
    console.log(`${tag} [face-swap MOCK] 일러스트 원본을 성공으로 반환`);
    return { ok: true, url: illustrationUrl };
  }

  let lastReason = "unknown";
  for (let attempt = 1; attempt <= SWAP_MAX_ATTEMPTS; attempt++) {
    try {
      const created = await replicate.predictions.create({
        version: FACE_SWAP_MODEL_VERSION,
        input: {
          input_image: illustrationUrl,
          swap_image: photoUrl,
        },
        wait: true,
      });

      // wait:true 라도 일부 모델은 still processing 으로 떨어질 수 있어 추가 대기.
      const prediction =
        created.status === "starting" || created.status === "processing"
          ? await replicate.wait(created, {})
          : created;

      if (prediction.status === "succeeded") {
        const url = extractOutputUrl(prediction.output);
        if (url) {
          console.log(`${tag} [face-swap] 완료 (attempt ${attempt})`);
          return { ok: true, url };
        }
        // succeeded 인데 URL 추출 실패 — 일러스트에서 얼굴 검출 실패한 케이스
        // (측면·뒷모습 등). 사진이 아니라 일러스트 원인일 가능성이 높다.
        lastReason = `succeeded but no http output (id=${prediction.id}) — likely face not detectable in the illustration`;
      } else {
        lastReason = `status=${prediction.status} error=${prediction.error ?? "none"} id=${prediction.id}`;
      }

      console.warn(
        `${tag} [face-swap] attempt ${attempt}/${SWAP_MAX_ATTEMPTS} 실패: ${lastReason}`
      );
    } catch (err) {
      lastReason = err instanceof Error ? err.message : String(err);
      console.warn(
        `${tag} [face-swap] attempt ${attempt}/${SWAP_MAX_ATTEMPTS} 예외: ${lastReason}`
      );
    }

    if (attempt < SWAP_MAX_ATTEMPTS) {
      await sleep(SWAP_RETRY_DELAY_MS);
    }
  }

  return { ok: false, reason: lastReason };
}
