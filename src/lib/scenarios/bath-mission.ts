import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const bathMission: Scenario = {
  id: "bath-mission",
  title: "목욕 대작전",
  description: "욕조가 바다로 변해 거품 배를 타고 보물섬을 탐험해요",
  category: "habit",
  targetAge: "3~5세",
  pageCount: 10,
  coverPrompt: `A bathtub overflowing with magical foam bubbles transforming into ocean waves, rubber ducks sailing on tiny boats, a treasure map floating on the water, ${STYLE}`,
  educationalMessage:
    "목욕이 즐거운 모험이 될 수 있다는 걸 알고, 씻기 습관을 기뻐하며 익혀요.",
  pages: [
    {
      pageNumber: 1,
      text: "\"목욕 싫어!\" {childName}(이)가 욕실 문 앞에서 고개를 절레절레 흔들었어요. 그때 욕조 안에서 보글보글 이상한 소리가 들려왔어요.",
      sceneDescription:
        "욕실 문 앞, 욕조에서 비정상적으로 큰 거품이 올라오고 있음. 거품 사이로 빛이 보임.",
      illustrationPrompt: `A bathroom doorway view, a bathtub with unusually large magical bubbles rising from it, light glowing through the foam, steam swirling mysteriously, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "살금살금 다가가 보니, 욕조 물이 파란 바다로 변하고 있었어요! 뽀글뽀글 거품이 솟아오르며 작은 배 한 척이 떠올랐어요.",
      sceneDescription:
        "욕조 물이 넓은 바다로 변하는 판타지 장면. 거품으로 만들어진 작은 배가 떠 있음.",
      illustrationPrompt: `A bathtub transforming into a vast ocean, foam bubbles forming into a small sailboat, the bathroom tiles fading into a horizon line, magical transition scene, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "\"어서 타! 보물섬으로 출발이야!\" 노란 오리 선장이 외쳤어요. {childName}(이)는 풍덩! 거품 배에 올라탔어요.",
      sceneDescription:
        "거품으로 만들어진 배 위에 노란 고무 오리가 선장 모자를 쓰고 서 있음. 파란 바다.",
      illustrationPrompt: `A foam bubble ship on a blue ocean, a yellow rubber duck wearing a captain's hat standing at the bow, sparkling ocean spray, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 4,
      text: "바다 위를 둥실둥실 떠가자, 물속에서 무지개빛 물고기들이 첨벙첨벙 뛰어올랐어요. \"안녕! 우리랑 같이 놀자!\"",
      sceneDescription:
        "맑은 바다 위 거품 배. 무지개색 열대 물고기들이 물 위로 뛰어오르고 있음.",
      illustrationPrompt: `A foam ship sailing on clear blue water, rainbow-colored tropical fish jumping out of the water around the boat, sparkling ocean, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 5,
      text: "그런데 갑자기 끈적끈적한 해초가 배를 감싸기 시작했어요! \"으앙, 끈적거려!\" 바로 때 괴물의 덫이었어요!",
      sceneDescription:
        "끈적끈적한 갈색 해초가 배를 감싸고 있음. 해초에 '때'라고 적힌 물방울이 붙어 있음.",
      illustrationPrompt: `Sticky brown seaweed wrapping around a foam ship, grimy bubbles attached to the seaweed, murky water around the seaweed area, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 6,
      text: "\"비누 대포 발사!\" 오리 선장이 외쳤어요. {childName}(이)가 비누를 뽀득뽀득 문지르자, 하얀 거품이 뿜뿜 나왔어요!",
      sceneDescription:
        "배 위에서 비누를 문지르며 거품 대포를 발사하는 장면. 하얀 거품이 해초를 녹임.",
      illustrationPrompt: `White foam cannons shooting from a ship, soap bubbles dissolving brown sticky seaweed, sparkling clean water spreading outward, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 7,
      text: "거품이 닿자 끈적끈적한 해초가 스르르 녹았어요! 바다가 다시 반짝반짝 깨끗해졌어요. \"우와, 비누는 마법이야!\"",
      sceneDescription:
        "해초가 사라지고 깨끗해진 푸른 바다. 비눗방울이 하늘로 둥실둥실 올라감.",
      illustrationPrompt: `Clean sparkling blue ocean after the seaweed dissolved, soap bubbles floating up into the sky, bright sunshine on clear water, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 8,
      text: "드디어 반짝이는 보물섬에 도착했어요! 야자수 아래 반짝이는 보물 상자가 놓여 있었어요. {childName}(이)가 조심조심 열어 보니…",
      sceneDescription:
        "작은 열대 섬, 야자수, 하얀 모래사장. 반짝이는 보물 상자가 모래 위에 놓여 있음.",
      illustrationPrompt: `A small tropical island with palm trees and white sand beach, a sparkling treasure chest sitting on the sand, clear turquoise water surrounding, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 9,
      text: "보물 상자 안에는 별 모양 비누, 무지개 수건, 그리고 왕관이 들어 있었어요! \"목욕을 사랑하는 용감한 {childName}에게!\" 라고 쓰여 있었어요.",
      sceneDescription:
        "보물 상자에서 빛이 나며, 별 모양 비누, 무지개색 수건, 작은 왕관이 보임. 편지가 함께 있음.",
      illustrationPrompt: `An open treasure chest glowing with light, revealing a star-shaped soap, a rainbow towel, and a small crown, a note card visible inside, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 10,
      text: "눈을 깜빡이니 다시 욕조 안이었어요. {childName}(이)는 뽀득뽀득 온몸을 문지르며 노래를 불렀어요. \"목욕은 보물찾기야! 내일도 모험하자!\"",
      sceneDescription:
        "밝은 욕실, 거품 가득한 욕조. 장난감 오리가 떠 있고, 아이가 즐겁게 목욕하는 분위기.",
      illustrationPrompt: `A bright bathroom with a bubble-filled bathtub, a rubber duck floating, cheerful atmosphere with soap bubbles floating in the air, warm bathroom lighting, ${STYLE}`,
      emotion: "happy",
    },
  ],
};
