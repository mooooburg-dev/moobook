import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const brushingHero: Scenario = {
  id: "brushing-hero",
  title: "양치 히어로",
  description: "충치 몬스터와 싸우는 용감한 양치 모험 이야기",
  category: "daily-life",
  educationMessage:
    "이를 깨끗이 닦으면 충치 몬스터가 도망가요! 매일 양치하는 멋진 습관을 만들어요.",
  targetAge: "3-5세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 양치가 너무 싫었어요. 입을 꾹 다물고 고개를 절레절레 흔들었지요.",
      sceneDescription: "아이가 양치를 싫어해서 입을 꾹 다물고 있는 장면",
      illustrationPrompt:
        "a cozy bathroom with a small stool in front of a sink, a colorful toothbrush and toothpaste on the counter, mirror reflecting warm light, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cozy bathroom with a small stool in front of a sink, a colorful toothbrush and toothpaste on the counter, mirror reflecting warm light, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "reluctant",
    },
    {
      pageNumber: 2,
      text: "그날 밤 꿈속에서 {childName}(이)의 입안이 거대한 왕국으로 변했어요! 하얀 이빨들이 반짝반짝 빛나고 있었지요.",
      sceneDescription: "꿈속에서 입안이 거대한 왕국으로 변한 장면",
      illustrationPrompt:
        "a magical kingdom made of giant white shiny teeth forming castle walls and towers, sparkling pathways between teeth, dreamy starlit sky above, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a magical kingdom made of giant white shiny teeth forming castle walls and towers, sparkling pathways between teeth, dreamy starlit sky above, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "amazed",
    },
    {
      pageNumber: 3,
      text: "하얀 이빨 성이 우뚝 서 있었어요. 이빨 병사들이 갑옷을 입고 성을 지키고 있었지요. '어서 와! 우리 왕국을 구해줘!'",
      sceneDescription: "하얀 이빨 성과 이빨 병사들이 있는 장면",
      illustrationPrompt:
        "a grand white tooth-shaped castle with cute tooth soldiers wearing tiny armor standing guard, pearly gates, a path leading to the castle entrance, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a grand white tooth-shaped castle with cute tooth soldiers wearing tiny armor standing guard, pearly gates, a path leading to the castle entrance, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "curious",
    },
    {
      pageNumber: 4,
      text: "그때 쿠르릉 쿵쿵! 충치 몬스터 '까미'가 사탕 군대를 이끌고 공격해왔어요! 까만 까미가 끈적끈적한 사탕을 던졌어요.",
      sceneDescription: "충치 몬스터 까미가 사탕 군대를 이끌고 공격하는 장면",
      illustrationPrompt:
        "a dark purple cavity monster leading an army of colorful sticky candy soldiers attacking a white tooth castle, candy projectiles flying through the air, dramatic but not scary scene" +
        STYLE_SUFFIX,
      prompt:
        "a dark purple cavity monster leading an army of colorful sticky candy soldiers attacking a white tooth castle, candy projectiles flying through the air, dramatic but not scary scene" +
        STYLE_SUFFIX,
      emotion: "scared",
    },
    {
      pageNumber: 5,
      text: "이빨 병사들이 하나둘 힘을 잃어가고 있었어요. 반짝이던 이빨이 점점 노랗게 변했어요. '도와줘!'",
      sceneDescription: "이빨 병사들이 힘을 잃어가는 위기의 장면",
      illustrationPrompt:
        "tooth soldiers losing their shine and turning yellowish, some falling over, the white castle dimming, candy goo spreading on the ground, tense atmosphere but child-friendly" +
        STYLE_SUFFIX,
      prompt:
        "tooth soldiers losing their shine and turning yellowish, some falling over, the white castle dimming, candy goo spreading on the ground, tense atmosphere but child-friendly" +
        STYLE_SUFFIX,
      emotion: "worried",
    },
    {
      pageNumber: 6,
      text: "그때 반짝이는 빛 속에서 거대한 칫솔 검과 치약 방패가 나타났어요! '이걸로 싸울 수 있어!'",
      sceneDescription: "칫솔 검과 치약 방패를 발견하는 장면",
      illustrationPrompt:
        "a glowing magical giant toothbrush sword and toothpaste tube shield floating in a beam of light, sparkles and bubbles around them, dramatic reveal scene, empty space below for a character" +
        STYLE_SUFFIX,
      prompt:
        "a glowing magical giant toothbrush sword and toothpaste tube shield floating in a beam of light, sparkles and bubbles around them, dramatic reveal scene, empty space below for a character" +
        STYLE_SUFFIX,
      emotion: "excited",
    },
    {
      pageNumber: 7,
      text: "{childName}(이)가 칫솔 검을 번쩍 들었어요! '충치 몬스터, 각오해!' 용감하게 까미 앞으로 달려갔어요.",
      sceneDescription: "아이가 칫솔 검을 들고 충치 몬스터와 대결하는 장면",
      illustrationPrompt:
        "a dramatic battle scene between a glowing toothbrush sword and a dark cavity monster, mint-colored energy waves clashing with purple candy goo, tooth castle in background, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a dramatic battle scene between a glowing toothbrush sword and a dark cavity monster, mint-colored energy waves clashing with purple candy goo, tooth castle in background, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "determined",
    },
    {
      pageNumber: 8,
      text: "싹싹싹! 위쪽 이빨, 아래쪽 이빨, 안쪽까지! 칫솔 검이 지나간 자리마다 하얗게 빛났어요!",
      sceneDescription: "위아래 안쪽까지 싹싹 닦는 공격을 하는 장면",
      illustrationPrompt:
        "sparkling mint-colored energy waves sweeping across teeth surfaces, white clean streaks appearing where brushing happened, bubbles and foam flying everywhere, dynamic action scene" +
        STYLE_SUFFIX,
      prompt:
        "sparkling mint-colored energy waves sweeping across teeth surfaces, white clean streaks appearing where brushing happened, bubbles and foam flying everywhere, dynamic action scene" +
        STYLE_SUFFIX,
      emotion: "brave",
    },
    {
      pageNumber: 9,
      text: "'으악! 깨끗한 건 싫어!' 까미가 비명을 지르며 도망쳤어요. 사탕 군대도 와르르 녹아버렸어요!",
      sceneDescription: "충치 몬스터가 도망가고 사탕 군대가 녹는 장면",
      illustrationPrompt:
        "a dark cavity monster running away in fear, melting candy soldiers dissolving into puddles, mint bubbles chasing them away, victorious atmosphere, tooth castle shining bright in background" +
        STYLE_SUFFIX,
      prompt:
        "a dark cavity monster running away in fear, melting candy soldiers dissolving into puddles, mint bubbles chasing them away, victorious atmosphere, tooth castle shining bright in background" +
        STYLE_SUFFIX,
      emotion: "thrilled",
    },
    {
      pageNumber: 10,
      text: "이빨 왕국에 다시 평화가 찾아왔어요! 이빨 병사들이 다시 하얗게 반짝이며 환호했어요. '만세!'",
      sceneDescription: "이빨 왕국에 평화가 돌아오고 병사들이 환호하는 장면",
      illustrationPrompt:
        "a restored sparkling white tooth kingdom celebrating, tooth soldiers cheering and jumping, confetti and bubbles in the air, the castle gleaming brightly, festive joyful atmosphere" +
        STYLE_SUFFIX,
      prompt:
        "a restored sparkling white tooth kingdom celebrating, tooth soldiers cheering and jumping, confetti and bubbles in the air, the castle gleaming brightly, festive joyful atmosphere" +
        STYLE_SUFFIX,
      emotion: "joyful",
    },
    {
      pageNumber: 11,
      text: "이빨 왕이 반짝이는 훈장을 달아주었어요. '넌 이제 양치 히어로야!' {childName}(이)의 가슴이 뿌듯했어요.",
      sceneDescription: "이빨 왕이 양치 히어로 훈장을 수여하는 장면",
      illustrationPrompt:
        "a grand tooth king wearing a golden crown presenting a sparkling medal on a velvet cushion, tooth soldiers saluting in formation, royal ceremony in the tooth castle throne room, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a grand tooth king wearing a golden crown presenting a sparkling medal on a velvet cushion, tooth soldiers saluting in formation, royal ceremony in the tooth castle throne room, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "proud",
    },
    {
      pageNumber: 12,
      text: "아침에 눈을 뜬 {childName}(이)는 후다닥 세면대로 달려갔어요. 싹싹싹! 거울 속에 하얀 이가 반짝반짝 빛났어요. '양치 최고!'",
      sceneDescription: "아침에 신나게 양치하는 장면, 거울 속에 반짝이는 이",
      illustrationPrompt:
        "a bright cheerful bathroom in morning sunlight, a mirror reflecting sparkling white teeth with little star twinkles, toothbrush and colorful toothpaste on counter, bubbles floating around, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a bright cheerful bathroom in morning sunlight, a mirror reflecting sparkling white teeth with little star twinkles, toothbrush and colorful toothpaste on counter, bubbles floating around, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
  ],
};
