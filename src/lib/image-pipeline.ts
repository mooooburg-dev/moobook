import type { ChildGender, ScenarioPage, ThemeId } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImageBuffer } from "@/lib/storage/upload-image";
import { fetchPreGeneratedIllustration } from "@/lib/scenarios/illustrations";
import { editImageWithFallback } from "@/lib/openai-image";
import { IMAGE_QUALITY } from "@/lib/utils/env";

const BOOK_BUCKET = "moobook_photos";

/**
 * GPT Image 기반 face composite 활성 플래그.
 * 끄면 base 일러스트를 얼굴 합성 없이 그대로 사용 (dev/mock 편의).
 * prod 에서는 항상 true 여야 한다.
 */
const FACE_COMPOSITE_ENABLED = process.env.ENABLE_FACE_SWAP === "true";

function bookPagePath(bookId: string, pageNumber: number) {
  return `generated/${bookId}/page_${String(pageNumber).padStart(2, "0")}_${Date.now()}.png`;
}

export interface GenerateOnePageInput {
  page: ScenarioPage;
  photoUrl: string;
  bookId: string;
  scenarioId: ThemeId;
  gender: ChildGender;
  /**
   * 같은 book 의 page 1 합성 결과 URL.
   * page 2 부터 reference 로 함께 넘겨, 페이지 간 얼굴 톤/stylization 정도를
   * page 1 기준으로 고정한다. page 1 호출 시에는 null.
   */
  styleAnchorUrl?: string | null;
}

/**
 * 단일 페이지 생성 (외부 호출용 래퍼).
 * polling-driven 페이지 생성 서비스에서 사용.
 */
export async function generateOnePage(
  input: GenerateOnePageInput
): Promise<string> {
  return generateSinglePage(
    input.page,
    input.photoUrl,
    input.bookId,
    input.scenarioId,
    input.gender,
    input.styleAnchorUrl ?? null
  );
}

/**
 * 페이지 생성 정책상 복구 불가능한 실패. 호출자(`generateNextPage`)가 잡아서
 * book.status 를 `photo_unsuitable` 로 전이시킨다.
 */
export class PhotoUnsuitableError extends Error {
  readonly pageNumber: number;
  readonly cause: "face_composite_failed" | "missing_pre_illustration";

  constructor(
    pageNumber: number,
    cause: "face_composite_failed" | "missing_pre_illustration",
    detail?: string
  ) {
    super(
      detail
        ? `[p${pageNumber}] ${cause}: ${detail}`
        : `[p${pageNumber}] ${cause}`
    );
    this.name = "PhotoUnsuitableError";
    this.pageNumber = pageNumber;
    this.cause = cause;
  }
}

/**
 * 합성 이미지 buffer 를 영구 Storage 에 업로드.
 */
async function persistComposite(
  bookId: string,
  pageNumber: number,
  buffer: Buffer
): Promise<string> {
  const supabase = createAdminClient();
  return uploadImageBuffer(supabase, {
    bucket: BOOK_BUCKET,
    path: bookPagePath(bookId, pageNumber),
    buffer,
    contentType: "image/png",
    upsert: true,
  });
}

/**
 * GPT Image 2 로 사전 일러스트의 캐릭터 얼굴을 사용자 사진의 아이 얼굴과 닮게 변형.
 * 기존 codeplugtech/face-swap (Replicate) 은 실사→실사 학습 모델이라 워터컬러 일러스트
 * 위에서 얼굴 검출에 실패하거나 실사 텍스처를 부자연스럽게 덧입혔다. GPT Image 는
 * 텍스트 프롬프트로 "닮게 그려달라" 를 지시할 수 있어 화풍을 깨지 않으면서
 * 동일 캐릭터처럼 보이는 재해석이 가능하다.
 *
 * reference 순서가 중요:
 *   1) base 일러스트 — 화풍/구도/배경/표정의 정답
 *   2) 사용자 사진 — 얼굴 외형(identity) 만 reference (실사)
 *
 * identity vs expression 분리: 사진에서는 얼굴 모양·이목구비 비율·피부톤·머리 등
 * 외형만 가져오고, 표정/시선/입꼬리는 reference 1 의 캐릭터 표정 또는 scenario
 * emotion 을 따라야 한다. 이 분리를 명시하지 않으면 사용자 사진의 무뚝뚝한
 * 표정이 일러스트에 그대로 들어와 시나리오와 어긋난다.
 */
