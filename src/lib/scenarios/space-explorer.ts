import type { Scenario } from "@/types";

const CHARACTER =
  "the same Korean child with short brown hair, wearing a light blue fluffy hooded jacket, ";

export const spaceExplorer: Scenario = {
  id: "space-explorer",
  title: "우주 탐험대",
  description: "반짝이는 별들 사이로 떠나는 신나는 우주 여행 이야기",
  targetAge: "4-8세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{name}이(가) 밤하늘을 올려다보며 소원을 빌었어요. '별나라에 가보고 싶어!'",
      prompt:
        CHARACTER +
        "looking up at a starry night sky making a wish, magical atmosphere, watercolor illustration style, children's book art",
      emotion: "hopeful",
    },
    {
      pageNumber: 2,
      text: "그러자 정원에 작은 우주선이 나타났어요! 문이 스르륵 열렸어요.",
      prompt:
        CHARACTER +
        "standing in a garden watching a small colorful spaceship landing at night, door opening with light coming out, whimsical watercolor children's illustration",
      emotion: "amazed",
    },
    {
      pageNumber: 3,
      text: "우주선 안에는 귀여운 로봇 친구 '삐삐'가 있었어요. '우주 탐험 가자!'",
      prompt:
        CHARACTER +
        "meeting a cute small robot inside a colorful spaceship cockpit, friendly robot waving, watercolor children's book style",
      emotion: "excited",
    },
    {
      pageNumber: 4,
      text: "슈우웅! 우주선이 하늘로 날아올랐어요. 지구가 점점 작아졌어요.",
      prompt:
        CHARACTER +
        "looking out a spaceship window as it flies up through clouds into space, Earth getting smaller below, watercolor space illustration for children",
      emotion: "thrilled",
    },
    {
      pageNumber: 5,
      text: "첫 번째로 도착한 곳은 무지개 행성이에요. 모든 것이 알록달록했어요!",
      prompt:
        CHARACTER +
        "exploring a rainbow-colored planet with colorful landscapes alongside a small robot, whimsical watercolor space illustration",
      emotion: "wonder",
    },
    {
      pageNumber: 6,
      text: "무지개 행성에서 구름 솜사탕을 먹었어요. 달콤하고 푹신푹신!",
      prompt:
        CHARACTER +
        "eating cloud cotton candy on a rainbow planet with a robot friend, playful and sweet atmosphere, watercolor illustration",
      emotion: "delighted",
    },
    {
      pageNumber: 7,
      text: "다음은 반짝이 행성! 보석처럼 빛나는 돌들이 가득했어요.",
      prompt:
        CHARACTER +
        "standing on a planet covered with sparkling gems and crystals with a robot, everything glittering, watercolor space illustration for children",
      emotion: "awe",
    },
    {
      pageNumber: 8,
      text: "그런데 갑자기 우주선에 경고등이 켜졌어요! 연료가 부족해!",
      prompt:
        CHARACTER +
        "looking worried inside a spaceship with warning lights flashing alongside a robot, tense but not scary, watercolor children's illustration",
      emotion: "worried",
    },
    {
      pageNumber: 9,
      text: "'걱정 마! 별빛 에너지를 모으면 돼!' 삐삐가 말했어요.",
      prompt:
        CHARACTER +
        "looking hopeful as a robot points at stars through a spaceship window, explaining the plan, watercolor children's book style",
      emotion: "hopeful",
    },
    {
      pageNumber: 10,
      text: "{name}이(가) 우주선 밖으로 나가 별빛을 모았어요. 반짝반짝 빛이 모여들었어요!",
      prompt:
        CHARACTER +
        "in a cute spacesuit floating in space collecting starlight into a jar, magical glowing particles, watercolor illustration",
      emotion: "brave",
    },
    {
      pageNumber: 11,
      text: "별빛 에너지로 우주선이 다시 움직이기 시작했어요! 이제 집으로!",
      prompt:
        CHARACTER +
        "cheering inside a spaceship powered by starlight energy zooming through space toward Earth, trail of sparkles, watercolor children's book illustration",
      emotion: "relieved",
    },
    {
      pageNumber: 12,
      text: "집에 돌아온 {name}이(가) 별 모양 목걸이를 꼭 쥐었어요. '또 모험하자, 삐삐!'",
      prompt:
        CHARACTER +
        "back in bed holding a star-shaped necklace, robot friend waving goodbye through the window, warm night scene, watercolor illustration",
      emotion: "content",
    },
  ],
};
