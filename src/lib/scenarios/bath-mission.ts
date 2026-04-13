import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const bathMission: Scenario = {
  id: "bath-mission",
  title: "목욕 대작전",
  description: "거품 바다에서 펼쳐지는 신나는 목욕 모험 이야기",
  category: "daily-life",
  educationMessage:
    "목욕은 신나는 모험이에요! 깨끗한 몸은 기분까지 상쾌하게 만들어줘요.",
  targetAge: "3-5세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 목욕하기 싫어서 여기저기 도망 다녔어요. 소파 뒤에도 숨고, 이불 속에도 숨었지요!",
      sceneDescription: "아이가 목욕하기 싫어서 도망 다니는 장면",
      illustrationPrompt:
        "a cozy living room with a sofa and blankets, pillows scattered around showing signs of a playful chase, a bathroom door open in the background with steam coming out, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cozy living room with a sofa and blankets, pillows scattered around showing signs of a playful chase, a bathroom door open in the background with steam coming out, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "reluctant",
    },
    {
      pageNumber: 2,
      text: "엄마가 욕조에 물을 받아놓고 나간 사이, 욕조에서 거품이 부글부글 올라오기 시작했어요!",
      sceneDescription: "욕조에서 거품이 부글부글 올라오는 장면",
      illustrationPrompt:
        "a bathroom with a bathtub overflowing with magical colorful bubbles, bubbles rising up toward the ceiling, warm bathroom tiles, rubber ducks on the edge, mysterious glow from inside the bubbles, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a bathroom with a bathtub overflowing with magical colorful bubbles, bubbles rising up toward the ceiling, warm bathroom tiles, rubber ducks on the edge, mysterious glow from inside the bubbles, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "거품 속에서 동그란 거품 대장 '뽀글이'가 뿅 하고 나타났어요! '안녕! 나랑 거품 바다로 모험 가자!'",
      sceneDescription: "거품 대장 뽀글이가 나타나는 장면",
      illustrationPrompt:
        "a cute round bubble character with a cheerful face emerging from a mountain of colorful bath bubbles in a bathtub, rainbow-tinted bubbles floating around, magical sparkles, empty space to the side for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cute round bubble character with a cheerful face emerging from a mountain of colorful bath bubbles in a bathtub, rainbow-tinted bubbles floating around, magical sparkles, empty space to the side for a character" +
        STYLE_SUFFIX,
      emotion: "amazed",
    },
    {
      pageNumber: 4,
      text: "욕조가 점점 커지더니 끝없는 거품 바다로 변했어요! 무지개빛 거품들이 둥둥 떠다녔어요.",
      sceneDescription: "욕조가 거품 바다로 변신하는 장면",
      illustrationPrompt:
        "a vast magical bubble ocean stretching to the horizon, rainbow-colored bubbles of all sizes floating on turquoise water, a bubble boat ready at a dock, fluffy cloud-like foam islands in the distance, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a vast magical bubble ocean stretching to the horizon, rainbow-colored bubbles of all sizes floating on turquoise water, a bubble boat ready at a dock, fluffy cloud-like foam islands in the distance, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "excited",
    },
    {
      pageNumber: 5,
      text: "뽀글이와 함께 거품 배를 타고 출발! 부글부글 파도를 넘으며 신나는 항해가 시작됐어요.",
      sceneDescription: "거품 배를 타고 항해하는 장면",
      illustrationPrompt:
        "a cute bubble boat sailing on a foamy sea with gentle bubble waves, a round bubble captain character steering, soap bubble sails catching the breeze, fish made of bubbles jumping alongside, empty space on the boat for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cute bubble boat sailing on a foamy sea with gentle bubble waves, a round bubble captain character steering, soap bubble sails catching the breeze, fish made of bubbles jumping alongside, empty space on the boat for a character" +
        STYLE_SUFFIX,
      emotion: "thrilled",
    },
    {
      pageNumber: 6,
      text: "비누 섬에 도착했어요! 미끌미끌 미끄럼틀이 있었어요. 슈우웅! 타고 내려가니 온몸이 미끌미끌해졌어요!",
      sceneDescription: "비누 섬에서 미끄럼틀을 타는 장면",
      illustrationPrompt:
        "a tropical island made of colorful bar soaps with slippery slides spiraling down, palm trees made of sponges, the slides have soapy water running down them, splash pool at the bottom, empty space on the slide for a character" +
        STYLE_SUFFIX,
      prompt:
        "a tropical island made of colorful bar soaps with slippery slides spiraling down, palm trees made of sponges, the slides have soapy water running down them, splash pool at the bottom, empty space on the slide for a character" +
        STYLE_SUFFIX,
      emotion: "joyful",
    },
    {
      pageNumber: 7,
      text: "샴푸 폭포에서 머리카락 요정들이 노래를 불렀어요. 폭포수가 머리를 감겨주니 뽀드득뽀드득 기분이 좋았어요!",
      sceneDescription: "샴푸 폭포에서 머리카락 요정들이 노래하는 장면",
      illustrationPrompt:
        "a magical waterfall made of shampoo with iridescent foam, tiny hair fairy characters with flowing colorful hair singing around the waterfall, musical notes floating in the mist, flowers growing along the waterfall edge, empty space near the waterfall for a character" +
        STYLE_SUFFIX,
      prompt:
        "a magical waterfall made of shampoo with iridescent foam, tiny hair fairy characters with flowing colorful hair singing around the waterfall, musical notes floating in the mist, flowers growing along the waterfall edge, empty space near the waterfall for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
    {
      pageNumber: 8,
      text: "때밀이 문어가 부드러운 다리로 등을 밀어주었어요. 간질간질! {childName}(이)가 깔깔깔 웃었어요.",
      sceneDescription: "때밀이 문어가 등을 밀어주는 재미있는 장면",
      illustrationPrompt:
        "a friendly smiling octopus with soft loofah-textured tentacles in a bubbly ocean setting, one tentacle holding a bath sponge, bubbles everywhere, playful and ticklish atmosphere, empty space next to the octopus for a character" +
        STYLE_SUFFIX,
      prompt:
        "a friendly smiling octopus with soft loofah-textured tentacles in a bubbly ocean setting, one tentacle holding a bath sponge, bubbles everywhere, playful and ticklish atmosphere, empty space next to the octopus for a character" +
        STYLE_SUFFIX,
      emotion: "amused",
    },
    {
      pageNumber: 9,
      text: "거품 해적이 나타났어요! 하지만 {childName}(이)가 깨끗한 물줄기를 뿜자 거품 해적이 펑 하고 터졌어요!",
      sceneDescription: "거품 해적을 물줄기로 물리치는 장면",
      illustrationPrompt:
        "a comical bubble pirate ship made of foam with a silly bubble pirate captain, clean water streams shooting and popping the bubble pirates, splashes and bursting bubbles everywhere, victorious atmosphere, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a comical bubble pirate ship made of foam with a silly bubble pirate captain, clean water streams shooting and popping the bubble pirates, splashes and bursting bubbles everywhere, victorious atmosphere, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "brave",
    },
    {
      pageNumber: 10,
      text: "거품 왕국의 보물을 발견했어요! 향기로운 비누 목걸이가 무지개빛으로 반짝였어요.",
      sceneDescription: "향기로운 비누 목걸이 보물을 획득하는 장면",
      illustrationPrompt:
        "an open treasure chest on a bubble island revealing a beautiful soap necklace glowing with rainbow colors, fragrant flower petals floating around, sparkles and light beams emanating from the treasure, empty space near the chest for a character" +
        STYLE_SUFFIX,
      prompt:
        "an open treasure chest on a bubble island revealing a beautiful soap necklace glowing with rainbow colors, fragrant flower petals floating around, sparkles and light beams emanating from the treasure, empty space near the chest for a character" +
        STYLE_SUFFIX,
      emotion: "delighted",
    },
    {
      pageNumber: 11,
      text: "모험이 끝나고 욕조로 돌아왔어요. {childName}(이)의 몸이 반짝반짝 깨끗해져 있었어요!",
      sceneDescription: "모험이 끝나고 욕조로 돌아와 깨끗해진 장면",
      illustrationPrompt:
        "a bathroom with a bathtub filled with clean warm water, sparkles and tiny stars floating above the water surface, the bubble character waving goodbye from inside a bubble, warm golden bathroom light, empty space in the bathtub area for a character" +
        STYLE_SUFFIX,
      prompt:
        "a bathroom with a bathtub filled with clean warm water, sparkles and tiny stars floating above the water surface, the bubble character waving goodbye from inside a bubble, warm golden bathroom light, empty space in the bathtub area for a character" +
        STYLE_SUFFIX,
      emotion: "refreshed",
    },
    {
      pageNumber: 12,
      text: "포근한 수건에 감싸인 {childName}(이)가 활짝 웃었어요. '목욕 또 하고 싶다!' 비누 목걸이에서 좋은 향기가 솔솔 났어요.",
      sceneDescription: "깨끗해진 아이가 수건에 감싸여 웃는 마무리 장면",
      illustrationPrompt:
        "a cozy bedroom scene with a fluffy towel and a soap necklace glowing softly on a nightstand, warm lamp light, steam wisps in the air suggesting a fresh bath, comfortable and happy atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cozy bedroom scene with a fluffy towel and a soap necklace glowing softly on a nightstand, warm lamp light, steam wisps in the air suggesting a fresh bath, comfortable and happy atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
  ],
};
