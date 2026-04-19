import type { Scenario } from "@/types";

export const spaceExplorer: Scenario = {
  id: "space-explorer",
  title: "우주 탐험대",
  description: "반짝이는 별들 사이로 떠나는 신나는 우주 여행 이야기",
  category: "science",
  educationMessage: "문제를 만나도 포기하지 않으면 해결할 수 있어요. 호기심은 새로운 세계로 이끄는 열쇠예요.",
  targetAge: "4-8세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{childName}이(가) 밤하늘을 올려다보며 소원을 빌었어요. '별나라에 가보고 싶어!'",
      sceneDescription: "아이가 밤하늘을 올려다보며 소원을 비는 장면",
      emotion: "hopeful",
    },
    {
      pageNumber: 2,
      text: "그러자 정원에 작은 우주선이 나타났어요! 문이 스르륵 열렸어요.",
      sceneDescription: "정원에 착륙한 작은 우주선의 문이 열리는 장면",
      emotion: "amazed",
    },
    {
      pageNumber: 3,
      text: "우주선 안에는 귀여운 로봇 친구 '삐삐'가 있었어요. '우주 탐험 가자!'",
      sceneDescription: "우주선 조종석에서 로봇 삐삐를 만나는 장면",
      emotion: "excited",
    },
    {
      pageNumber: 4,
      text: "슈우웅! 우주선이 하늘로 날아올랐어요. 지구가 점점 작아졌어요.",
      sceneDescription: "우주선이 이륙하며 지구가 작아지는 장면",
      emotion: "thrilled",
    },
    {
      pageNumber: 5,
      text: "첫 번째로 도착한 곳은 무지개 행성이에요. 모든 것이 알록달록했어요!",
      sceneDescription: "알록달록한 무지개 행성을 탐험하는 장면",
      emotion: "wonder",
    },
    {
      pageNumber: 6,
      text: "무지개 행성에서 구름 솜사탕을 먹었어요. 달콤하고 푹신푹신!",
      sceneDescription: "무지개 행성에서 구름 솜사탕을 먹는 장면",
      emotion: "delighted",
    },
    {
      pageNumber: 7,
      text: "다음은 반짝이 행성! 보석처럼 빛나는 돌들이 가득했어요.",
      sceneDescription: "보석으로 가득한 반짝이 행성에 서 있는 장면",
      emotion: "awe",
    },
    {
      pageNumber: 8,
      text: "그런데 갑자기 우주선에 경고등이 켜졌어요! 연료가 부족해!",
      sceneDescription: "우주선 경고등이 켜진 긴박한 장면",
      emotion: "worried",
    },
    {
      pageNumber: 9,
      text: "'걱정 마! 별빛 에너지를 모으면 돼!' 삐삐가 말했어요.",
      sceneDescription: "삐삐가 별빛 에너지 해결책을 알려주는 장면",
      emotion: "hopeful",
    },
    {
      pageNumber: 10,
      text: "{childName}이(가) 우주선 밖으로 나가 별빛을 모았어요. 반짝반짝 빛이 모여들었어요!",
      sceneDescription: "우주복을 입고 별빛을 모으는 용감한 장면",
      emotion: "brave",
    },
    {
      pageNumber: 11,
      text: "별빛 에너지로 우주선이 다시 움직이기 시작했어요! 이제 집으로!",
      sceneDescription: "별빛 에너지로 우주선이 되살아나 지구로 향하는 장면",
      emotion: "relieved",
    },
    {
      pageNumber: 12,
      text: "집에 돌아온 {childName}이(가) 별 모양 목걸이를 꼭 쥐었어요. '또 모험하자, 삐삐!'",
      sceneDescription: "침대에서 별 목걸이를 쥐고 삐삐와 작별하는 마무리 장면",
      emotion: "content",
    },
  ],
};
