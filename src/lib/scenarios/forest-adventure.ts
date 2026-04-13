import type { Scenario } from "@/types";

const CHARACTER =
  "the same Korean child with short brown hair, wearing a light blue fluffy hooded jacket, ";

export const forestAdventure: Scenario = {
  id: "forest-adventure",
  title: "숲속 대모험",
  description: "신비로운 숲속에서 동물 친구들과 함께하는 모험 이야기",
  category: "adventure",
  educationMessage: "용기를 내면 멋진 일이 생겨요. 친구들과 함께하면 어떤 어려움도 이겨낼 수 있어요.",
  targetAge: "3-7세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "어느 화창한 아침, {childName}(이)는 집 앞에서 반짝이는 숲 입구를 발견했어요. 초록빛 나뭇잎 사이로 따스한 햇살이 쏟아지고 있었지요.",
      sceneDescription: "아이가 햇살 가득한 숲 입구 앞에 서 있는 장면",
      illustrationPrompt:
        CHARACTER +
        "walking into a magical forest entrance on a sunny morning, cheerful expression, warm watercolor illustration style, children's book art, soft lighting",
      prompt:
        CHARACTER +
        "walking into a magical forest entrance on a sunny morning, cheerful expression, warm watercolor illustration style, children's book art, soft lighting",
      emotion: "excited",
    },
    {
      pageNumber: 2,
      text: "숲 속 오솔길을 따라 걸어가자, 귀여운 토끼 한 마리가 깡충깡충 뛰어왔어요. \"안녕! 나는 솜이야. 나랑 같이 숲속을 탐험할래?\"",
      sceneDescription: "숲길에서 토끼 솜이를 처음 만나는 장면",
      illustrationPrompt:
        CHARACTER +
        "meeting a cute small rabbit at the forest entrance, the rabbit is hopping towards the child, watercolor illustration, children's book style",
      prompt:
        CHARACTER +
        "meeting a cute small rabbit at the forest entrance, the rabbit is hopping towards the child, watercolor illustration, children's book style",
      emotion: "curious",
    },
    {
      pageNumber: 3,
      text: "솜이를 따라가니 반짝반짝 빛나는 버섯들이 길을 만들고 있었어요. 파란색, 보라색, 분홍색… 마치 무지개 같았지요!",
      sceneDescription: "무지개빛 빛나는 버섯 길을 토끼와 함께 걷는 장면",
      illustrationPrompt:
        CHARACTER +
        "walking along a path of glowing magical mushrooms in a forest with a rabbit, fantasy watercolor illustration, soft ethereal lighting",
      prompt:
        CHARACTER +
        "walking along a path of glowing magical mushrooms in a forest with a rabbit, fantasy watercolor illustration, soft ethereal lighting",
      emotion: "wonder",
    },
    {
      pageNumber: 4,
      text: "버섯 길 끝에 아주 크고 오래된 참나무가 서 있었어요. 나무 꼭대기에서 부엉이 할아버지가 눈을 깜빡이며 내려다보았어요.",
      sceneDescription: "거대한 참나무 위의 부엉이 할아버지를 올려다보는 장면",
      illustrationPrompt:
        CHARACTER +
        "looking up at a wise owl sitting in a large oak tree, magical forest setting, watercolor children's book illustration",
      prompt:
        CHARACTER +
        "looking up at a wise owl sitting in a large oak tree, magical forest setting, watercolor children's book illustration",
      emotion: "awe",
    },
    {
      pageNumber: 5,
      text: "\"호호, 반가워! 이 숲 어딘가에 아주 특별한 보물이 숨겨져 있단다. 용기 있는 친구만 찾을 수 있지. 한번 찾아볼래?\" 부엉이 할아버지가 다정하게 물었어요.",
      sceneDescription: "부엉이가 보물 이야기를 들려주는 신비로운 분위기",
      illustrationPrompt:
        CHARACTER +
        "listening to a wise owl speaking from a tree branch, mysterious atmosphere with sparkles, watercolor illustration style",
      prompt:
        CHARACTER +
        "listening to a wise owl speaking from a tree branch, mysterious atmosphere with sparkles, watercolor illustration style",
      emotion: "intrigued",
    },
    {
      pageNumber: 6,
      text: "{childName}(이)가 힘차게 고개를 끄덕이자, 부엉이 할아버지가 날개 사이에서 오래된 지도를 꺼내 주었어요. 지도에는 별 모양 표시가 반짝이고 있었지요.",
      sceneDescription: "부엉이에게 빛나는 보물 지도를 받는 장면",
      illustrationPrompt:
        CHARACTER +
        "receiving an old treasure map from an owl, the map glows slightly, forest background, watercolor children's illustration",
      prompt:
        CHARACTER +
        "receiving an old treasure map from an owl, the map glows slightly, forest background, watercolor children's illustration",
      emotion: "determined",
    },
    {
      pageNumber: 7,
      text: "지도를 따라 한참 걷다 보니 졸졸졸 흐르는 시냇물이 나타났어요. 그런데 다리가 없네! \"{childName}(아), 어떻게 건너지?\" 솜이가 걱정스럽게 말했어요.",
      sceneDescription: "다리 없는 시냇물 앞에서 당황하는 장면",
      illustrationPrompt:
        CHARACTER +
        "standing at a stream with no bridge, looking puzzled, forest stream scene, watercolor illustration for children",
      prompt:
        CHARACTER +
        "standing at a stream with no bridge, looking puzzled, forest stream scene, watercolor illustration for children",
      emotion: "worried",
    },
    {
      pageNumber: 8,
      text: "그때 물속에서 커다란 거북이가 느긋하게 올라왔어요. \"걱정 마! 내 등에 타면 돼.\" {childName}(이)는 솜이와 함께 거북이 등에 올라탔어요. 물 위를 건너는 기분이 정말 신났어요!",
      sceneDescription: "거북이 등을 타고 시냇물을 건너는 신나는 장면",
      illustrationPrompt:
        CHARACTER +
        "riding on a large friendly turtle crossing a stream, joyful expression, watercolor children's book style",
      prompt:
        CHARACTER +
        "riding on a large friendly turtle crossing a stream, joyful expression, watercolor children's book style",
      emotion: "grateful",
    },
    {
      pageNumber: 9,
      text: "시냇물을 건너니 눈이 번쩍 뜨이는 꽃밭이 펼쳐졌어요. 알록달록한 나비들이 {childName}(이)의 머리 위를 빙글빙글 날아다녔어요.",
      sceneDescription: "나비가 날아다니는 화려한 꽃밭 장면",
      illustrationPrompt:
        CHARACTER +
        "walking through a beautiful flower meadow with colorful butterflies dancing around, dreamy watercolor illustration",
      prompt:
        CHARACTER +
        "walking through a beautiful flower meadow with colorful butterflies dancing around, dreamy watercolor illustration",
      emotion: "joyful",
    },
    {
      pageNumber: 10,
      text: "꽃밭 한가운데, 햇빛을 받아 반짝반짝 빛나는 작은 상자가 놓여 있었어요. \"찾았다! 이게 바로 보물이야!\" {childName}(이)가 두 눈을 동그랗게 뜨며 외쳤어요.",
      sceneDescription: "꽃밭 중앙에서 반짝이는 보물 상자를 발견하는 장면",
      illustrationPrompt:
        CHARACTER +
        "finding a sparkling treasure chest in the middle of a flower meadow, excited expression, watercolor children's book illustration",
      prompt:
        CHARACTER +
        "finding a sparkling treasure chest in the middle of a flower meadow, excited expression, watercolor children's book illustration",
      emotion: "thrilled",
    },
    {
      pageNumber: 11,
      text: "상자를 조심조심 열어 보니, 안에는 별빛처럼 빛나는 예쁜 목걸이와 작은 편지가 들어 있었어요. 편지에는 이렇게 쓰여 있었지요. \"용기 있는 {childName}에게, 넌 정말 멋진 아이야!\"",
      sceneDescription: "보물 상자를 열어 목걸이와 편지를 발견하는 감동 장면",
      illustrationPrompt:
        CHARACTER +
        "opening a treasure chest revealing a beautiful necklace and a letter, warm golden glow, watercolor illustration",
      prompt:
        CHARACTER +
        "opening a treasure chest revealing a beautiful necklace and a letter, warm golden glow, watercolor illustration",
      emotion: "touched",
    },
    {
      pageNumber: 12,
      text: "노을이 물드는 하늘 아래, {childName}(이)는 솜이, 부엉이 할아버지, 거북이와 함께 집으로 돌아왔어요. 가슴이 따뜻하고 발걸음이 가벼웠지요. 오늘은 정말 멋진 하루였어요!",
      sceneDescription: "노을 속에서 동물 친구들과 함께 집으로 돌아가는 마무리 장면",
      illustrationPrompt:
        CHARACTER +
        "walking home from the forest with animal friends (rabbit, owl, turtle), big smile, sunset, warm watercolor children's book ending illustration",
      prompt:
        CHARACTER +
        "walking home from the forest with animal friends (rabbit, owl, turtle), big smile, sunset, warm watercolor children's book ending illustration",
      emotion: "happy",
    },
  ],
};
