import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const animalSchool: Scenario = {
  id: "animal-school",
  title: "동물 학교",
  description: "동물 친구들과 함께하는 첫 학교생활 이야기",
  category: "daily-life",
  educationMessage: "모두 잘하는 게 달라요. 서로의 다름을 존중하고 응원하면 함께 성장할 수 있어요.",
  targetAge: "4-7세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "오늘은 동물 학교 첫날! {childName}(이)는 두근두근 떨리는 마음으로 커다란 나무 학교 앞에 섰어요.",
      sceneDescription: "커다란 나무 학교 앞에 서 있는 설레는 장면",
      illustrationPrompt:
        "a large tree school building with windows and a door, animal students (fox, rabbit, squirrel) walking in, autumn leaves, welcoming atmosphere, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a large tree school building with windows and a door, animal students (fox, rabbit, squirrel) walking in, autumn leaves, welcoming atmosphere, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "nervous",
    },
    {
      pageNumber: 2,
      text: "교실에 들어가니 곰 선생님이 반겨주었어요. '어서 와! 자리에 앉아봐.' 옆자리에는 여우, 토끼, 다람쥐가 앉아 있었어요.",
      sceneDescription: "곰 선생님과 동물 친구들이 있는 교실 장면",
      illustrationPrompt:
        "a cozy tree classroom with a bear teacher at the chalkboard, animal classmates (fox, rabbit, squirrel) sitting at small desks, welcoming warm atmosphere, an empty desk, empty space at the entrance for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cozy tree classroom with a bear teacher at the chalkboard, animal classmates (fox, rabbit, squirrel) sitting at small desks, welcoming warm atmosphere, an empty desk, empty space at the entrance for a character" +
        STYLE_SUFFIX,
      emotion: "shy",
    },
    {
      pageNumber: 3,
      text: "첫 수업은 그림 그리기! 다람쥐 '도토리'가 엄청 잘 그렸어요. {childName}(이)는 조금 부러웠지만 열심히 그렸어요.",
      sceneDescription: "다람쥐의 그림을 부러워하면서 자기 그림을 그리는 장면",
      illustrationPrompt:
        "a classroom art lesson with easels, a talented squirrel student showing a beautiful painting, art supplies scattered around, colorful classroom setting, empty space at an easel for a character" +
        STYLE_SUFFIX,
      prompt:
        "a classroom art lesson with easels, a talented squirrel student showing a beautiful painting, art supplies scattered around, colorful classroom setting, empty space at an easel for a character" +
        STYLE_SUFFIX,
      emotion: "envious",
    },
    {
      pageNumber: 4,
      text: "점심시간에 토끼 '뭉치'가 김밥을 떨어뜨려 울었어요. {childName}(이)는 도시락을 반 나눠주었어요. '같이 먹자!'",
      sceneDescription: "울고 있는 토끼에게 도시락을 나눠주는 장면",
      illustrationPrompt:
        "a school lunch table with a crying rabbit who dropped kimbap on the floor, a lunchbox being offered to share, warm caring scene, other animal students in background, empty space at the table for a character" +
        STYLE_SUFFIX,
      prompt:
        "a school lunch table with a crying rabbit who dropped kimbap on the floor, a lunchbox being offered to share, warm caring scene, other animal students in background, empty space at the table for a character" +
        STYLE_SUFFIX,
      emotion: "kind",
    },
    {
      pageNumber: 5,
      text: "오후에는 달리기 시간! 여우 '바람이'가 제일 빨랐어요. {childName}(이)는 꼴찌였지만 끝까지 완주했어요.",
      sceneDescription: "달리기에서 꼴찌지만 포기하지 않고 달리는 장면",
      illustrationPrompt:
        "a schoolyard running track with animal students racing, a fast fox far ahead, other animals running, a finish line banner, autumn school setting, empty space at the back of the race for a character" +
        STYLE_SUFFIX,
      prompt:
        "a schoolyard running track with animal students racing, a fast fox far ahead, other animals running, a finish line banner, autumn school setting, empty space at the back of the race for a character" +
        STYLE_SUFFIX,
      emotion: "determined",
    },
    {
      pageNumber: 6,
      text: "곰 선생님이 박수를 치며 말했어요. '끝까지 달린 게 제일 멋져! 모두 잘하는 게 다른 거야.'",
      sceneDescription: "곰 선생님이 칭찬해주는 따뜻한 장면",
      illustrationPrompt:
        "a bear teacher applauding warmly at the finish line, animal classmates also clapping and cheering, encouraging supportive atmosphere, schoolyard setting, empty space near the finish line for a character" +
        STYLE_SUFFIX,
      prompt:
        "a bear teacher applauding warmly at the finish line, animal classmates also clapping and cheering, encouraging supportive atmosphere, schoolyard setting, empty space near the finish line for a character" +
        STYLE_SUFFIX,
      emotion: "encouraged",
    },
    {
      pageNumber: 7,
      text: "다음은 노래 수업이에요. {childName}(이)가 노래를 부르자 모두가 귀를 쫑긋 세웠어요. '와, 진짜 잘한다!'",
      sceneDescription: "노래를 불러 동물 친구들을 감동시키는 장면",
      illustrationPrompt:
        "a music classroom with animal students listening in awe with ears perked up, musical notes floating in the air, a microphone or music stand at the front, warm lighting, empty space at the front for a character" +
        STYLE_SUFFIX,
      prompt:
        "a music classroom with animal students listening in awe with ears perked up, musical notes floating in the air, a microphone or music stand at the front, warm lighting, empty space at the front for a character" +
        STYLE_SUFFIX,
      emotion: "confident",
    },
    {
      pageNumber: 8,
      text: "방과 후 다람쥐 도토리가 다가왔어요. '나 노래 못하는데… 가르쳐줄 수 있어?' '{childName}(이)가 환하게 웃었어요. '그럼! 나도 그림 가르쳐줘!'",
      sceneDescription: "다람쥐와 서로의 장기를 교환하기로 하는 장면",
      illustrationPrompt:
        "a squirrel classmate approaching after school with a hopeful expression, school hallway with cubbies and backpacks, afternoon light, friendly atmosphere, empty space near the squirrel for a character" +
        STYLE_SUFFIX,
      prompt:
        "a squirrel classmate approaching after school with a hopeful expression, school hallway with cubbies and backpacks, afternoon light, friendly atmosphere, empty space near the squirrel for a character" +
        STYLE_SUFFIX,
      emotion: "friendly",
    },
    {
      pageNumber: 9,
      text: "매일매일 도토리에게 노래를 가르쳐주고, 도토리에게 그림을 배웠어요. 둘 다 점점 실력이 늘었어요!",
      sceneDescription: "서로 가르치고 배우며 성장하는 몽타주 장면",
      illustrationPrompt:
        "a split scene showing a squirrel practicing singing with musical notes and painting supplies nearby, showing both activities in progress, school garden setting, growth and learning atmosphere, empty space in both halves for a character" +
        STYLE_SUFFIX,
      prompt:
        "a split scene showing a squirrel practicing singing with musical notes and painting supplies nearby, showing both activities in progress, school garden setting, growth and learning atmosphere, empty space in both halves for a character" +
        STYLE_SUFFIX,
      emotion: "growing",
    },
    {
      pageNumber: 10,
      text: "발표회 날이 왔어요! {childName}(이)와 도토리가 함께 노래하며 그림을 그리는 공연을 했어요.",
      sceneDescription: "발표회에서 함께 공연하는 장면",
      illustrationPrompt:
        "a school stage with curtains, a squirrel painting on an easel on stage, animal audience cheering, colorful stage lighting, performance atmosphere, empty space on stage for a character" +
        STYLE_SUFFIX,
      prompt:
        "a school stage with curtains, a squirrel painting on an easel on stage, animal audience cheering, colorful stage lighting, performance atmosphere, empty space on stage for a character" +
        STYLE_SUFFIX,
      emotion: "proud",
    },
    {
      pageNumber: 11,
      text: "모든 동물 친구들이 박수를 보내주었어요. 곰 선생님의 눈에도 눈물이 고였어요. '이게 바로 우정이야!'",
      sceneDescription: "관객 모두가 감동받아 박수치는 장면",
      illustrationPrompt:
        "a bear teacher and animal students giving a standing ovation, confetti falling, a squirrel friend on stage taking a bow, warm emotional atmosphere, empty space on stage for a character" +
        STYLE_SUFFIX,
      prompt:
        "a bear teacher and animal students giving a standing ovation, confetti falling, a squirrel friend on stage taking a bow, warm emotional atmosphere, empty space on stage for a character" +
        STYLE_SUFFIX,
      emotion: "moved",
    },
    {
      pageNumber: 12,
      text: "집으로 돌아오는 길, {childName}(이)는 생각했어요. '학교 진짜 좋다! 내일도 빨리 가고 싶어!' 주머니 속 도토리의 그림 편지가 따뜻했어요.",
      sceneDescription: "학교에서 돌아오며 행복해하는 마무리 장면",
      illustrationPrompt:
        "an autumn path leading away from a tree school, falling leaves in warm colors, a drawing letter peeking from a pocket, warm sunset light, happy ending atmosphere, empty space on the path for a character" +
        STYLE_SUFFIX,
      prompt:
        "an autumn path leading away from a tree school, falling leaves in warm colors, a drawing letter peeking from a pocket, warm sunset light, happy ending atmosphere, empty space on the path for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
  ],
};
