import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const firstDaySchool: Scenario = {
  id: "first-day-school",
  title: "첫 등원 날",
  description: "유치원 첫 날, 새 친구를 만나며 용기를 찾는 이야기",
  category: "emotion",
  targetAge: "4~6세",
  pageCount: 12,
  coverPrompt: `A colorful kindergarten building entrance with a rainbow archway, small backpacks lined up by the door, flower pots and a welcome sign, ${STYLE}`,
  educationalMessage:
    "새로운 환경에 대한 불안을 극복하고, 친구를 사귀는 기쁨을 배워요.",
  pages: [
    {
      pageNumber: 1,
      text: "오늘은 유치원에 가는 첫 날이에요. {childName}(이)는 새 가방을 메고 현관 앞에 섰지만, 발이 꼼짝도 하지 않았어요. \"엄마랑 떨어지기 싫어…\"",
      sceneDescription:
        "집 현관, 새 가방을 메고 있지만 불안한 표정. 엄마 손을 꼭 잡고 있음.",
      illustrationPrompt: `A house entrance doorway with a small colorful backpack sitting by the door, morning light, a pair of small shoes ready to go, slightly anxious atmosphere, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 2,
      text: "유치원에 도착했어요. 알록달록 예쁜 건물이었지만, {childName}(이)의 마음속에는 비가 내리는 것 같았어요. 다른 아이들은 벌써 깔깔깔 웃고 있었어요.",
      sceneDescription:
        "알록달록한 유치원 건물 앞. 다른 아이들이 놀고 있음. 입구에 혼자 서 있는 느낌.",
      illustrationPrompt: `A colorful kindergarten building with a playground, children playing happily in the background, the entrance area looking inviting but overwhelming, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 3,
      text: "교실에 들어서자 선생님이 다정하게 웃었어요. \"어서 와! {childName}(이)의 자리는 여기야.\" 책상 위에 예쁜 이름표가 놓여 있었어요.",
      sceneDescription:
        "밝은 교실, 작은 책상과 의자들. 책상 위에 이름표와 색연필 세트가 놓여 있음.",
      illustrationPrompt: `A bright kindergarten classroom with small desks and chairs, a name tag and colored pencils on one desk, artwork on the walls, warm welcoming atmosphere, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 4,
      text: "옆자리에 앉은 아이가 작은 목소리로 말했어요. \"나도 오늘 처음이야… 나 하늘이. 너도 떨려?\" {childName}(이)가 고개를 끄덕끄덕했어요.",
      sceneDescription:
        "두 개의 나란한 작은 책상. 옆자리 아이가 수줍게 말을 거는 장면.",
      illustrationPrompt: `Two small desks side by side in a classroom, a shy child at the neighboring desk reaching out tentatively, soft classroom lighting, ${STYLE}`,
      emotion: "relieved",
    },
    {
      pageNumber: 5,
      text: "\"자, 모두 동그랗게 모여 앉아 볼까?\" 선생님이 큰 그림책을 펼쳤어요. {childName}(이)와 하늘이는 나란히 앉아 이야기를 들었어요.",
      sceneDescription:
        "교실 바닥에 동그랗게 앉은 아이들. 선생님이 큰 그림책을 펼치고 있음.",
      illustrationPrompt: `Children sitting in a circle on a colorful carpet in a classroom, a teacher holding open a large picture book, attentive and cozy story time, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 6,
      text: "미술 시간이 되었어요! {childName}(이)가 파란색으로 하늘을 칠하자, 하늘이가 눈을 동그랗게 떴어요. \"우와, 진짜 예쁘다! 나도 그렇게 칠하고 싶어!\"",
      sceneDescription:
        "미술 시간, 도화지에 그림을 그리고 있음. 물감과 크레파스가 놓여 있음.",
      illustrationPrompt: `Art supplies spread on a small table - paint pots, crayons, and drawing paper with a blue sky painting, colorful and creative classroom setting, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 7,
      text: "점심시간! {childName}(이)와 하늘이는 나란히 앉아 도시락을 먹었어요. \"내 계란말이 먹어 볼래?\" \"고마워! 나도 딸기 줄게!\" 나눠 먹으니 더 맛있었어요.",
      sceneDescription:
        "식탁에 나란히 앉아 도시락을 먹는 장면. 서로 반찬을 나누고 있음.",
      illustrationPrompt: `Two lunch boxes open on a small table, food being shared between them, a cozy cafeteria with children eating together, warm lunchtime atmosphere, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 8,
      text: "놀이 시간! 운동장에서 모래성을 쌓았어요. 다른 친구들도 하나둘 모여들었어요. \"나도 같이 해도 돼?\" \"그럼! 같이 만들자!\"",
      sceneDescription:
        "모래놀이터에서 모래성을 쌓는 아이들. 양동이, 삽 등 모래놀이 도구.",
      illustrationPrompt: `A sandbox in a kindergarten playground with sandcastle building tools, buckets and shovels, multiple small sand structures, sunny outdoor setting, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 9,
      text: "다 함께 힘을 합쳐 커다란 모래성을 완성했어요! 꼭대기에 나뭇잎 깃발을 꽂았어요. \"우리가 해냈다!\" 모두 손뼉을 짝짝짝 쳤어요.",
      sceneDescription:
        "완성된 커다란 모래성에 나뭇잎 깃발이 꽂혀 있음. 아이들이 주변에서 기뻐하고 있음.",
      illustrationPrompt: `A large finished sandcastle with a leaf flag on top, small handprints around it, children's shadows celebrating nearby, sunny playground, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 10,
      text: "하원 시간, 엄마가 문 앞에서 손을 흔들었어요. \"오늘 어땠어?\" {childName}(이)가 활짝 웃으며 달려갔어요. \"재밌었어! 친구 생겼어!\"",
      sceneDescription:
        "유치원 현관, 엄마가 손을 흔들고 있음. 아이가 뛰어가는 모습. 밝은 오후 햇살.",
      illustrationPrompt: `A kindergarten entrance in afternoon sunlight, a parent waving at the gate, a small backpack bouncing as someone runs toward the gate, warm golden light, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 11,
      text: "집에 돌아온 {childName}(이)는 오늘 그린 그림을 냉장고에 붙였어요. 그림 속에는 {childName}(이)와 하늘이가 손을 잡고 웃고 있었어요.",
      sceneDescription:
        "냉장고에 그림이 붙어 있음. 그림 속에 두 아이가 손을 잡고 있음. 따뜻한 집 분위기.",
      illustrationPrompt: `A refrigerator door with a child's drawing pinned by magnets, the drawing showing two stick figures holding hands under a sun, cozy kitchen background, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 12,
      text: "잠자리에 누운 {childName}(이)는 내일이 기다려졌어요. \"내일은 하늘이랑 뭐 하고 놀지?\" 살짝 웃으며 눈을 감았어요. 첫 등원 날은 정말 멋진 하루였어요!",
      sceneDescription:
        "밤, 침대에 누운 모습. 가방이 문 옆에 준비되어 있음. 달빛이 들어옴. 미소 짓는 분위기.",
      illustrationPrompt: `A child's bedroom at night, a backpack ready by the door for tomorrow, moonlight through the window, a peaceful and content sleeping atmosphere, ${STYLE}`,
      emotion: "happy",
    },
  ],
};
