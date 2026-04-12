import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const birthdayAdventure: Scenario = {
  id: "birthday-adventure",
  title: "내 생일 대모험",
  description: "마법의 초대장을 따라 동물 친구들의 깜짝 파티를 찾아가요",
  category: "celebration",
  targetAge: "3~7세",
  pageCount: 12,
  coverPrompt: `A magical birthday invitation card floating in the air with sparkles, surrounded by wrapped presents, balloons, and confetti, a forest path in the background, ${STYLE}`,
  educationalMessage:
    "감사하는 마음과 우정의 소중함, 그리고 특별한 하루의 의미를 배워요.",
  pages: [
    {
      pageNumber: 1,
      text: "눈을 떠 보니 오늘은 {childName}(이)의 생일이에요! 베개 밑에서 반짝이는 편지가 나왔어요. \"생일 축하해! 비밀 파티에 초대할게. 무지개 길을 따라와!\"",
      sceneDescription:
        "아침, 침대 위에 반짝이는 편지봉투. 창밖으로 무지개가 보임.",
      illustrationPrompt: `A bed with a sparkling golden envelope on the pillow, morning sunlight streaming through a window where a rainbow is visible outside, birthday morning atmosphere, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 2,
      text: "밖으로 나가자 알록달록 무지개 길이 펼쳐져 있었어요! 길 양쪽에 풍선들이 둥실둥실 떠 있었어요. \"어디로 가는 걸까?\" 설레는 마음으로 첫 발을 내디뎠어요.",
      sceneDescription:
        "집 앞에서 시작되는 무지개색 길. 양쪽에 색색의 풍선이 떠 있음.",
      illustrationPrompt: `A rainbow-colored path starting from a house entrance, colorful balloons floating on both sides of the path, leading into a magical landscape, festive atmosphere, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 3,
      text: "무지개 길을 따라 걷자 꽃밭에서 다람쥐가 뛰어나왔어요. \"생일 축하해! 이건 내 선물이야!\" 도토리로 만든 예쁜 목걸이를 걸어 주었어요.",
      sceneDescription:
        "꽃밭 한가운데, 작은 다람쥐가 도토리 목걸이를 내밀고 있음.",
      illustrationPrompt: `A flower meadow with a small squirrel offering a necklace made of acorns, wildflowers blooming all around, a rainbow path passing through, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 4,
      text: "조금 더 걸으니 시냇물 옆에서 개구리가 노래를 부르고 있었어요. \"개굴개굴~ 생일 축하 노래야!\" 물방울들이 음표처럼 톡톡 튀었어요.",
      sceneDescription:
        "시냇물 위 연잎에 앉은 개구리가 노래하고 있음. 음표 모양 물방울이 튀어오름.",
      illustrationPrompt: `A frog sitting on a lily pad in a stream singing, musical note-shaped water droplets bouncing up, joyful riverside scene with reeds and flowers, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 5,
      text: "숲 속으로 들어가니 곰 아저씨가 커다란 꿀단지를 들고 있었어요. \"이건 숲에서 가장 달콤한 꿀이야. 생일 선물!\" {childName}(이)가 한 숟갈 맛보니 정말 달콤했어요!",
      sceneDescription:
        "숲 속, 큰 곰이 꿀단지를 들고 있음. 꿀이 금빛으로 빛나고 있음. 벌들이 주변에 날아다님.",
      illustrationPrompt: `A forest clearing with a friendly bear holding a large honey pot, golden honey glowing, bees buzzing happily around, dappled sunlight, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 6,
      text: "하지만 길이 갑자기 두 갈래로 나뉘었어요. 편지에는 \"별이 가리키는 곳으로!\"라고만 쓰여 있었어요. {childName}(이)가 하늘을 올려다보니… 반짝이는 별이 왼쪽을 가리키고 있었어요!",
      sceneDescription:
        "숲 속 갈림길, 두 갈래 길. 낮인데도 하늘에 큰 별이 빛나며 왼쪽을 가리키고 있음.",
      illustrationPrompt: `A fork in a forest path, two diverging trails, a bright star visible even in daylight pointing left with a beam of light, mysterious and magical, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 7,
      text: "별을 따라 걸으니 언덕 위에 커다란 나무가 나타났어요. 나무에는 알록달록 리본이 매달려 있었지만, 아무도 없었어요. \"어? 아무도 없네…\"",
      sceneDescription:
        "언덕 위 큰 나무, 리본과 깃발이 매달려 있지만 텅 비어 있음. 약간 쓸쓸한 분위기.",
      illustrationPrompt: `A hilltop with a large tree decorated with colorful ribbons and bunting, but the area is empty, slightly quiet and mysterious atmosphere, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 8,
      text: "{childName}(이)가 나무 뒤로 돌아가자… \"깜짝!\" 동물 친구들이 한꺼번에 뛰어나왔어요! 풍선이 팡팡, 색종이가 펄펄 날렸어요!",
      sceneDescription:
        "나무 뒤에서 동물들이 뛰어나옴. 풍선, 색종이, 파티 모자. 화려한 깜짝 파티 장면.",
      illustrationPrompt: `A surprise party scene behind a large tree, balloons popping, confetti flying everywhere, party hats and decorations, joyful and explosive celebration, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 9,
      text: "나무 아래에 세상에서 가장 크고 예쁜 케이크가 놓여 있었어요! 딸기, 블루베리, 초콜릿… {childName}(이)가 좋아하는 것들로 가득했어요.",
      sceneDescription:
        "거대한 3단 케이크, 과일과 초콜릿으로 장식됨. 초 여러 개가 꽂혀 있음.",
      illustrationPrompt: `A magnificent three-tiered birthday cake decorated with strawberries, blueberries, and chocolate, candles lit on top, placed on a tree stump table, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 10,
      text: "\"자, 소원을 빌어!\" 모두가 외쳤어요. {childName}(이)가 눈을 꼭 감고 소원을 빈 뒤, 후~ 촛불을 껐어요. 촛불 연기가 별 모양으로 하늘로 올라갔어요!",
      sceneDescription:
        "케이크 앞에서 촛불을 부는 장면. 연기가 별 모양으로 하늘로 올라감.",
      illustrationPrompt: `Birthday candles being blown out, smoke rising and forming star shapes in the sky, magical twilight atmosphere, cake in the foreground, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 11,
      text: "해가 질 무렵, 하늘에 불꽃놀이가 펑펑 터졌어요! \"생일 축하해, {childName}(아)!\" 빨강, 파랑, 금색 불꽃이 밤하늘을 수놓았어요.",
      sceneDescription:
        "노을 진 하늘에 불꽃놀이가 터지고 있음. 알록달록 불꽃. 언덕 위 나무 실루엣.",
      illustrationPrompt: `Fireworks exploding in a sunset sky, red, blue, and gold bursts, silhouette of a large tree on a hilltop below, festive evening atmosphere, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 12,
      text: "집으로 돌아온 {childName}(이)는 선물과 추억을 꼭 안고 잠자리에 들었어요. \"오늘은 세상에서 가장 행복한 날이야.\" 별이 반짝 윙크하며 인사했어요.",
      sceneDescription:
        "침대에 누운 모습, 선물 상자가 옆에 놓여 있음. 창밖으로 별이 빛남.",
      illustrationPrompt: `A child's bedroom at night, gift boxes beside the bed, a window showing twinkling stars, warm and content sleeping atmosphere, soft nightlight glow, ${STYLE}`,
      emotion: "grateful",
    },
  ],
};
