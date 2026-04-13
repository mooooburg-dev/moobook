import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const dinosaurWorld: Scenario = {
  id: "dinosaur-world",
  title: "공룡 나라",
  description: "타임머신을 타고 떠나는 공룡 시대 대모험",
  category: "science",
  educationMessage: "크고 무서워 보여도 마음은 따뜻할 수 있어요. 겉모습만으로 판단하지 않아요.",
  targetAge: "4-8세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 박물관에서 신기한 공룡 알을 발견했어요. 알에서 따스한 빛이 새어나오고 있었지요.",
      sceneDescription: "박물관에서 빛나는 공룡 알을 발견하는 장면",
      illustrationPrompt:
        "a museum hall with dinosaur skeletons on display, a glowing dinosaur egg on a pedestal emanating warm light, dramatic museum lighting, empty space near the egg for a character" +
        STYLE_SUFFIX,
      prompt:
        "a museum hall with dinosaur skeletons on display, a glowing dinosaur egg on a pedestal emanating warm light, dramatic museum lighting, empty space near the egg for a character" +
        STYLE_SUFFIX,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "알을 살짝 만지자 눈부신 빛이 번쩍! 정신을 차려보니 초록 숲이 끝없이 펼쳐진 공룡 시대였어요!",
      sceneDescription: "시간 이동 후 공룡 시대 풍경을 마주하는 장면",
      illustrationPrompt:
        "a prehistoric jungle landscape with giant ferns, volcanoes in the background with gentle smoke, lush green vegetation, pterodactyls flying in the sky, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      prompt:
        "a prehistoric jungle landscape with giant ferns, volcanoes in the background with gentle smoke, lush green vegetation, pterodactyls flying in the sky, empty space in the foreground for a character" +
        STYLE_SUFFIX,
      emotion: "amazed",
    },
    {
      pageNumber: 3,
      text: "풀숲에서 작은 아기 트리케라톱스가 나왔어요. 엄마를 잃어버린 것 같아 눈이 촉촉했지요. '울지 마, 내가 도와줄게!'",
      sceneDescription: "울고 있는 아기 트리케라톱스를 달래는 장면",
      illustrationPrompt:
        "a small crying baby triceratops in a prehistoric jungle clearing, tears in its eyes, ferns and tropical plants around, gentle warm light, empty space beside the baby dinosaur for a character" +
        STYLE_SUFFIX,
      prompt:
        "a small crying baby triceratops in a prehistoric jungle clearing, tears in its eyes, ferns and tropical plants around, gentle warm light, empty space beside the baby dinosaur for a character" +
        STYLE_SUFFIX,
      emotion: "compassionate",
    },
    {
      pageNumber: 4,
      text: "아기 공룡과 함께 엄마를 찾아 나섰어요. 하늘에서 큰 프테라노돈이 날갯짓하며 길을 알려주었어요.",
      sceneDescription: "프테라노돈의 안내를 받으며 걷는 장면",
      illustrationPrompt:
        "a flying pteranodon overhead guiding the way, a baby triceratops walking on a prehistoric path, vast prehistoric landscape with palm trees, empty space on the path for a character" +
        STYLE_SUFFIX,
      prompt:
        "a flying pteranodon overhead guiding the way, a baby triceratops walking on a prehistoric path, vast prehistoric landscape with palm trees, empty space on the path for a character" +
        STYLE_SUFFIX,
      emotion: "determined",
    },
    {
      pageNumber: 5,
      text: "강가에 도착하니 목이 아주 긴 브라키오사우루스가 물을 마시고 있었어요. '엄마 트리케라톱스? 저 언덕 너머에서 봤어!'",
      sceneDescription: "거대한 브라키오사우루스에게 길을 묻는 장면",
      illustrationPrompt:
        "a giant brachiosaurus drinking from a river, its long neck stretching high, a baby triceratops nearby looking up, prehistoric riverside scene with ferns, empty space near the river for a character" +
        STYLE_SUFFIX,
      prompt:
        "a giant brachiosaurus drinking from a river, its long neck stretching high, a baby triceratops nearby looking up, prehistoric riverside scene with ferns, empty space near the river for a character" +
        STYLE_SUFFIX,
      emotion: "hopeful",
    },
    {
      pageNumber: 6,
      text: "언덕을 올라가는 길에 땅이 쿵쿵 울렸어요. 커다란 티렉스가 나타났거든요! 하지만 티렉스는 재채기만 하고 있었어요. '에취! 코에 꽃가루가…'",
      sceneDescription: "재채기하는 티렉스를 만나는 유머러스한 장면",
      illustrationPrompt:
        "a large T-Rex sneezing comically with flowers around its feet, pollen floating in the air, a baby triceratops hiding behind a rock, funny and non-threatening scene, empty space near the T-Rex for a character" +
        STYLE_SUFFIX,
      prompt:
        "a large T-Rex sneezing comically with flowers around its feet, pollen floating in the air, a baby triceratops hiding behind a rock, funny and non-threatening scene, empty space near the T-Rex for a character" +
        STYLE_SUFFIX,
      emotion: "surprised",
    },
    {
      pageNumber: 7,
      text: "{childName}(이)가 큰 나뭇잎으로 티렉스의 코를 닦아주었어요. '고마워! 무서웠지? 사실 난 꽃을 좋아해서 재채기를 달고 살아.'",
      sceneDescription: "티렉스의 코를 닦아주는 따뜻한 장면",
      illustrationPrompt:
        "a friendly smiling T-Rex with a large leaf near its nose, flowers blooming around, a baby triceratops peeking out curiously, heartwarming atmosphere, empty space near the T-Rex face for a character" +
        STYLE_SUFFIX,
      prompt:
        "a friendly smiling T-Rex with a large leaf near its nose, flowers blooming around, a baby triceratops peeking out curiously, heartwarming atmosphere, empty space near the T-Rex face for a character" +
        STYLE_SUFFIX,
      emotion: "kind",
    },
    {
      pageNumber: 8,
      text: "티렉스가 등에 태워주었어요! 세상에서 제일 높은 곳에서 보니 공룡 나라가 한눈에 보였어요.",
      sceneDescription: "티렉스 등에 올라타 공룡 세계를 내려다보는 장면",
      illustrationPrompt:
        "a vast prehistoric landscape viewed from high up on a T-Rex back, a baby triceratops sitting behind, rivers, forests, and mountains visible, adventurous panoramic view, empty space on the T-Rex back for a character" +
        STYLE_SUFFIX,
      prompt:
        "a vast prehistoric landscape viewed from high up on a T-Rex back, a baby triceratops sitting behind, rivers, forests, and mountains visible, adventurous panoramic view, empty space on the T-Rex back for a character" +
        STYLE_SUFFIX,
      emotion: "thrilled",
    },
    {
      pageNumber: 9,
      text: "저 멀리 언덕 아래에서 엄마 트리케라톱스가 아기를 찾아 두리번거리고 있었어요! '저기다!'",
      sceneDescription: "멀리서 엄마 트리케라톱스를 발견하는 장면",
      illustrationPrompt:
        "a mother triceratops searching anxiously on a hillside in the distance, a baby triceratops perking up excitedly on a T-Rex back, joyful discovery moment, prehistoric valley landscape, empty space on the T-Rex for a character" +
        STYLE_SUFFIX,
      prompt:
        "a mother triceratops searching anxiously on a hillside in the distance, a baby triceratops perking up excitedly on a T-Rex back, joyful discovery moment, prehistoric valley landscape, empty space on the T-Rex for a character" +
        STYLE_SUFFIX,
      emotion: "excited",
    },
    {
      pageNumber: 10,
      text: "아기 트리케라톱스가 엄마에게 달려갔어요. 엄마가 아기의 볼을 비비며 기뻐했어요. {childName}(이)도 눈물이 핑 돌았어요.",
      sceneDescription: "엄마와 아기 트리케라톱스의 감동적인 재회 장면",
      illustrationPrompt:
        "a baby triceratops reuniting with its mother, nuzzling cheeks together, tears of joy, warm golden light, prehistoric meadow with flowers, emotional scene, empty space beside the dinosaurs for a character" +
        STYLE_SUFFIX,
      prompt:
        "a baby triceratops reuniting with its mother, nuzzling cheeks together, tears of joy, warm golden light, prehistoric meadow with flowers, emotional scene, empty space beside the dinosaurs for a character" +
        STYLE_SUFFIX,
      emotion: "touched",
    },
    {
      pageNumber: 11,
      text: "엄마 트리케라톱스가 뿔에 걸린 목걸이를 건네주었어요. 공룡 발자국 모양 펜던트가 달려 있었지요. '고마워, 작은 영웅!'",
      sceneDescription: "엄마 트리케라톱스에게 감사 선물을 받는 장면",
      illustrationPrompt:
        "a mother triceratops offering a necklace with a dinosaur footprint pendant hanging from her horn, grateful expression, the baby triceratops smiling nearby, warm prehistoric setting, empty space near the mother for a character" +
        STYLE_SUFFIX,
      prompt:
        "a mother triceratops offering a necklace with a dinosaur footprint pendant hanging from her horn, grateful expression, the baby triceratops smiling nearby, warm prehistoric setting, empty space near the mother for a character" +
        STYLE_SUFFIX,
      emotion: "proud",
    },
    {
      pageNumber: 12,
      text: "공룡 알이 다시 빛나더니 {childName}(이)는 박물관으로 돌아왔어요. 손에는 공룡 발자국 목걸이가! 가장 멋진 모험이었어요!",
      sceneDescription: "박물관으로 돌아와 목걸이를 쥔 채 미소짓는 마무리 장면",
      illustrationPrompt:
        "a museum hall with dinosaur exhibits, a dinosaur footprint necklace glowing on a display stand, the dinosaur egg now dark and quiet, warm museum lighting, happy ending atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a museum hall with dinosaur exhibits, a dinosaur footprint necklace glowing on a display stand, the dinosaur egg now dark and quiet, warm museum lighting, happy ending atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
  ],
};
