import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const newSibling: Scenario = {
  id: "new-sibling",
  title: "동생이 생겼어요",
  description: "동생이 태어나 세상에서 가장 멋진 형/언니가 되는 모험",
  category: "emotion",
  targetAge: "3~6세",
  pageCount: 12,
  coverPrompt: `A cozy nursery room with a crib, soft toys, a mobile with stars and moons hanging above, a small crown and cape draped over a chair, ${STYLE}`,
  educationalMessage:
    "동생에 대한 질투심을 자연스럽게 다루고, 형/언니로서의 자부심과 사랑을 배워요.",
  pages: [
    {
      pageNumber: 1,
      text: "엄마 아빠가 말했어요. \"곧 동생이 태어나!\" 모두 기뻐했지만, {childName}(이)는 왠지 마음이 이상했어요. '동생이 오면… 나는 어떡하지?'",
      sceneDescription:
        "거실, 엄마가 배가 부른 모습. 아빠가 웃고 있음. 아이는 소파에 앉아 복잡한 표정.",
      illustrationPrompt: `A cozy living room with a sofa, baby preparation items visible - a small crib in the corner, baby clothes folded neatly, a slightly uncertain atmosphere mixed with excitement, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "동생이 태어났어요! 아기는 정말 작고 빨갛고, 계속 울기만 했어요. 엄마 아빠는 아기만 바라보았어요. {childName}(이)는 혼자 방에 들어갔어요.",
      sceneDescription:
        "아기 침대 주변에 모인 가족. 아기가 작은 이불에 싸여 있음. 방 한쪽이 비어 보임.",
      illustrationPrompt: `A nursery with a small crib, baby items around it, the room focused on the crib area with warm light, the far side of the room slightly darker and quieter, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 3,
      text: "{childName}(이)가 침대에 누워 눈물을 삼키고 있을 때, 창문으로 작은 빛이 날아왔어요. 반짝반짝 빛나는 요정이었어요! \"안녕, {childName}(아)!\"",
      sceneDescription:
        "어두운 아이 방, 창문으로 작은 빛이 들어옴. 반짝이는 요정이 날개를 펴고 있음.",
      illustrationPrompt: `A child's bedroom at dusk, a tiny glowing fairy with delicate wings flying through an open window, sparkle trail behind it, soft magical light, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 4,
      text: "\"나는 별빛 요정이야! {childName}(이)를 '세상에서 가장 멋진 형(언니)' 모험에 초대하러 왔어!\" 요정이 손을 내밀었어요.",
      sceneDescription:
        "요정이 작은 반짝이는 왕관과 망토를 들고 있음. 별가루가 흩날림.",
      illustrationPrompt: `A small fairy holding a tiny sparkling crown and a cape made of starlight, star dust swirling around, magical bedroom atmosphere, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 5,
      text: "요정의 별가루를 타고 구름 위 아기 나라에 도착했어요! 아기 동물들이 형, 언니를 기다리고 있었어요. \"우리 좀 도와줘!\"",
      sceneDescription:
        "구름 위 아기 나라. 아기 토끼, 아기 곰, 아기 고양이 등이 도움을 기다리고 있음.",
      illustrationPrompt: `A dreamy land above the clouds with baby animal characters - a baby bunny, baby bear, and baby kitten - looking up hopefully, pastel colored cloud landscape, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 6,
      text: "아기 토끼가 울고 있었어요. {childName}(이)가 살살 등을 토닥토닥 두드려 주었어요. \"울지 마, 괜찮아.\" 아기 토끼가 방긋 웃었어요!",
      sceneDescription:
        "아기 토끼를 토닥이는 장면. 아기 토끼가 눈물을 그치고 웃음. 부드러운 구름 배경.",
      illustrationPrompt: `A small baby bunny being comforted, tears turning to smiles, soft cloud background, gentle and nurturing atmosphere, tiny sparkles of comfort, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 7,
      text: "아기 곰이 넘어져서 무릎을 다쳤어요. {childName}(이)가 \"후후\" 불어 주고, 반창고를 붙여 주었어요. \"이제 안 아프지?\" 아기 곰이 꼭 안아 주었어요!",
      sceneDescription:
        "아기 곰의 무릎에 반창고를 붙여주는 장면. 아기 곰이 감동한 표정.",
      illustrationPrompt: `A small baby bear with a band-aid on its knee, looking grateful and hugging the air, medical supplies nearby, soft warm lighting on clouds, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 8,
      text: "아기 고양이가 높은 나무에서 내려오지 못하고 있었어요. {childName}(이)가 두 팔을 쭉 벌리고 외쳤어요. \"뛰어! 내가 받아줄게!\" 아기 고양이가 폴짝 뛰어내렸어요!",
      sceneDescription:
        "구름 위 작은 나무에 아기 고양이가 매달려 있음. 아래에서 팔을 벌리고 있는 장면.",
      illustrationPrompt: `A small tree on a cloud with a baby kitten clinging to a branch, arms spread wide below ready to catch, dramatic but cute rescue scene, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 9,
      text: "아기 동물들이 모두 {childName}(이)에게 달려왔어요. \"고마워! 넌 정말 멋진 형(언니)이야!\" 요정이 반짝이는 왕관을 씌워 주었어요.",
      sceneDescription:
        "아기 동물들이 주위에 모여 있음. 요정이 반짝이는 왕관을 씌워주는 장면.",
      illustrationPrompt: `Baby animals gathered together in a circle, a fairy placing a sparkling crown, celebration atmosphere with confetti and sparkles, cloud kingdom setting, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 10,
      text: "\"이제 알겠지? {childName}(이)는 이미 세상에서 가장 멋진 형(언니)야. 동생한테도 이렇게 해주면 돼!\" 요정이 윙크했어요.",
      sceneDescription:
        "요정이 윙크하며 지구를 가리키고 있음. 아래로 집이 작게 보임.",
      illustrationPrompt: `A fairy winking and pointing downward toward a tiny house visible through the clouds below, Earth visible in the distance, magical twilight sky, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 11,
      text: "집에 돌아온 {childName}(이)는 살금살금 아기 방으로 갔어요. 동생이 칭얼칭얼 울고 있었어요. {childName}(이)가 조심조심 손을 잡아 주자… 동생이 방긋 웃었어요!",
      sceneDescription:
        "아기 침대 옆, 아기의 작은 손을 잡아주는 장면. 아기가 미소 짓고 있음. 따뜻한 조명.",
      illustrationPrompt: `A crib with a small baby smiling, a tiny hand being held gently, warm nursery lighting, soft blankets and mobile above, tender and loving atmosphere, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 12,
      text: "엄마가 살며시 다가와 {childName}(이)를 꼭 안아 주었어요. \"우리 {childName}(이), 정말 멋진 형(언니)이구나.\" 왕관이 반짝 빛났어요. 오늘부터 {childName}(이)는 세상에서 가장 멋진 형(언니)이에요!",
      sceneDescription:
        "엄마가 아이를 안고 있음. 아기 침대 옆. 왕관이 희미하게 빛나고 있음. 가족의 따뜻한 장면.",
      illustrationPrompt: `A nursery scene with a parent hugging warmly beside a baby crib, the baby sleeping peacefully, a faint sparkle of a crown, warm family moment, evening light, ${STYLE}`,
      emotion: "happy",
    },
  ],
};
