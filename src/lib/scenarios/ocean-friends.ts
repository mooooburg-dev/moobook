import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const oceanFriends: Scenario = {
  id: "ocean-friends",
  title: "바다 친구들",
  description: "알록달록 바닷속 세계에서 물고기 친구들과 함께하는 우정 이야기",
  category: "adventure",
  educationMessage: "다르게 생겼어도 모두 소중한 친구가 될 수 있어요. 도움이 필요한 친구에게 먼저 손을 내밀어요.",
  targetAge: "3-6세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 해변에서 반짝이는 조개를 주웠어요. 그 순간 파도가 살랑살랑 속삭였어요. '바닷속으로 놀러 올래?'",
      sceneDescription: "해변에서 빛나는 조개를 줍는 아이",
      illustrationPrompt:
        "a sunny beach with gentle waves lapping the shore, a glowing seashell resting on the sand, sparkles around it, blue sky and white clouds, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a sunny beach with gentle waves lapping the shore, a glowing seashell resting on the sand, sparkles around it, blue sky and white clouds, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "조개를 가슴에 꼭 안자, {childName}(이)의 몸이 둥둥 떠오르더니 바닷속으로 풍덩! 숨도 쉴 수 있었어요!",
      sceneDescription: "마법의 조개 덕분에 바닷속으로 들어가는 장면",
      illustrationPrompt:
        "a colorful underwater world entrance with bubbles everywhere, a glowing seashell creating a magical barrier, coral reef visible below, sunlight filtering through water surface above, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a colorful underwater world entrance with bubbles everywhere, a glowing seashell creating a magical barrier, coral reef visible below, sunlight filtering through water surface above, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "amazed",
    },
    {
      pageNumber: 3,
      text: "산호초 마을에서 작은 해마 '해롱이'가 인사했어요. '안녕! 내가 바닷속을 안내해 줄게!'",
      sceneDescription: "산호초 마을에서 해마를 만나는 장면",
      illustrationPrompt:
        "a cute seahorse near colorful coral reefs underwater, a vibrant coral village with small doors and windows in the coral, tropical fish swimming by, friendly atmosphere, empty space beside the seahorse for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cute seahorse near colorful coral reefs underwater, a vibrant coral village with small doors and windows in the coral, tropical fish swimming by, friendly atmosphere, empty space beside the seahorse for a character" +
        STYLE_SUFFIX,
      emotion: "excited",
    },
    {
      pageNumber: 4,
      text: "해롱이를 따라가니 거대한 해초 숲이 나타났어요. 초록 리본처럼 흔들리는 해초 사이로 햇빛이 반짝였어요.",
      sceneDescription: "거대한 해초 숲을 탐험하는 장면",
      illustrationPrompt:
        "a magical kelp forest underwater with tall swaying green kelp, sunbeams filtering through water creating light patterns, a seahorse swimming ahead, small fish darting between kelp, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a magical kelp forest underwater with tall swaying green kelp, sunbeams filtering through water creating light patterns, a seahorse swimming ahead, small fish darting between kelp, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "wonder",
    },
    {
      pageNumber: 5,
      text: "해초 숲에서 거북이 할머니가 느릿느릿 헤엄치고 있었어요. '이 근처에 길 잃은 아기 물고기가 있단다. 찾아줄 수 있겠니?'",
      sceneDescription: "거북이 할머니에게 아기 물고기 이야기를 듣는 장면",
      illustrationPrompt:
        "an old wise sea turtle swimming slowly in a kelp forest, concerned expression, small bubbles rising, dim but warm underwater lighting, empty space near the turtle for a character" +
        STYLE_SUFFIX,
      prompt:
        "an old wise sea turtle swimming slowly in a kelp forest, concerned expression, small bubbles rising, dim but warm underwater lighting, empty space near the turtle for a character" +
        STYLE_SUFFIX,
      emotion: "concerned",
    },
    {
      pageNumber: 6,
      text: "{childName}(이)는 고개를 끄덕이고 해롱이와 함께 아기 물고기를 찾아 나섰어요. 깊고 어두운 바위틈도 용감하게 들여다봤어요.",
      sceneDescription: "바위틈을 살펴보며 아기 물고기를 찾는 용감한 장면",
      illustrationPrompt:
        "dark rocky underwater crevices with mysterious shadows, a seahorse peeking into gaps, bioluminescent organisms providing faint light, searching atmosphere, empty space near the rocks for a character" +
        STYLE_SUFFIX,
      prompt:
        "dark rocky underwater crevices with mysterious shadows, a seahorse peeking into gaps, bioluminescent organisms providing faint light, searching atmosphere, empty space near the rocks for a character" +
        STYLE_SUFFIX,
      emotion: "brave",
    },
    {
      pageNumber: 7,
      text: "드디어 조개 속에 숨어 있는 작고 떨리는 아기 물고기를 발견했어요! '무서웠지? 이제 괜찮아.'",
      sceneDescription: "조개 속에 숨은 아기 물고기를 발견하고 달래주는 장면",
      illustrationPrompt:
        "a small scared fish hiding in a giant open clam shell, the fish trembling slightly, gentle light surrounding the clam, protective and caring atmosphere, empty space near the clam for a character" +
        STYLE_SUFFIX,
      prompt:
        "a small scared fish hiding in a giant open clam shell, the fish trembling slightly, gentle light surrounding the clam, protective and caring atmosphere, empty space near the clam for a character" +
        STYLE_SUFFIX,
      emotion: "tender",
    },
    {
      pageNumber: 8,
      text: "아기 물고기를 데리고 산호초 마을로 돌아오니, 물고기 가족이 기뻐하며 달려왔어요. '고마워, 고마워!'",
      sceneDescription: "물고기 가족이 재회하며 감사하는 따뜻한 장면",
      illustrationPrompt:
        "a happy fish family reuniting near colorful coral reefs, the baby fish swimming toward its parents, joyful bubbles rising, warm underwater light, empty space to the side for a character" +
        STYLE_SUFFIX,
      prompt:
        "a happy fish family reuniting near colorful coral reefs, the baby fish swimming toward its parents, joyful bubbles rising, warm underwater light, empty space to the side for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
    {
      pageNumber: 9,
      text: "물고기 친구들이 고마움의 표시로 멋진 바다 축제를 열어 주었어요! 알록달록 물고기들이 함께 춤을 췄어요.",
      sceneDescription: "화려한 바다 축제에서 물고기들과 함께 춤추는 장면",
      illustrationPrompt:
        "an underwater festival with colorful fish dancing in formation, glowing jellyfish lanterns hanging like decorations, coral stage, festive bubbles and sparkles everywhere, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "an underwater festival with colorful fish dancing in formation, glowing jellyfish lanterns hanging like decorations, coral stage, festive bubbles and sparkles everywhere, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "joyful",
    },
    {
      pageNumber: 10,
      text: "문어 아저씨가 먹물로 {childName}(이)의 이름을 바다 벽에 쓰고 있었어요. '바다를 도와준 영웅이야!'",
      sceneDescription: "문어가 벽에 아이의 이름을 쓰는 재미있는 장면",
      illustrationPrompt:
        "an octopus with ink writing on a coral wall, amusing proud expression, underwater decorations around the writing, other fish watching and cheering, empty space near the wall for a character" +
        STYLE_SUFFIX,
      prompt:
        "an octopus with ink writing on a coral wall, amusing proud expression, underwater decorations around the writing, other fish watching and cheering, empty space near the wall for a character" +
        STYLE_SUFFIX,
      emotion: "proud",
    },
    {
      pageNumber: 11,
      text: "해롱이가 진주 팔찌를 선물해 주었어요. '언제든 이걸 차면 우리를 만날 수 있어!'",
      sceneDescription: "해마가 진주 팔찌를 선물하는 감동적인 장면",
      illustrationPrompt:
        "a seahorse presenting a sparkling pearl bracelet, the bracelet glowing with inner light, beautiful underwater scene with coral and small fish in background, emotional farewell moment, empty space beside the seahorse for a character" +
        STYLE_SUFFIX,
      prompt:
        "a seahorse presenting a sparkling pearl bracelet, the bracelet glowing with inner light, beautiful underwater scene with coral and small fish in background, emotional farewell moment, empty space beside the seahorse for a character" +
        STYLE_SUFFIX,
      emotion: "touched",
    },
    {
      pageNumber: 12,
      text: "파도가 {childName}(이)를 살며시 해변으로 돌려보냈어요. 손목의 진주 팔찌가 반짝이고 있었어요. '또 놀러 갈게, 바다 친구들!'",
      sceneDescription: "해변으로 돌아와 진주 팔찌를 바라보며 인사하는 마무리 장면",
      illustrationPrompt:
        "a sunset beach scene, gentle waves, a pearl bracelet sparkling on the sand, the ocean glowing golden in the sunset, peaceful ending atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a sunset beach scene, gentle waves, a pearl bracelet sparkling on the sand, the ocean glowing golden in the sunset, peaceful ending atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "grateful",
    },
  ],
};
