import type { Scenario } from "@/types";

export const cookingMagic: Scenario = {
  id: "cooking-magic",
  title: "요리 마법사",
  description: "마법의 주방에서 펼쳐지는 맛있는 요리 대모험",
  category: "daily-life",
  educationMessage: "정성을 담으면 무엇이든 특별해져요. 실수해도 괜찮아요, 다시 도전하면 돼요.",
  targetAge: "3-7세",
  pageCount: 12,
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 생일인 할머니를 위해 특별한 케이크를 만들고 싶었어요. 하지만 요리를 한 번도 해본 적이 없었지요.",
      sceneDescription: "주방에서 레시피 책을 펼치며 고민하는 장면",
      emotion: "worried",
    },
    {
      pageNumber: 2,
      text: "그때 요리책에서 빛이 번쩍! 작은 밀가루 요정 '뿌리'가 튀어나왔어요. '내가 도와줄게! 마법의 주방으로 가자!'",
      sceneDescription: "요리책에서 밀가루 요정이 튀어나오는 장면",
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "눈 깜짝할 사이에 거대한 마법 주방에 도착했어요! 냄비들이 스스로 춤추고, 숟가락이 노래했어요.",
      sceneDescription: "살아 움직이는 마법 주방의 화려한 장면",
      emotion: "amazed",
    },
    {
      pageNumber: 4,
      text: "'먼저 밀가루를 체에 쳐야 해!' 뿌리가 말했어요. {childName}(이)가 체를 흔들자 밀가루가 눈처럼 내렸어요.",
      sceneDescription: "밀가루를 체에 치며 눈처럼 날리는 장면",
      emotion: "focused",
    },
    {
      pageNumber: 5,
      text: "달걀을 깨다가 그만 바닥에 떨어뜨렸어요! '괜찮아, 다시 하면 돼!' 뿌리가 응원해줬어요.",
      sceneDescription: "달걀을 실수로 깨뜨리고 당황하는 장면",
      emotion: "embarrassed",
    },
    {
      pageNumber: 6,
      text: "두 번째는 성공! 반죽을 열심히 섞자 보글보글 거품이 일며 무지개 빛이 났어요.",
      sceneDescription: "반죽을 섞자 무지개 빛이 나는 마법적인 장면",
      emotion: "excited",
    },
    {
      pageNumber: 7,
      text: "오븐에 넣고 기다리는 동안, 마법 주방의 과일 친구들이 데코레이션을 도와주겠다고 했어요!",
      sceneDescription: "과일 캐릭터들이 데코레이션 재료를 준비하는 장면",
      emotion: "anticipating",
    },
    {
      pageNumber: 8,
      text: "딩동! 케이크가 구워졌어요! 오븐에서 나온 케이크는 부풀어올라 구름처럼 폭신했어요.",
      sceneDescription: "오븐에서 완벽하게 구워진 케이크를 꺼내는 장면",
      emotion: "proud",
    },
    {
      pageNumber: 9,
      text: "{childName}(이)가 정성껏 크림을 바르고, 딸기를 올리고, 초콜릿으로 '할머니 사랑해요'라고 썼어요.",
      sceneDescription: "케이크를 정성껏 꾸미는 집중하는 장면",
      emotion: "loving",
    },
    {
      pageNumber: 10,
      text: "뿌리가 마지막으로 마법가루를 뿌려주었어요. 반짝반짝! 세상에서 가장 예쁜 케이크가 완성됐어요!",
      sceneDescription: "마법가루로 완성된 반짝이는 케이크 장면",
      emotion: "thrilled",
    },
    {
      pageNumber: 11,
      text: "할머니 앞에 케이크를 내놓자 할머니의 눈에 눈물이 글썽였어요. '세상에서 제일 맛있는 케이크야!'",
      sceneDescription: "할머니가 케이크를 보고 감동하는 따뜻한 장면",
      emotion: "touched",
    },
    {
      pageNumber: 12,
      text: "할머니와 케이크를 나눠먹으며 {childName}(이)는 생각했어요. 사랑을 담으면 뭐든 마법이 되는구나! 주머니에서 뿌리의 편지가 살짝 빛났어요.",
      sceneDescription: "할머니와 함께 케이크를 먹으며 행복한 마무리 장면",
      emotion: "happy",
    },
  ],
};
