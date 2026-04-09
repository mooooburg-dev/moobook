import type { Scenario } from "@/types";

const CHARACTER =
  "the same Korean child with short brown hair, wearing a light blue fluffy hooded jacket, ";

export const forestAdventure: Scenario = {
  id: "forest-adventure",
  title: "숲속 대모험",
  description: "신비로운 숲속에서 동물 친구들과 함께하는 모험 이야기",
  targetAge: "3-7세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "어느 화창한 아침, {name}이(가) 집 앞 숲으로 산책을 나갔어요.",
      prompt:
        CHARACTER +
        "walking into a magical forest entrance on a sunny morning, cheerful expression, warm watercolor illustration style, children's book art, soft lighting",
      emotion: "excited",
    },
    {
      pageNumber: 2,
      text: "숲 입구에서 작은 토끼 한 마리가 깡충깡충 뛰어왔어요. '안녕! 나랑 같이 놀래?'",
      prompt:
        CHARACTER +
        "meeting a cute small rabbit at the forest entrance, the rabbit is hopping towards the child, watercolor illustration, children's book style",
      emotion: "curious",
    },
    {
      pageNumber: 3,
      text: "토끼를 따라가니 반짝반짝 빛나는 버섯 길이 나타났어요!",
      prompt:
        CHARACTER +
        "walking along a path of glowing magical mushrooms in a forest with a rabbit, fantasy watercolor illustration, soft ethereal lighting",
      emotion: "wonder",
    },
    {
      pageNumber: 4,
      text: "버섯 길 끝에는 커다란 참나무가 있었어요. 나무 위에서 부엉이가 인사했어요.",
      prompt:
        CHARACTER +
        "looking up at a wise owl sitting in a large oak tree, magical forest setting, watercolor children's book illustration",
      emotion: "awe",
    },
    {
      pageNumber: 5,
      text: "'이 숲에는 비밀 보물이 숨겨져 있단다. 찾아볼래?' 부엉이가 물었어요.",
      prompt:
        CHARACTER +
        "listening to a wise owl speaking from a tree branch, mysterious atmosphere with sparkles, watercolor illustration style",
      emotion: "intrigued",
    },
    {
      pageNumber: 6,
      text: "{name}이(가) 고개를 끄덕이자, 부엉이가 오래된 지도를 건네주었어요.",
      prompt:
        CHARACTER +
        "receiving an old treasure map from an owl, the map glows slightly, forest background, watercolor children's illustration",
      emotion: "determined",
    },
    {
      pageNumber: 7,
      text: "지도를 따라가다 보니 시냇물이 나타났어요. 다리가 없네! 어떡하지?",
      prompt:
        CHARACTER +
        "standing at a stream with no bridge, looking puzzled, forest stream scene, watercolor illustration for children",
      emotion: "worried",
    },
    {
      pageNumber: 8,
      text: "그때 거북이가 나타나 등에 태워주었어요. '내가 도와줄게!'",
      prompt:
        CHARACTER +
        "riding on a large friendly turtle crossing a stream, joyful expression, watercolor children's book style",
      emotion: "grateful",
    },
    {
      pageNumber: 9,
      text: "시냇물을 건너니 꽃밭이 펼쳐졌어요. 나비들이 춤을 추고 있었어요.",
      prompt:
        CHARACTER +
        "walking through a beautiful flower meadow with colorful butterflies dancing around, dreamy watercolor illustration",
      emotion: "joyful",
    },
    {
      pageNumber: 10,
      text: "꽃밭 가운데에 반짝이는 상자가 있었어요. 보물을 찾았다!",
      prompt:
        CHARACTER +
        "finding a sparkling treasure chest in the middle of a flower meadow, excited expression, watercolor children's book illustration",
      emotion: "thrilled",
    },
    {
      pageNumber: 11,
      text: "상자를 열어보니 안에는 예쁜 목걸이와 편지가 있었어요. '용기 있는 너에게!'",
      prompt:
        CHARACTER +
        "opening a treasure chest revealing a beautiful necklace and a letter, warm golden glow, watercolor illustration",
      emotion: "touched",
    },
    {
      pageNumber: 12,
      text: "동물 친구들과 함께 집으로 돌아온 {name}이(가) 활짝 웃었어요. 오늘은 정말 멋진 하루였어요!",
      prompt:
        CHARACTER +
        "walking home from the forest with animal friends (rabbit, owl, turtle), big smile, sunset, warm watercolor children's book ending illustration",
      emotion: "happy",
    },
  ],
};