function buildFaceCompositePrompt(
  emotion: string,
  hasStyleAnchor: boolean
): string {
  const lines: string[] = [
    hasStyleAnchor
      ? "You are editing a children's storybook illustration. There are exactly THREE reference images and each has a strict, non-overlapping role."
      : "You are editing a children's storybook illustration. There are exactly two reference images and each has a strict, non-overlapping role.",
    // ── reference 1 의 권한
    "Reference 1 (the illustration) is the canonical scene. It defines EVERYTHING in the output EXCEPT the facial features of the child character: art style (warm watercolor children's book, soft pastel colors), composition, framing, lighting, background, props, other characters, body pose, hand position, stance, AND the child character's clothing/outfit (every garment, color, pattern, footwear) must come from reference 1 unchanged.",
    // ── reference 2 의 권한
    "Reference 2 (the photograph) is used STRICTLY as a facial-identity reference for one element only: the child character's face. From reference 2 take ONLY the facial features — face shape and proportions, eye shape and spacing, nose, mouth shape and lip proportions, skin tone, hair color, hairstyle, ethnicity.",
    // ── reference 2 에서 절대 가져오면 안 되는 것
    "From reference 2 you MUST IGNORE everything except the face: ignore the clothing in the photo (jacket, pants, shoes, patterns, logos), ignore the photo's pose and body posture, ignore the photo's background, ignore the photo's lighting and color palette, ignore the photo's framing, and ignore the photo's facial expression. The photo's outfit must NOT appear in the output under any circumstances.",
  ];

  if (hasStyleAnchor) {
    // ── reference 3 (page 1 결과) 의 권한 — 페이지 간 일관성
    lines.push(
      "Reference 3 is the page 1 illustration of this same storybook (already produced by you in a previous turn). It defines the canonical look of the child character across the whole book. The face you render now MUST match reference 3 in: stylization level (how much the real child is illustrated vs photographic), facial proportions, line weight, color palette of the face and skin, and overall character design. The child must look like the SAME child as in reference 3, recognizably the same character page after page."
    );
  }

  // ── 표정
  lines.push(
    `Facial expression must match the scene emotion "${emotion}" (e.g. bright smile, wide-eyed wonder, gentle warmth) and the expression already shown by the character in reference 1. Do not copy the mouth shape or eyebrow position from reference 2.`
  );
  // ── 화풍 (얼굴은 minimal stylization — 부모가 자기 아이를 알아볼 수 있도록 사진에 가깝게)
  lines.push(
    "CRITICAL face rendering rule: the body, clothing, props, and background follow reference 1's warm watercolor children's book style, but the FACE itself must be rendered with MINIMAL stylization — the goal is that the parents can immediately recognize their own child. Keep the photographic likeness of the eyes, eyebrows, nose, mouth, cheeks, and skin tone from reference 2 with only a very light watercolor wash on top. A slight visual contrast between the lightly-stylized face and the more illustrated body is acceptable and desired."
  );
  // ── 부정형 지시 — 모델이 자동으로 끌려가는 "동화책 표준 얼굴" 방향성을 정량적으로 차단
  lines.push(
    "Do NOT drift toward a generic storybook child face. Specifically preserve the following photographic measurements from reference 2 unchanged: (a) eye size — render the eyes at the SAME relative size as reference 2, do not enlarge or widen them; (b) eye spacing — keep the inter-pupillary distance and eye corner positions identical to reference 2; (c) cheekbone and jawline contours — preserve the bone structure visible in reference 2 instead of softening into a round baby face; (d) face length and width ratio — match reference 2's facial proportions; (e) eyebrow shape, thickness, and angle — copy from reference 2; (f) lip thickness and mouth width — copy from reference 2. The result should look like reference 2's child wearing a thin watercolor filter, NOT like a generic cute character that happens to share hair color with reference 2."
  );
  // ── 최종 체크
  lines.push(
    hasStyleAnchor
      ? "Final check before producing the image: (a) outfit and pose match reference 1 exactly, (b) the face is unmistakably the child from reference 2 with only a light watercolor wash — a parent must immediately recognize their own child, (c) stylization level of the face matches reference 3. If any of these fail, restart."
      : "Final check before producing the image: (a) outfit, pose, and background match reference 1 exactly, (b) the face is unmistakably the child from reference 2 with only a light watercolor wash — a parent must immediately recognize their own child. If any of these fail, restart."
  );
  lines.push(
    "Output a single edited illustration, no text, no captions, no watermarks."
  );
  return lines.join(" ");
}

