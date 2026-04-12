import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const forestAdventure: Scenario = {
  id: "forest-adventure",
  title: "숲속 대모험",
  description: "마법의 숲에서 동물 친구들과 별빛 열매를 찾는 모험",
  category: "adventure",
  targetAge: "3~6세",
  pageCount: 12,
  coverPrompt: `A magical forest entrance with glowing light streaming through ancient trees, a winding path leading into the woods, butterflies and fireflies dancing in the air, ${STYLE}`,
  educationalMessage:
    "용기를 내어 새로운 것에 도전하고, 자연과 친구를 소중히 여기는 마음을 배워요.",
  pages: [
    {
      pageNumber: 1,
      text: "어느 화창한 아침, {childName}(이)는 집 뒤 언덕에서 반짝이는 빛을 발견했어요. \"저게 뭘까?\" 호기심이 뿅 솟아올랐어요.",
      sceneDescription:
        "집 뒤 언덕, 아침 햇살이 비치고 숲 입구에서 신비로운 빛이 새어 나옴. 나비 두 마리가 빛 쪽으로 날아가고 있음.",
      illustrationPrompt: `A small hill behind a cozy cottage, morning sunlight, a mysterious glow emanating from a forest entrance, two butterflies flying toward the light, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "빛을 따라 숲 속으로 살금살금 들어가자, 귀여운 토끼 한 마리가 깡충깡충 뛰어왔어요. \"안녕! 나는 솜이야. 숲이 큰일 났어!\"",
      sceneDescription:
        "숲 입구 오솔길, 초록 나뭇잎 사이로 빛이 비침. 작은 흰 토끼가 급하게 뛰어오는 모습.",
      illustrationPrompt: `A forest trail entrance with dappled sunlight through green leaves, a small white rabbit hopping urgently along the path, wildflowers along the trail edges, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "\"숲의 별빛 열매가 사라졌어! 별빛 열매가 없으면 숲이 어둠에 잠기고 말아.\" 솜이의 눈에 눈물이 글썽글썽했어요.",
      sceneDescription:
        "숲 속 커다란 나무 앞, 나무 꼭대기의 빈 가지가 보임. 주변이 약간 어둡고 시든 꽃들이 있음.",
      illustrationPrompt: `A large ancient tree in the forest with empty branches at the top, slightly dim surroundings, some wilting flowers at the base, a sad atmosphere, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 4,
      text: "{childName}(이)가 주먹을 꼭 쥐었어요. \"내가 찾아줄게! 같이 가자, 솜이!\" 용기가 마구마구 솟아났어요.",
      sceneDescription:
        "숲 속 갈림길, 세 갈래 길이 나뉘어 있음. 각 길 위에 희미한 빛의 화살표가 떠 있음.",
      illustrationPrompt: `A forest crossroads with three diverging paths, faint glowing arrow signs floating above each path, magical mist at ground level, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 5,
      text: "반짝반짝 빛나는 버섯 길을 따라가니, 부엉이 할아버지가 나무 위에서 눈을 깜빡였어요. \"호호, 별빛 열매를 찾으려면 세 가지 시험을 통과해야 한단다.\"",
      sceneDescription:
        "발광 버섯이 줄지어 있는 숲 속 길. 큰 참나무 위에 부엉이가 앉아 있음. 파란, 보라, 분홍 버섯들.",
      illustrationPrompt: `A forest path lined with glowing mushrooms in blue, purple, and pink, a wise owl perched on a large oak tree branch above, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 6,
      text: "첫 번째 시험! 졸졸졸 흐르는 시냇물 앞에 다리가 없었어요. 그때 커다란 거북이가 느릿느릿 나타났어요. \"내 등에 타렴!\"",
      sceneDescription:
        "맑은 시냇물이 흐르고 건너편으로 갈 다리가 없음. 커다란 거북이가 물속에서 올라옴.",
      illustrationPrompt: `A clear forest stream with no bridge, a large friendly turtle emerging from the water, stepping stones partially visible, lush vegetation on both banks, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 7,
      text: "{childName}(이)와 솜이는 거북이 등에 올라탔어요. 물 위를 둥실둥실 건너는 기분이 정말 신났어요! \"고마워, 거북이!\"",
      sceneDescription:
        "거북이 등 위에서 시냇물을 건너는 장면. 물이 반짝이고 물고기들이 뛰어오름.",
      illustrationPrompt: `A large turtle carrying small passengers across a sparkling stream, fish jumping out of the water, sunlight reflecting on the surface, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 8,
      text: "두 번째 시험! 깜깜한 동굴이 나타났어요. {childName}(이)는 조금 무서웠지만, 솜이의 발을 꼭 잡고 한 발 한 발 앞으로 걸었어요.",
      sceneDescription:
        "어둡지만 벽에 희미한 발광 이끼가 붙어있는 동굴 입구. 안쪽에서 약한 빛이 보임.",
      illustrationPrompt: `A cave entrance in the forest, dim but with bioluminescent moss on the walls creating a soft glow, a faint light visible deep inside, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 9,
      text: "동굴 안에서 반딧불이 수백 마리가 팡! 하고 빛을 터뜨렸어요. 캄캄했던 동굴이 별하늘처럼 반짝반짝 빛났어요!",
      sceneDescription:
        "동굴 내부가 수백 마리의 반딧불이로 가득 차 환하게 빛나는 장면. 천장이 별하늘처럼 보임.",
      illustrationPrompt: `Inside a cave illuminated by hundreds of fireflies, the ceiling glowing like a starry sky, magical and warm atmosphere, sparkling light everywhere, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 10,
      text: "세 번째 시험! 높디높은 절벽 위에 별빛 열매가 빛나고 있었어요. {childName}(이)는 깊이 숨을 들이쉬고, 돌 하나하나를 꼭꼭 잡으며 올라갔어요.",
      sceneDescription:
        "숲 속 절벽, 꼭대기에 황금빛으로 빛나는 열매가 달린 나무가 보임. 절벽에 발 디딜 곳이 있음.",
      illustrationPrompt: `A cliff face in the forest with handholds visible, at the top a small tree with a single golden glowing fruit, dramatic lighting from above, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 11,
      text: "\"해냈다!\" {childName}(이)가 별빛 열매를 높이 들어올리자, 숲 전체가 환하게 빛나기 시작했어요. 시든 꽃들이 다시 활짝 피어났어요!",
      sceneDescription:
        "절벽 꼭대기에서 황금빛 열매를 높이 든 장면. 숲 전체에 빛이 퍼지고 꽃들이 피어남.",
      illustrationPrompt: `A view from the top of a cliff, golden light radiating outward across the forest, flowers blooming below, the entire forest coming alive with color and light, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 12,
      text: "노을이 물드는 숲 속에서, 솜이와 부엉이 할아버지와 거북이가 함께 손을 흔들어 주었어요. \"또 놀러 와!\" {childName}(이)의 가슴이 따뜻하고, 발걸음이 가벼웠어요.",
      sceneDescription:
        "노을빛 숲 출구, 동물 친구들(토끼, 부엉이, 거북이)이 손을 흔들고 있음. 숲이 건강하게 빛남.",
      illustrationPrompt: `A forest exit at sunset, animal friends (rabbit, owl, turtle) waving goodbye, the forest glowing with warm golden light, a path leading home, ${STYLE}`,
      emotion: "happy",
    },
  ],
};
