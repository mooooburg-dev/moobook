import type { Scenario } from "@/types";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

export const birthdayAdventure: Scenario = {
  id: "birthday-adventure",
  title: "내 생일 대모험",
  description: "무지개 길을 따라 떠나는 특별한 생일 파티 이야기",
  category: "celebration",
  educationMessage:
    "생일은 내가 태어난 특별한 날이에요. 나를 사랑해주는 사람들에게 감사해요.",
  targetAge: "3-7세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "생일 아침, {childName}(이)가 눈을 떴어요. 베개 밑에서 반짝반짝 빛나는 초대장이 나왔어요!",
      sceneDescription: "생일 아침, 베개 밑에서 반짝이는 초대장을 발견하는 장면",
      illustrationPrompt:
        "a cozy children's bedroom in warm morning light, a pillow slightly lifted revealing a glowing golden invitation card underneath, birthday bunting on the wall, stuffed animals on the bed, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cozy children's bedroom in warm morning light, a pillow slightly lifted revealing a glowing golden invitation card underneath, birthday bunting on the wall, stuffed animals on the bed, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "surprised",
    },
    {
      pageNumber: 2,
      text: "초대장에 이렇게 적혀 있었어요. '특별한 파티에 초대합니다. 무지개 길을 따라오세요!'",
      sceneDescription: "반짝이는 초대장을 읽는 장면",
      illustrationPrompt:
        "a close-up of a beautiful golden invitation card with rainbow-colored edges and sparkling stars, magical light emanating from the card, confetti-like sparkles floating around it, a child's bedroom background slightly blurred" +
        STYLE_SUFFIX,
      prompt:
        "a close-up of a beautiful golden invitation card with rainbow-colored edges and sparkling stars, magical light emanating from the card, confetti-like sparkles floating around it, a child's bedroom background slightly blurred" +
        STYLE_SUFFIX,
      emotion: "curious",
    },
    {
      pageNumber: 3,
      text: "방문을 열자 무지개 빛 길이 쭈우욱 펼쳐져 있었어요! 일곱 가지 색깔이 반짝반짝 빛났어요.",
      sceneDescription: "방문을 열면 무지개 빛 길이 펼쳐져 있는 장면",
      illustrationPrompt:
        "a doorway opening to reveal a magical rainbow-colored pathway stretching into a whimsical landscape, seven distinct colors glowing on the path, flowers and butterflies along the sides, magical sparkles in the air, empty space in the doorway for a character" +
        STYLE_SUFFIX,
      prompt:
        "a doorway opening to reveal a magical rainbow-colored pathway stretching into a whimsical landscape, seven distinct colors glowing on the path, flowers and butterflies along the sides, magical sparkles in the air, empty space in the doorway for a character" +
        STYLE_SUFFIX,
      emotion: "amazed",
    },
    {
      pageNumber: 4,
      text: "무지개 길을 따라가다 생일 모자를 쓴 곰을 만났어요. '생일 축하해! 이 풍선을 선물할게!' 알록달록 풍선이 둥둥!",
      sceneDescription: "생일 모자를 쓴 곰에게 풍선을 선물받는 장면",
      illustrationPrompt:
        "a friendly bear wearing a colorful birthday party hat standing on a rainbow path, holding a bunch of colorful balloons, green meadow with wildflowers on both sides, festive atmosphere, empty space beside the bear for a character" +
        STYLE_SUFFIX,
      prompt:
        "a friendly bear wearing a colorful birthday party hat standing on a rainbow path, holding a bunch of colorful balloons, green meadow with wildflowers on both sides, festive atmosphere, empty space beside the bear for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
    {
      pageNumber: 5,
      text: "조금 더 가니 토끼가 커다란 생일 케이크를 들고 조심조심 걸어가고 있었어요. '맛있는 케이크를 만들었어!'",
      sceneDescription: "생일 케이크를 들고 가는 토끼를 만나는 장면",
      illustrationPrompt:
        "a cute rabbit carefully carrying a beautiful three-tier birthday cake decorated with strawberries and candles on the rainbow path, the cake wobbling slightly, a flower-filled meadow background, empty space on the path for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cute rabbit carefully carrying a beautiful three-tier birthday cake decorated with strawberries and candles on the rainbow path, the cake wobbling slightly, a flower-filled meadow background, empty space on the path for a character" +
        STYLE_SUFFIX,
      emotion: "excited",
    },
    {
      pageNumber: 6,
      text: "다리 위에서 다람쥐들이 선물 상자를 나르다가 힘들어하고 있었어요. {childName}(이)가 도와주자 다람쥐들이 기뻐했어요!",
      sceneDescription: "다리 위에서 선물 상자를 나르는 다람쥐들을 도와주는 장면",
      illustrationPrompt:
        "a cute arched bridge over a stream, three small squirrels struggling to carry colorful wrapped gift boxes, some presents stacked precariously, the rainbow path continuing beyond the bridge, empty space on the bridge for a character" +
        STYLE_SUFFIX,
      prompt:
        "a cute arched bridge over a stream, three small squirrels struggling to carry colorful wrapped gift boxes, some presents stacked precariously, the rainbow path continuing beyond the bridge, empty space on the bridge for a character" +
        STYLE_SUFFIX,
      emotion: "helpful",
    },
    {
      pageNumber: 7,
      text: "드디어 큰 문 앞에 도착했어요! 문에 '여기를 열어보세요!'라고 적혀 있었어요. 두근두근!",
      sceneDescription: "큰 문 앞에 도착하는 긴장감 있는 장면",
      illustrationPrompt:
        "a grand magical door decorated with stars and ribbons at the end of the rainbow path, the door glowing with golden light around its edges, flower garlands framing the door, anticipation in the air, empty space in front of the door for a character" +
        STYLE_SUFFIX,
      prompt:
        "a grand magical door decorated with stars and ribbons at the end of the rainbow path, the door glowing with golden light around its edges, flower garlands framing the door, anticipation in the air, empty space in front of the door for a character" +
        STYLE_SUFFIX,
      emotion: "anticipating",
    },
    {
      pageNumber: 8,
      text: "문을 열자 동물 친구들이 한목소리로 외쳤어요. '생일 축하해!' 깜짝 파티였어요! 반짝이 가루가 팡팡!",
      sceneDescription: "문을 열면 동물 친구들이 깜짝 파티를 하는 장면",
      illustrationPrompt:
        "a magical party room bursting with confetti and streamers, animal friends (bear, rabbit, squirrels) cheering and throwing confetti, balloons everywhere, a banner reading happy birthday in decorative style, party poppers going off, empty space in the doorway for a character" +
        STYLE_SUFFIX,
      prompt:
        "a magical party room bursting with confetti and streamers, animal friends (bear, rabbit, squirrels) cheering and throwing confetti, balloons everywhere, a banner reading happy birthday in decorative style, party poppers going off, empty space in the doorway for a character" +
        STYLE_SUFFIX,
      emotion: "overjoyed",
    },
    {
      pageNumber: 9,
      text: "케이크 위에 예쁜 초가 켜졌어요. {childName}(이)가 눈을 꼭 감고 소원을 빌었어요. 후우! 초가 꺼졌어요!",
      sceneDescription: "케이크에 초를 불고 소원을 비는 장면",
      illustrationPrompt:
        "a beautiful birthday cake on a decorated table with lit candles glowing warmly, the flames about to be blown out, sparkles in the air, animal friends gathered around the table watching, magical golden glow, empty space behind the cake for a character" +
        STYLE_SUFFIX,
      prompt:
        "a beautiful birthday cake on a decorated table with lit candles glowing warmly, the flames about to be blown out, sparkles in the air, animal friends gathered around the table watching, magical golden glow, empty space behind the cake for a character" +
        STYLE_SUFFIX,
      emotion: "hopeful",
    },
    {
      pageNumber: 10,
      text: "선물 열기! 곰이 준 포근한 인형, 토끼의 편지, 다람쥐들의 도토리 목걸이… 하나하나 너무 소중했어요.",
      sceneDescription: "선물을 하나씩 열어보는 장면",
      illustrationPrompt:
        "colorful wrapped presents being unwrapped, a cozy teddy bear, a handwritten letter with a heart, an acorn necklace, wrapping paper scattered around, the bear rabbit and squirrels watching proudly, warm party room setting, empty space among the gifts for a character" +
        STYLE_SUFFIX,
      prompt:
        "colorful wrapped presents being unwrapped, a cozy teddy bear, a handwritten letter with a heart, an acorn necklace, wrapping paper scattered around, the bear rabbit and squirrels watching proudly, warm party room setting, empty space among the gifts for a character" +
        STYLE_SUFFIX,
      emotion: "grateful",
    },
    {
      pageNumber: 11,
      text: "모두 함께 노래하고 춤추었어요! 풍선이 둥둥, 음악이 랄랄라, 웃음소리가 가득했어요!",
      sceneDescription: "모두 함께 노래하고 춤추는 파티 장면",
      illustrationPrompt:
        "a lively party scene with animal friends (bear, rabbit, squirrels) dancing and singing, musical notes floating, balloons bouncing, streamers and confetti everywhere, a disco ball-like light casting colorful reflections, joyful celebration, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a lively party scene with animal friends (bear, rabbit, squirrels) dancing and singing, musical notes floating, balloons bouncing, streamers and confetti everywhere, a disco ball-like light casting colorful reflections, joyful celebration, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "ecstatic",
    },
    {
      pageNumber: 12,
      text: "파티가 끝나고 집에 돌아온 {childName}(이)의 방에 선물들이 진짜로 놓여 있었어요! '최고의 생일이었어!'",
      sceneDescription: "집에 돌아온 아이의 방에 선물들이 놓여있는 마무리 장면",
      illustrationPrompt:
        "a children's bedroom at evening with presents (teddy bear, letter, acorn necklace) placed neatly on the bed, a deflating balloon floating near the ceiling, birthday hat on the nightstand, warm night light glow, magical and cozy ending atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      prompt:
        "a children's bedroom at evening with presents (teddy bear, letter, acorn necklace) placed neatly on the bed, a deflating balloon floating near the ceiling, birthday hat on the nightstand, warm night light glow, magical and cozy ending atmosphere, empty space in the center for a character" +
        STYLE_SUFFIX,
      emotion: "happy",
    },
  ],
};