/**
 * 단일 경로 페이지 생성:
 *   사전 일러스트(approved/completed) + GPT Image 얼굴 합성 → Storage 영구화
 *
 * 정책상 ThemeSelector 가 12장 모두 완비된 시나리오만 노출하므로
 * 사전 일러스트 누락은 정상 흐름에선 발생하지 않는다. 그래도 운영 중
 * 어드민이 일러스트를 회수하는 등의 이유로 missing 이 발생할 수 있어
 * 그 경우와 합성 실패는 모두 PhotoUnsuitableError 로 전파한다.
 *
 * 합성이 비활성(env) 인 환경은 dev/mock 전용으로만 의도하며, 그 경우
 * base 일러스트를 그대로 사용한다 (얼굴 합성 없음).
 */
async function generateSinglePage(
  page: ScenarioPage,
  photoUrl: string,
  bookId: string,
  scenarioId: ThemeId,
  gender: ChildGender,
  styleAnchorUrl: string | null
): Promise<string> {
  const tag = `[Pipeline] p${page.pageNumber} (${bookId.slice(0, 8)})`;

  const baseUrl = await fetchPreGeneratedIllustration(
    scenarioId,
    page.pageNumber,
    gender
  );
  if (!baseUrl) {
    throw new PhotoUnsuitableError(
      page.pageNumber,
      "missing_pre_illustration",
      `scenario=${scenarioId}, gender=${gender}`
    );
  }

  if (!FACE_COMPOSITE_ENABLED) {
    console.log(`${tag} 사전 일러스트 사용 (face composite 비활성)`);
    return baseUrl;
  }

  const hasStyleAnchor = !!styleAnchorUrl;
  const references = [
    { url: baseUrl, name: "illustration" },
    { url: photoUrl, name: "child-photo" },
  ];
  if (hasStyleAnchor) {
    references.push({ url: styleAnchorUrl as string, name: "style-anchor" });
  }

  try {
    const result = await editImageWithFallback({
      prompt: buildFaceCompositePrompt(page.emotion, hasStyleAnchor),
      references,
      size: "1024x1536",
      quality: IMAGE_QUALITY,
    });
    const buffer = result.buffers[0];
    if (!buffer) {
      throw new Error("OpenAI 응답에 buffer가 없습니다.");
    }
    const persistedUrl = await persistComposite(
      bookId,
      page.pageNumber,
      buffer
    );
    console.log(
      `${tag} 사전 일러스트 + GPT Image 합성 완료 (model=${result.modelUsed}, quality=${IMAGE_QUALITY}, style_anchor=${hasStyleAnchor})`
    );
    return persistedUrl;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn(`${tag} face composite 실패: ${detail}`);
    throw new PhotoUnsuitableError(
      page.pageNumber,
      "face_composite_failed",
      detail
    );
  }
}
