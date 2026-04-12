import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const spaceExplorer: Scenario = {
  id: "space-explorer",
  title: "우주 탐험대",
  description: "장난감 로켓을 타고 별들 사이로 떠나는 우주 여행",
  category: "adventure",
  targetAge: "4~7세",
  pageCount: 12,
  coverPrompt: `A colorful toy rocket ship flying through a starry night sky with planets and shooting stars, cosmic dust trails, ${STYLE}`,
  educationalMessage:
    "도전정신과 문제 해결력을 기르고, 태양계에 대한 호기심을 키워요.",
  pages: [
    {
      pageNumber: 1,
      text: "잠이 오지 않는 밤, {childName}(이)는 창밖의 반짝이는 별을 바라보며 소원을 빌었어요. \"별나라에 꼭 한번 가보고 싶어!\"",
      sceneDescription:
        "밤, 아이 방 창문 너머로 별이 가득한 하늘이 보임. 창턱에 장난감 로켓이 놓여 있음.",
      illustrationPrompt: `A child's bedroom window at night showing a brilliant starry sky, a toy rocket on the windowsill, moonlight streaming in, cozy room atmosphere, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "그 순간! 창턱의 장난감 로켓이 부르르 떨리더니, 쑤욱 커지기 시작했어요. 문이 스르륵 열리며 환한 빛이 쏟아졌어요!",
      sceneDescription:
        "방 안에서 장난감 로켓이 실물 크기로 변하고 있음. 로켓 문에서 환한 빛이 나옴.",
      illustrationPrompt: `A toy rocket growing to full size in a child's backyard garden at night, door opening with warm light pouring out, magical transformation sparkles, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "로켓 안에는 귀여운 로봇 친구 삐삐가 있었어요. \"안녕! 나는 삐삐야. 우주 탐험 준비 완료! 출발할까?\"",
      sceneDescription:
        "로켓 내부 조종석, 알록달록한 버튼과 화면들. 작고 동그란 로봇이 손을 흔들고 있음.",
      illustrationPrompt: `Inside a colorful spaceship cockpit with buttons and screens, a small round friendly robot waving, stars visible through the windshield, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 4,
      text: "슈우우웅! 로켓이 하늘로 쏘아 올랐어요. 구름을 뚫고, 파란 하늘을 지나니 깜깜한 우주가 펼쳐졌어요. 지구가 동그란 구슬처럼 작아졌어요!",
      sceneDescription:
        "로켓이 대기권을 벗어나는 장면. 창밖으로 작아지는 지구와 검은 우주가 보임.",
      illustrationPrompt: `A rocket ship breaking through the atmosphere into space, Earth visible below as a small blue marble, stars and cosmic dust surrounding, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 5,
      text: "첫 번째로 도착한 곳은 무지개 행성이에요! 땅도 하늘도 온통 알록달록, 무지개 폭포가 콸콸 쏟아지고 있었어요.",
      sceneDescription:
        "무지개색 지형의 행성. 무지개 폭포가 흐르고, 알록달록한 나무와 꽃이 있음.",
      illustrationPrompt: `A rainbow-colored planet surface with a cascading rainbow waterfall, multicolored trees and flowers, prismatic light everywhere, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 6,
      text: "무지개 행성의 구름은 솜사탕이었어요! {childName}(이)가 한 입 베어 물자 달콤한 맛이 입안 가득 퍼졌어요. \"맛있다! 푹신푹신!\"",
      sceneDescription:
        "분홍, 파랑, 노랑 솜사탕 구름이 낮게 떠 있는 행성 위. 구름을 만지는 장면.",
      illustrationPrompt: `Cotton candy clouds in pink, blue, and yellow floating low on a colorful planet surface, whimsical and sweet atmosphere, candy-like landscape, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 7,
      text: "다음은 반짝이 행성! 보석처럼 빛나는 수정 나무들이 가득했어요. 땅을 걸을 때마다 딸랑딸랑 예쁜 소리가 났어요.",
      sceneDescription:
        "수정과 보석으로 이루어진 행성. 반투명한 수정 나무들이 빛을 반사하고 있음.",
      illustrationPrompt: `A crystal planet with translucent gemstone trees reflecting light, sparkling ground that seems to chime, prismatic reflections everywhere, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 8,
      text: "그런데 갑자기 로켓 안에서 삐! 삐! 경고음이 울렸어요. \"연료가 다 떨어졌어!\" 삐삐의 눈이 빨갛게 깜빡였어요.",
      sceneDescription:
        "로켓 조종석, 경고등이 빨갛게 깜빡이고 연료 게이지가 빈 상태. 로봇이 당황한 표정.",
      illustrationPrompt: `A spaceship cockpit with red warning lights flashing, fuel gauge showing empty, alarm indicators on screens, tense but not scary atmosphere, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 9,
      text: "\"걱정 마! 별빛 에너지를 모으면 돼!\" 삐삐가 작은 유리병을 내밀었어요. {childName}(이)는 우주복을 입고 로켓 밖으로 둥실 떠올랐어요.",
      sceneDescription:
        "우주 공간에 떠 있는 장면. 주변에 반짝이는 별빛 입자들이 떠다님. 유리병을 들고 있음.",
      illustrationPrompt: `A small figure in a cute spacesuit floating in space surrounded by sparkling starlight particles, holding a glass jar, stars and galaxies in the background, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 10,
      text: "{childName}(이)가 두 팔을 쭉 뻗자, 반짝반짝 별빛이 유리병 속으로 모여들었어요. 병이 환하게 빛나기 시작했어요! \"다 모았다!\"",
      sceneDescription:
        "우주 공간에서 별빛 입자들이 유리병으로 빨려 들어가는 장면. 병이 황금빛으로 빛남.",
      illustrationPrompt: `Starlight particles streaming into a glowing glass jar in space, the jar radiating golden light, cosmic background with nebula colors, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 11,
      text: "별빛 에너지를 넣자 로켓이 다시 부르릉! 힘차게 움직이기 시작했어요. \"이제 집으로 출발!\" 로켓이 반짝이는 꼬리를 남기며 날아갔어요.",
      sceneDescription:
        "로켓이 별빛 꼬리를 남기며 지구를 향해 날아가는 장면. 지구가 점점 커짐.",
      illustrationPrompt: `A rocket ship zooming through space toward Earth with a sparkling trail of starlight behind it, Earth growing larger ahead, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 12,
      text: "다시 방으로 돌아온 {childName}(이)는 별 모양 목걸이를 꼭 쥐었어요. 창밖에서 삐삐가 손을 흔들었어요. \"또 모험하자!\" 별이 반짝 윙크했어요.",
      sceneDescription:
        "아이 방, 침대 위에 별 모양 목걸이가 빛나고 있음. 창밖 밤하늘에 작은 로봇 실루엣이 손을 흔듦.",
      illustrationPrompt: `A child's cozy bedroom at night, a glowing star-shaped necklace on the pillow, through the window a small robot silhouette waves among the stars, ${STYLE}`,
      emotion: "happy",
    },
  ],
};
