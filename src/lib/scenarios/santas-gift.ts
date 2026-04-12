import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const santasGift: Scenario = {
  id: "santas-gift",
  title: "산타의 특별한 선물",
  description: "크리스마스 이브에 산타 할아버지의 선물 배달을 도와요",
  category: "celebration",
  targetAge: "3~6세",
  pageCount: 12,
  coverPrompt: `A magical Christmas Eve scene with Santa's sleigh silhouette against a full moon, snow-covered rooftops below, presents and candy canes in the foreground, ${STYLE}`,
  educationalMessage:
    "나눔의 기쁨과 다른 사람을 배려하는 마음, 크리스마스의 진정한 의미를 배워요.",
  pages: [
    {
      pageNumber: 1,
      text: "크리스마스 이브 밤, {childName}(이)는 창밖을 바라보았어요. 하얀 눈이 소복소복 내리고, 밤하늘에 커다란 별이 반짝이고 있었어요. \"산타 할아버지가 오실까?\"",
      sceneDescription:
        "밤, 창문 너머로 눈 내리는 마을이 보임. 하늘에 큰 별이 빛남. 창문에 크리스마스 장식.",
      illustrationPrompt: `A window view of a snowy village at night, a bright star in the sky, Christmas decorations on the windowsill, snowflakes falling gently, cozy indoor warmth, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "그때 지붕 위에서 딸랑딸랑! 방울 소리가 들렸어요. {childName}(이)가 살금살금 지붕으로 올라가 보니… 진짜 산타 할아버지가 계셨어요!",
      sceneDescription:
        "눈 덮인 지붕 위, 빨간 옷의 산타와 썰매가 있음. 루돌프 사슴이 옆에 서 있음.",
      illustrationPrompt: `A snow-covered rooftop with Santa's red sleigh parked on it, reindeer standing nearby, chimney with warm light, starry Christmas night sky, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "\"호호호! {childName}(아), 딱 맞게 왔구나!\" 산타 할아버지가 걱정스러운 얼굴로 말했어요. \"루돌프가 감기에 걸려서 오늘 선물을 다 배달할 수가 없단다.\"",
      sceneDescription:
        "산타 옆에 콧물을 흘리며 기운 없는 루돌프. 선물 자루가 아직 가득 찬 상태.",
      illustrationPrompt: `Santa looking worried beside a sleigh full of presents, a reindeer with a red scarf and runny nose looking sick, snowy rooftop scene, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 4,
      text: "\"내가 도와줄게요!\" {childName}(이)가 외쳤어요. 산타 할아버지가 환하게 웃으며 작은 빨간 망토와 요술 주머니를 건네주었어요. 주머니에서 선물이 끝없이 나왔어요!",
      sceneDescription:
        "작은 빨간 망토를 입히는 산타. 요술 주머니에서 선물이 삐죽 나오고 있음.",
      illustrationPrompt: `A small red cape being offered, a magical pouch with presents peeking out of it endlessly, Santa smiling warmly, snowy night backdrop, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 5,
      text: "산타 썰매에 올라타니 나머지 사슴들이 힘차게 달리기 시작했어요! \"자, 출발!\" 썰매가 별빛 사이로 슈우웅 날아올랐어요.",
      sceneDescription:
        "썰매가 밤하늘로 날아오르는 장면. 아래로 눈 덮인 마을이 작아지고 있음.",
      illustrationPrompt: `Santa's sleigh flying into the starry night sky pulled by reindeer, a snow-covered village growing small below, shooting stars around, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 6,
      text: "첫 번째 집! 굴뚝으로 스르르 내려가 크리스마스트리 아래에 선물을 놓았어요. 벽에는 아이가 그린 산타 그림이 붙어 있었어요. {childName}(이)의 마음이 따뜻해졌어요.",
      sceneDescription:
        "벽난로가 있는 거실, 크리스마스트리 아래에 선물을 놓는 장면. 벽에 아이 그림.",
      illustrationPrompt: `A cozy living room with a decorated Christmas tree, presents being placed underneath, a child's drawing of Santa pinned on the wall, fireplace glowing, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 7,
      text: "다음 집에는 쿠키와 우유가 놓여 있었어요! \"산타 할아버지 고마워요\" 라고 쓰인 편지도 함께요. {childName}(이)가 쿠키를 한 입 베어 물었어요. 바삭바삭 달콤!",
      sceneDescription:
        "테이블 위 쿠키와 우유, 작은 편지. 크리스마스 장식이 보이는 따뜻한 집.",
      illustrationPrompt: `A table with cookies on a plate and a glass of milk, a handwritten note beside them, Christmas stockings hanging nearby, warm lamplight, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 8,
      text: "어떤 집에는 선물을 못 받는 아이가 창가에서 하늘을 바라보고 있었어요. {childName}(이)는 요술 주머니에서 가장 예쁜 선물을 꺼내 창문 아래에 살짝 놓았어요.",
      sceneDescription:
        "작은 집 창문, 안에서 아이 실루엣이 하늘을 바라보고 있음. 창문 아래에 선물.",
      illustrationPrompt: `A small house window with a child's silhouette looking up at the sky from inside, a beautifully wrapped present placed on the windowsill outside, snowy night, ${STYLE}`,
      emotion: "grateful",
    },
    {
      pageNumber: 9,
      text: "그 아이가 선물을 발견하고 두 눈이 반짝 빛났어요! \"산타 할아버지가 오셨어!\" 아이의 웃는 얼굴을 보니, {childName}(이)의 가슴이 뭉클했어요.",
      sceneDescription:
        "창문 안에서 선물을 발견한 아이가 환하게 웃고 있음. 창밖에서 바라보는 시점.",
      illustrationPrompt: `A view through a window of a child discovering a present with pure joy, eyes sparkling, warm indoor light contrasting with snowy outdoor darkness, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 10,
      text: "모든 선물을 배달하고 돌아오니, 산타 할아버지가 두 팔 벌려 맞아 주었어요. \"정말 고마워! 네 덕분에 모든 아이들이 행복한 크리스마스를 보내겠구나!\"",
      sceneDescription:
        "지붕 위, 산타가 팔을 벌려 맞이하고 있음. 루돌프가 약간 회복된 모습.",
      illustrationPrompt: `Santa with open arms on a snowy rooftop, a reindeer looking better with its scarf, empty sleigh behind them, dawn light beginning on the horizon, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 11,
      text: "산타 할아버지가 특별한 선물 하나를 건네주었어요. \"이건 세상에서 가장 특별한 선물이야. 남을 도울 때 네 마음에 켜지는 따뜻한 빛이란다.\"",
      sceneDescription:
        "산타가 작은 빛나는 별 모양 선물을 건네주는 장면. 선물이 가슴 쪽에서 따뜻하게 빛남.",
      illustrationPrompt: `Santa handing over a small star-shaped gift that glows warmly, golden light emanating from it, snowy rooftop at dawn, magical and heartfelt moment, ${STYLE}`,
      emotion: "grateful",
    },
    {
      pageNumber: 12,
      text: "다음 날 아침, {childName}(이)는 크리스마스트리 아래에서 눈을 떴어요. 꿈이었을까? 하지만 가슴속이 따뜻하고, 손에는 작은 별 장식이 꼭 쥐어져 있었어요. 메리 크리스마스!",
      sceneDescription:
        "크리스마스 아침, 트리 아래에서 눈을 뜨는 장면. 손에 별 장식이 빛나고 있음.",
      illustrationPrompt: `Christmas morning, a decorated tree with presents underneath, morning light streaming in, a small glowing star ornament held in a tiny hand, cozy and magical, ${STYLE}`,
      emotion: "happy",
    },
  ],
};
