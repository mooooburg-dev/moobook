import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const firefighterMe: Scenario = {
  id: "firefighter-me",
  title: "소방관이 된 나",
  description: "꿈속에서 진짜 소방관이 되어 동물들을 구하는 하루",
  category: "dream",
  targetAge: "4~7세",
  pageCount: 12,
  coverPrompt: `A shiny red fire truck parked in front of a fire station, a small firefighter helmet and boots in the foreground, dalmatian puppy sitting beside them, ${STYLE}`,
  educationalMessage:
    "용기와 협동심을 배우고, 소방관이라는 직업에 대한 이해와 존경심을 키워요.",
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 잠자리에 들기 전에 소방차 그림책을 보았어요. \"나도 소방관이 되고 싶어!\" 눈을 감으니 스르르 꿈나라로 빠져들었어요.",
      sceneDescription:
        "침대 위에 소방차 그림책이 펼쳐져 있음. 부드러운 불빛, 잠에 드는 분위기.",
      illustrationPrompt: `A child's bed with a fire truck picture book open on it, warm bedside lamp light, sleepy peaceful atmosphere, fire truck toy on the nightstand, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "눈을 떠 보니 {childName}(이)는 반짝이는 소방관 옷을 입고 있었어요! 노란 헬멧, 빨간 자켓, 커다란 장화까지! 옆에는 점박이 강아지 불이가 꼬리를 흔들고 있었어요.",
      sceneDescription:
        "소방서 안, 소방관 유니폼이 걸려 있음. 달마시안 강아지가 옆에 앉아 있음.",
      illustrationPrompt: `Inside a fire station, a small firefighter uniform hanging on a rack - yellow helmet, red jacket, big boots, a dalmatian puppy wagging its tail beside them, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 3,
      text: "땡땡땡! 갑자기 비상벨이 울렸어요! \"동물 마을에 불이 났어요!\" {childName}(이)가 힘차게 외쳤어요. \"출동!\"",
      sceneDescription:
        "소방서, 비상벨이 울리고 빨간 불이 깜빡임. 소방차가 차고에 준비되어 있음.",
      illustrationPrompt: `A fire station with alarm bells ringing, red lights flashing, a bright red fire truck ready in the garage, dalmatian puppy alert and ready, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 4,
      text: "빠앙빠앙! 빨간 소방차가 힘차게 달렸어요. {childName}(이)가 운전대를 꼭 잡고, 불이가 옆에서 짖었어요. \"멍멍! 빨리 가자!\"",
      sceneDescription:
        "소방차가 거리를 달리는 장면. 사이렌이 빛나고 있음. 다른 차들이 비켜주고 있음.",
      illustrationPrompt: `A red fire truck racing down a street with siren lights flashing, other vehicles pulling aside, buildings on both sides, motion blur effect, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 5,
      text: "동물 마을에 도착하니, 토끼네 집에서 연기가 모락모락 나고 있었어요. 토끼 가족이 밖에서 울고 있었어요. \"우리 아기가 안에 있어요!\"",
      sceneDescription:
        "작은 동물 마을, 토끼 모양 집에서 연기가 남. 토끼 가족이 밖에서 걱정하고 있음.",
      illustrationPrompt: `A cute animal village with small houses, smoke coming from a rabbit-shaped house, worried animal families outside, fire truck arriving, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 6,
      text: "{childName}(이)는 무서웠지만, 깊이 숨을 들이쉬고 용기를 냈어요. 마스크를 쓰고 물 호스를 잡고 안으로 들어갔어요. \"걱정 마세요! 제가 구할게요!\"",
      sceneDescription:
        "연기 속으로 들어가는 장면. 물 호스를 들고 있음. 마스크를 쓰고 있음.",
      illustrationPrompt: `A small figure entering a smoky doorway with a fire hose, wearing a mask and helmet, brave posture, smoke swirling but not too scary, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 7,
      text: "쉬이이이! 물을 뿌리자 불이 스르르 사그라들었어요. 구석에서 아기 토끼가 작은 목소리로 울고 있었어요. {childName}(이)가 아기 토끼를 꼭 안고 밖으로 나왔어요!",
      sceneDescription:
        "물을 뿌려 불을 끄는 장면. 구석에 작은 아기 토끼가 웅크리고 있음.",
      illustrationPrompt: `Water spraying from a hose putting out small cartoon-style flames, a tiny baby bunny huddled in the corner, safe and being rescued, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 8,
      text: "\"고마워요!\" 토끼 엄마가 아기 토끼를 꼭 안으며 눈물을 흘렸어요. {childName}(이)의 마음이 뿌듯했어요. 그때 다시 비상벨이 울렸어요!",
      sceneDescription:
        "토끼 가족이 재회하며 감사하는 장면. 뒤에서 다시 비상벨 소리.",
      illustrationPrompt: `A rabbit family reunited and hugging, grateful expressions, the rescued baby bunny safe in mother's arms, fire truck in the background, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 9,
      text: "이번에는 강가에서 아기 고양이가 나무에 올라가 내려오지 못하고 있었어요! {childName}(이)는 사다리를 펼치고 조심조심 올라갔어요.",
      sceneDescription:
        "강가의 높은 나무에 아기 고양이가 매달려 있음. 소방 사다리가 펼쳐지고 있음.",
      illustrationPrompt: `A tall tree by a river with a kitten clinging to a high branch, a fire truck ladder extending upward, riverside setting with flowers, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 10,
      text: "\"괜찮아, 내가 왔어.\" {childName}(이)가 부드럽게 말하며 아기 고양이를 안아 주었어요. 아기 고양이가 가르릉가르릉 목을 울렸어요. 불이가 아래에서 꼬리를 흔들며 기다렸어요.",
      sceneDescription:
        "사다리 위에서 아기 고양이를 안고 내려오는 장면. 달마시안이 아래에서 기다림.",
      illustrationPrompt: `A kitten being held gently at the top of a ladder, purring contentedly, a dalmatian looking up from below wagging its tail, sunny riverside, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 11,
      text: "동물 마을 친구들이 모두 모여 {childName}(이)에게 메달을 걸어 주었어요. \"오늘의 영웅! 용감한 소방관 {childName}!\" 모두 박수를 짝짝짝 쳤어요.",
      sceneDescription:
        "동물 마을 광장, 동물들이 모여 메달 수여식. 깃발과 꽃다발. 축하 분위기.",
      illustrationPrompt: `An animal village square with various animals gathered for a medal ceremony, flags and flower bouquets, confetti, celebratory atmosphere, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 12,
      text: "\"삐삐삐!\" 알람 소리에 눈을 떠 보니 다시 {childName}(이)의 방이었어요. 꿈이었지만, 베개 옆에 작은 소방관 배지가 반짝이고 있었어요. \"나는 용감한 소방관이야!\"",
      sceneDescription:
        "아침, 침대 위. 베개 옆에 작은 소방관 배지가 빛나고 있음. 아침 햇살.",
      illustrationPrompt: `A child's bed in morning sunlight, a small shiny firefighter badge on the pillow, fire truck picture book nearby, warm and inspiring morning, ${STYLE}`,
      emotion: "proud",
    },
  ],
};
