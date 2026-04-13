import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const firstDaySchool: Scenario = {
  id: "first-day-school",
  title: "첫 등원 날",
  description: "두근두근 유치원 첫날, 용기와 우정을 찾아가는 이야기",
  category: "emotion",
  educationMessage:
    "새로운 곳이 무서워도 괜찮아요. 용기를 내면 멋진 친구들이 기다리고 있어요.",
  targetAge: "4-6세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "유치원 가는 날 아침, {childName}(이)는 엄마 손을 꼭 잡았어요. 심장이 두근두근, 다리가 후들후들 떨렸어요.",
      sceneDescription: "유치원 가는 날 아침, 아이가 엄마 손을 꼭 잡고 떨리는 장면",
      illustrationPrompt:
        "a sunny morning street leading to a colorful kindergarten building, cherry blossom trees lining the path, a small backpack on the ground, warm morning sunlight, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a sunny morning street leading to a colorful kindergarten building, cherry blossom trees lining the path, a small backpack on the ground, warm morning sunlight, empty space in the lower center for a character" +
        STYLE_SUFFIX,
      emotion: "nervous",
    },
    {
      pageNumber: 2,
      text: "유치원 문 앞에 도착했어요. 문이 너무 크고, 안에서 왁자지껄 소리가 났어요. 다리가 꼼짝도 안 했어요.",
      sceneDescription: "유치원 문 앞에서 다리가 안 떨어지는 장면",
      illustrationPrompt:
        "a large colorful kindergarten entrance door decorated with paper flowers and welcome signs, shoes neatly lined up outside, sounds of children implied by the lively interior glow, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a large colorful kindergarten entrance door decorated with paper flowers and welcome signs, shoes neatly lined up outside, sounds of children implied by the lively interior glow, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "scared",
    },
    {
      pageNumber: 3,
      text: "그때 선생님이 문을 열고 따뜻하게 웃어주었어요. '어서 와! 기다리고 있었어.' 예쁜 꽃 이름표를 달아주었어요.",
      sceneDescription: "선생님이 따뜻하게 맞이하며 이름표를 달아주는 장면",
      illustrationPrompt:
        "a warm kindergarten hallway with cubbies and coat hooks, a gentle female teacher kneeling down with a flower-shaped name tag in hand, colorful decorations on walls, welcoming atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a warm kindergarten hallway with cubbies and coat hooks, a gentle female teacher kneeling down with a flower-shaped name tag in hand, colorful decorations on walls, welcoming atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "shy",
    },
    {
      pageNumber: 4,
      text: "교실에 들어가니 다른 아이들도 엄마가 보고 싶어 울고 있었어요. {childName}(이)만 그런 게 아니었어요.",
      sceneDescription: "교실에서 다른 아이들도 울고 있는 장면",
      illustrationPrompt:
        "a bright colorful kindergarten classroom with small chairs and tables, toys on shelves, drawings on walls, tissues on desks, a warm but slightly emotional atmosphere, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a bright colorful kindergarten classroom with small chairs and tables, toys on shelves, drawings on walls, tissues on desks, a warm but slightly emotional atmosphere, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "relieved",
    },
    {
      pageNumber: 5,
      text: "옆자리 친구도 눈물을 글썽이고 있었어요. 서로 눈이 마주치자 둘 다 어색하게 웃었어요.",
      sceneDescription: "옆자리 친구와 눈이 마주치는 장면",
      illustrationPrompt:
        "two small kindergarten desks side by side with crayon boxes and tissue papers, two small chairs, a window with sunlight streaming in, intimate and quiet moment, empty space at the desks for characters" +
        STYLE_SUFFIX,
      prompt:
        "two small kindergarten desks side by side with crayon boxes and tissue papers, two small chairs, a window with sunlight streaming in, intimate and quiet moment, empty space at the desks for characters" +
        STYLE_SUFFIX,
      emotion: "connected",
    },
    {
      pageNumber: 6,
      text: "선생님이 블록 놀이를 해보자고 했어요. {childName}(이)와 옆자리 친구가 조심조심 블록 탑을 쌓기 시작했어요.",
      sceneDescription: "블록 놀이를 시작하며 함께 탑을 쌓는 장면",
      illustrationPrompt:
        "a kindergarten play area with colorful building blocks scattered around, a tall impressive block tower being built, bright playful mat on the floor, other toys in background, empty space near the tower for characters" +
        STYLE_SUFFIX,
      prompt:
        "a kindergarten play area with colorful building blocks scattered around, a tall impressive block tower being built, bright playful mat on the floor, other toys in background, empty space near the tower for characters" +
        STYLE_SUFFIX,
      emotion: "curious",
    },
    {
      pageNumber: 7,
      text: "블록 탑이 하늘 높이 올라갔어요! 그런데… 와르르르! 탑이 무너졌어요! 둘 다 놀라다가 빵! 터졌어요. 깔깔깔!",
      sceneDescription: "블록 탑이 무너져서 둘 다 빵 터지는 장면",
      illustrationPrompt:
        "colorful building blocks mid-collapse flying in all directions, blocks scattered across a play mat, a joyful chaotic moment captured mid-action, playful kindergarten setting, empty space in the center for characters" +
        STYLE_SUFFIX,
      prompt:
        "colorful building blocks mid-collapse flying in all directions, blocks scattered across a play mat, a joyful chaotic moment captured mid-action, playful kindergarten setting, empty space in the center for characters" +
        STYLE_SUFFIX,
      emotion: "amused",
    },
    {
      pageNumber: 8,
      text: "점심시간! 같이 밥을 먹으며 이야기했어요. '나는 공룡을 좋아해!' '나도!' 둘이 좋아하는 게 똑같았어요!",
      sceneDescription: "점심시간에 같이 밥 먹으며 이야기하는 장면",
      illustrationPrompt:
        "a cheerful kindergarten lunch room with small tables set with colorful trays of food, milk cartons, spoons, a warm lunch atmosphere with sunlight through windows, empty space at a table for characters" +
        STYLE_SUFFIX,
      prompt:
        "a cheerful kindergarten lunch room with small tables set with colorful trays of food, milk cartons, spoons, a warm lunch atmosphere with sunlight through windows, empty space at a table for characters" +
        STYLE_SUFFIX,
      emotion: "excited",
    },
    {
      pageNumber: 9,
      text: "오후에 다 같이 그림을 그렸어요. {childName}(이)는 새 친구의 얼굴을 정성껏 그려주었어요.",
      sceneDescription: "그림 그리기 시간, 아이가 친구 얼굴을 그리는 장면",
      illustrationPrompt:
        "a kindergarten art table covered with crayons, colored pencils, and drawings, a sheet of paper with a cute child's drawing of a smiling face, paint cups and brushes, creative and warm atmosphere, empty space at the table for characters" +
        STYLE_SUFFIX,
      prompt:
        "a kindergarten art table covered with crayons, colored pencils, and drawings, a sheet of paper with a cute child's drawing of a smiling face, paint cups and brushes, creative and warm atmosphere, empty space at the table for characters" +
        STYLE_SUFFIX,
      emotion: "focused",
    },
    {
      pageNumber: 10,
      text: "친구가 그림을 보고 환하게 웃었어요. '너무 잘 그렸다! 내일도 같이 놀자!' 약속 도장을 꾹!",
      sceneDescription: "친구가 내일도 같이 놀자고 말하는 장면",
      illustrationPrompt:
        "two small hands doing a pinky promise, a crayon drawing visible on the table, warm golden afternoon light through kindergarten windows, happy intimate moment, empty space above the hands for characters" +
        STYLE_SUFFIX,
      prompt:
        "two small hands doing a pinky promise, a crayon drawing visible on the table, warm golden afternoon light through kindergarten windows, happy intimate moment, empty space above the hands for characters" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
    {
      pageNumber: 11,
      text: "하원 시간이 됐어요. 엄마가 왔지만 {childName}(이)가 말했어요. '조금만 더 놀면 안 돼요?'",
      sceneDescription: "하원 시간, 엄마가 왔지만 더 놀고 싶은 장면",
      illustrationPrompt:
        "a kindergarten entrance at pickup time, afternoon golden light, other parents waiting outside, the classroom visible through the door still full of toys and fun, a small backpack ready to go, empty space in the doorway for characters" +
        STYLE_SUFFIX,
      prompt:
        "a kindergarten entrance at pickup time, afternoon golden light, other parents waiting outside, the classroom visible through the door still full of toys and fun, a small backpack ready to go, empty space in the doorway for characters" +
        STYLE_SUFFIX,
      emotion: "reluctant",
    },
    {
      pageNumber: 12,
      text: "집에 오는 길, {childName}(이)는 엄마 손을 잡고 유치원 이야기를 쉬지 않고 했어요. '내일 빨리 갔으면 좋겠다!'",
      sceneDescription: "집에 오는 길에 엄마 손잡고 신나게 이야기하는 마무리 장면",
      illustrationPrompt:
        "a warm sunset street scene leading away from a kindergarten, golden evening light casting long shadows, cherry blossoms gently falling, a small backpack and lunchbox, peaceful and happy ending atmosphere, empty space in the center for characters" +
        STYLE_SUFFIX,
      prompt:
        "a warm sunset street scene leading away from a kindergarten, golden evening light casting long shadows, cherry blossoms gently falling, a small backpack and lunchbox, peaceful and happy ending atmosphere, empty space in the center for characters" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
  ],
};
