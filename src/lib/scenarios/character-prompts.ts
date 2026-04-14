import type { ScenarioPage, ThemeId } from "@/types";

const CHARACTER_BASE =
  "Add a cute young Korean child (about 5 years old) with short brown hair into this scene. The child is wearing a light blue fluffy hooded jacket and brown pants.";

const KEEP_BACKGROUND =
  "The child should blend naturally into the existing scene's art style and lighting. Keep the background exactly as it is, only add the child character.";

const EMOTION_MAP: Record<string, string> = {
  excited: "looking excited with bright eyes and a big smile",
  curious: "looking curious, tilting head slightly",
  worried: "looking a bit worried with slightly furrowed brows",
  happy: "smiling warmly and happily",
  joyful: "laughing joyfully with arms slightly open",
  surprised: "eyes wide open in surprise, mouth slightly open",
  proud: "standing tall with a proud confident expression",
  determined: "with a determined brave expression",
  touched: "with a gentle touched expression, eyes slightly misty",
  grateful: "with a warm grateful smile",
  thrilled: "eyes sparkling, grinning with excitement",
  intrigued: "leaning forward with an intrigued look",
  awe: "gazing upward in awe, mouth slightly open",
  wonder: "eyes wide with wonder, soft smile",
  nervous: "standing a little stiffly with a nervous smile",
  calm: "with a calm and peaceful expression",
  sleepy: "rubbing eyes sleepily",
  playful: "with a playful mischievous grin",
};

/**
 * 페이지별 수동 오버라이드 - sceneDescription만으로는 구체적인 동작을 담기 어려운 경우 직접 지정.
 */
const PAGE_OVERRIDES: Partial<Record<ThemeId, Record<number, string>>> = {
  "forest-adventure": {
    1: "The child is standing at the forest entrance, one foot forward as if about to step in, eyes wide with wonder and a big smile.",
    2: "The child is crouching down on the forest path to meet a small rabbit, hand gently reaching out.",
    3: "The child is walking along the glowing mushroom path beside the rabbit, looking up at the lights in wonder.",
    4: "The child is standing at the base of the giant oak tree, head tilted back, gazing up at the owl in awe.",
    5: "The child is sitting on a tree root, listening attentively to the owl with an intrigued expression.",
    6: "The child is reaching out to receive the glowing treasure map from the owl, with a determined brave expression.",
    7: "The child is standing at the edge of the stream beside the worried rabbit, looking down at the water with concern.",
    8: "The child is riding on the large turtle's back crossing the stream with the rabbit, laughing joyfully.",
    9: "The child is walking through the flower meadow, arms slightly open as butterflies dance around, smiling happily.",
    10: "The child is kneeling in the flower field, reaching toward the shiny treasure box with sparkling eyes.",
    11: "The child is sitting beside the open treasure chest holding a glowing necklace, with a gentle touched expression.",
    12: "The child is walking toward home in the sunset alongside the rabbit, owl, and turtle, with a warm peaceful smile.",
  },
};

function getActionDescription(scenarioId: ThemeId, page: ScenarioPage): string {
  const override = PAGE_OVERRIDES[scenarioId]?.[page.pageNumber];
  if (override) return override;
  const emotionDesc =
    EMOTION_MAP[page.emotion] ?? "with a cheerful bright expression";
  return `The child is ${emotionDesc}.`;
}

/**
 * 1페이지용: 배경 이미지 위에 캐릭터를 추가.
 * input_image = 배경 이미지.
 */
export function buildFirstPagePrompt(
  scenarioId: ThemeId,
  page: ScenarioPage
): string {
  const action = getActionDescription(scenarioId, page);
  return `${CHARACTER_BASE} ${action} ${KEEP_BACKGROUND}`;
}

/**
 * 2페이지 이후용: 1페이지 캐릭터를 레퍼런스로 받아 새 배경을 그려 넣음.
 * input_image = 1페이지 캐릭터 결과 이미지(reference).
 * prompt에 해당 페이지의 배경 묘사(illustrationPrompt)를 포함해야 모델이 새 배경을 구성함.
 */
export function buildReferenceBasedPrompt(
  scenarioId: ThemeId,
  page: ScenarioPage
): string {
  const action = getActionDescription(scenarioId, page);
  return [
    "This exact same child character from the reference - same face, same hair, same clothing, same art style.",
    `New scene: ${page.illustrationPrompt}.`,
    action,
    "Keep the child's appearance perfectly consistent with the reference.",
  ].join(" ");
}
