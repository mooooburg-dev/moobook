import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const spaceExplorer: Scenario = {
  id: "space-explorer",
  title: "우주 탐험대",
  description: "반짝이는 별들 사이로 떠나는 신나는 우주 여행 이야기",
  category: "science",
  educationMessage: "문제를 만나도 포기하지 않으면 해결할 수 있어요. 호기심은 새로운 세계로 이끄는 열쇠예요.",
  targetAge: "4-8세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{childName}이(가) 밤하늘을 올려다보며 소원을 빌었어요. '별나라에 가보고 싶어!'",
      sceneDescription: "아이가 밤하늘을 올려다보며 소원을 비는 장면",
      illustrationPrompt:
        "a beautiful starry night sky viewed from a garden, countless twinkling stars and a crescent moon, a telescope on the grass, magical atmosphere, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a beautiful starry night sky viewed from a garden, countless twinkling stars and a crescent moon, a telescope on the grass, magical atmosphere, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "hopeful",
    },
    {
      pageNumber: 2,
      text: "그러자 정원에 작은 우주선이 나타났어요! 문이 스르륵 열렸어요.",
      sceneDescription: "정원에 착륙한 작은 우주선의 문이 열리는 장면",
      illustrationPrompt:
        "a small colorful spaceship landing in a garden at night, its door opening with bright light coming out, steam and sparkles around the landing site, starry sky above, empty space near the spaceship door for a character" +
        STYLE_SUFFIX,
      prompt:
        "a small colorful spaceship landing in a garden at night, its door opening with bright light coming out, steam and sparkles around the landing site, starry sky above, empty space near the spaceship door for a character" +
        STYLE_SUFFIX,
      emotion: "amazed",
    },
    {
      pageNumber: 3,
      text: "우주선 안에는 귀여운 로봇 친구 '삐삐'가 있었어요. '우주 탐험 가자!'",
      sceneDescription: "우주선 조종석에서 로봇 삐삐를 만나는 장면",
      illustrationPrompt:
        "a colorful spaceship cockpit interior with buttons and screens, a cute small robot waving from the pilot seat, stars visible through the windshield, empty space in the co-pilot seat for a character" +
        STYLE_SUFFIX,
      prompt:
        "a colorful spaceship cockpit interior with buttons and screens, a cute small robot waving from the pilot seat, stars visible through the windshield, empty space in the co-pilot seat for a character" +
        STYLE_SUFFIX,
      emotion: "excited",
    },
    {
      pageNumber: 4,
      text: "슈우웅! 우주선이 하늘로 날아올랐어요. 지구가 점점 작아졌어요.",
      sceneDescription: "우주선이 이륙하며 지구가 작아지는 장면",
      illustrationPrompt:
        "a view from inside a spaceship window showing Earth getting smaller below, clouds parting, stars appearing, the vastness of space opening up, cockpit dashboard visible, empty space in front of the window for a character" +
        STYLE_SUFFIX,
      prompt:
        "a view from inside a spaceship window showing Earth getting smaller below, clouds parting, stars appearing, the vastness of space opening up, cockpit dashboard visible, empty space in front of the window for a character" +
        STYLE_SUFFIX,
      emotion: "thrilled",
    },
    {
      pageNumber: 5,
      text: "첫 번째로 도착한 곳은 무지개 행성이에요. 모든 것이 알록달록했어요!",
      sceneDescription: "알록달록한 무지개 행성을 탐험하는 장면",
      illustrationPrompt:
        "a rainbow-colored planet landscape with colorful terrain, rainbow mountains and multicolored plants, a small robot exploring nearby, whimsical alien flowers, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a rainbow-colored planet landscape with colorful terrain, rainbow mountains and multicolored plants, a small robot exploring nearby, whimsical alien flowers, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "wonder",
    },
    {
      pageNumber: 6,
      text: "무지개 행성에서 구름 솜사탕을 먹었어요. 달콤하고 푹신푹신!",
      sceneDescription: "무지개 행성에서 구름 솜사탕을 먹는 장면",
      illustrationPrompt:
        "fluffy cloud cotton candy growing on rainbow trees, a small robot reaching for one, playful and sweet alien landscape, candy-like rocks and pastel sky, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "fluffy cloud cotton candy growing on rainbow trees, a small robot reaching for one, playful and sweet alien landscape, candy-like rocks and pastel sky, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "delighted",
    },
    {
      pageNumber: 7,
      text: "다음은 반짝이 행성! 보석처럼 빛나는 돌들이 가득했어요.",
      sceneDescription: "보석으로 가득한 반짝이 행성에 서 있는 장면",
      illustrationPrompt:
        "a planet surface covered with sparkling gems and crystals of all colors, everything glittering and refracting light, a small robot standing nearby in awe, crystal caves in the background, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a planet surface covered with sparkling gems and crystals of all colors, everything glittering and refracting light, a small robot standing nearby in awe, crystal caves in the background, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "awe",
    },
    {
      pageNumber: 8,
      text: "그런데 갑자기 우주선에 경고등이 켜졌어요! 연료가 부족해!",
      sceneDescription: "우주선 경고등이 켜진 긴박한 장면",
      illustrationPrompt:
        "a spaceship interior with red warning lights flashing, a fuel gauge showing nearly empty, a worried small robot looking at the dashboard, tense but not scary atmosphere, empty space near the controls for a character" +
        STYLE_SUFFIX,
      prompt:
        "a spaceship interior with red warning lights flashing, a fuel gauge showing nearly empty, a worried small robot looking at the dashboard, tense but not scary atmosphere, empty space near the controls for a character" +
        STYLE_SUFFIX,
      emotion: "worried",
    },
    {
      pageNumber: 9,
      text: "'걱정 마! 별빛 에너지를 모으면 돼!' 삐삐가 말했어요.",
      sceneDescription: "삐삐가 별빛 에너지 해결책을 알려주는 장면",
      illustrationPrompt:
        "a spaceship window showing brilliant stars outside, a small robot pointing at the stars excitedly, star charts on a screen, hopeful atmosphere, empty space beside the robot for a character" +
        STYLE_SUFFIX,
      prompt:
        "a spaceship window showing brilliant stars outside, a small robot pointing at the stars excitedly, star charts on a screen, hopeful atmosphere, empty space beside the robot for a character" +
        STYLE_SUFFIX,
      emotion: "hopeful",
    },
    {
      pageNumber: 10,
      text: "{childName}이(가) 우주선 밖으로 나가 별빛을 모았어요. 반짝반짝 빛이 모여들었어요!",
      sceneDescription: "우주복을 입고 별빛을 모으는 용감한 장면",
      illustrationPrompt:
        "outer space with magical glowing starlight particles gathering into a jar, sparkling cosmic dust, the spaceship floating nearby, a vast starfield background, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "outer space with magical glowing starlight particles gathering into a jar, sparkling cosmic dust, the spaceship floating nearby, a vast starfield background, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "brave",
    },
    {
      pageNumber: 11,
      text: "별빛 에너지로 우주선이 다시 움직이기 시작했어요! 이제 집으로!",
      sceneDescription: "별빛 에너지로 우주선이 되살아나 지구로 향하는 장면",
      illustrationPrompt:
        "a spaceship powered by starlight energy zooming through space toward Earth, trail of sparkles behind it, Earth visible in the distance, a small robot cheering inside, triumphant atmosphere, empty space in the cockpit for a character" +
        STYLE_SUFFIX,
      prompt:
        "a spaceship powered by starlight energy zooming through space toward Earth, trail of sparkles behind it, Earth visible in the distance, a small robot cheering inside, triumphant atmosphere, empty space in the cockpit for a character" +
        STYLE_SUFFIX,
      emotion: "relieved",
    },
    {
      pageNumber: 12,
      text: "집에 돌아온 {childName}이(가) 별 모양 목걸이를 꼭 쥐었어요. '또 모험하자, 삐삐!'",
      sceneDescription: "침대에서 별 목걸이를 쥐고 삐삐와 작별하는 마무리 장면",
      illustrationPrompt:
        "a cozy bedroom at night, a star-shaped necklace glowing on the pillow, a small robot friend waving goodbye through the window, warm night scene with moonlight, empty space on the bed for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cozy bedroom at night, a star-shaped necklace glowing on the pillow, a small robot friend waving goodbye through the window, warm night scene with moonlight, empty space on the bed for a character" +
        STYLE_SUFFIX,
      emotion: "content",
    },
  ],
};
