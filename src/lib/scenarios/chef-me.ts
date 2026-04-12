import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const chefMe: Scenario = {
  id: "chef-me",
  title: "요리사가 된 나",
  description: "마법 앞치마를 입고 요정 주방에서 무지개 케이크를 만들어요",
  category: "dream",
  targetAge: "4~7세",
  pageCount: 10,
  coverPrompt: `A magical kitchen with floating utensils, a rainbow-layered cake in the center, sparkles and flour dust in the air, a cute chef hat and apron hanging by the entrance, ${STYLE}`,
  educationalMessage:
    "창의력과 순서를 따르는 중요성을 배우고, 음식에 대한 감사함을 키워요.",
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 엄마가 요리하는 모습을 보는 게 좋았어요. \"나도 요리하고 싶어!\" 그날 밤, 옷장에서 이상한 빛이 새어 나왔어요.",
      sceneDescription:
        "밤, 아이 방 옷장 문틈으로 따뜻한 빛이 새어 나오고 있음. 바닥에 밀가루 발자국.",
      illustrationPrompt: `A child's bedroom at night, warm light glowing from a slightly open wardrobe door, tiny flour footprints leading to the wardrobe, mysterious and inviting, ${STYLE}`,
      emotion: "curious",
    },
    {
      pageNumber: 2,
      text: "옷장 문을 열자, 반짝이는 마법 앞치마가 떠 있었어요! {childName}(이)가 앞치마를 입자, 온 세상이 빙글빙글 돌더니 어마어마하게 큰 주방이 나타났어요!",
      sceneDescription:
        "거대한 판타지 주방. 냄비가 스스로 끓고, 수저가 공중에 떠 있음. 반짝이는 앞치마.",
      illustrationPrompt: `An enormous magical kitchen with pots bubbling by themselves, utensils floating in the air, sparkly flour dust, giant mixing bowls and whimsical cooking tools, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "\"어서 와! 나는 딸기 요정 베리야!\" 딸기 모자를 쓴 작은 요정이 날아왔어요. \"오늘은 무지개 케이크를 만들 거야! 도와줄래?\"",
      sceneDescription:
        "딸기 모자를 쓴 작은 요정이 날개를 펴고 있음. 뒤에 무지개색 재료들이 보임.",
      illustrationPrompt: `A tiny fairy wearing a strawberry-shaped hat with delicate wings, flying near rainbow-colored baking ingredients lined up on a counter, magical kitchen, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 4,
      text: "\"먼저 밀가루를 체에 치자!\" {childName}(이)가 체를 흔들자, 밀가루가 눈처럼 소복소복 내렸어요. 코가 간질간질! \"에에에취!\" 밀가루 구름이 뿜 터졌어요!",
      sceneDescription:
        "밀가루를 체에 치는 장면. 밀가루가 눈처럼 날리고 있음. 재채기로 밀가루 구름이 피어남.",
      illustrationPrompt: `Flour being sifted through a sieve like snow falling, a cloud of flour dust puffing up from a sneeze, playful kitchen mess, baking ingredients around, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 5,
      text: "달걀을 톡! 깨트리고, 설탕을 솔솔, 버터를 뿅! {childName}(이)가 큰 그릇에 넣고 빙글빙글 저었어요. 반죽이 점점 부드럽고 달콤해졌어요.",
      sceneDescription:
        "큰 보울에 재료를 넣고 젓는 장면. 달걀, 설탕, 버터가 보임. 반죽이 부드러움.",
      illustrationPrompt: `A large mixing bowl with eggs, sugar, and butter being mixed together, smooth batter forming, baking supplies arranged neatly nearby, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 6,
      text: "\"자, 이제 마법의 순간이야!\" 베리가 무지개 가루를 뿌렸어요. 반죽이 빨강, 주황, 노랑, 초록, 파랑, 보라로 나뉘었어요! \"우와, 무지개다!\"",
      sceneDescription:
        "반죽이 6가지 무지개색으로 나뉘는 마법 장면. 요정이 반짝이는 가루를 뿌리고 있음.",
      illustrationPrompt: `Batter magically separating into six rainbow colors - red, orange, yellow, green, blue, purple - sparkly fairy dust being sprinkled, magical transformation, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 7,
      text: "케이크를 오븐에 넣고 기다렸어요. 뚜웅! 오븐 문이 열리자, 달콤한 냄새가 솔솔 퍼지며 무지개빛 케이크가 뽀옹 부풀어 올랐어요!",
      sceneDescription:
        "오븐에서 무지개 케이크가 부풀어 오르는 장면. 달콤한 향기를 나타내는 나선형 연기.",
      illustrationPrompt: `An oven door opening to reveal a perfectly risen rainbow-layered cake, sweet-smelling spiral steam rising, warm golden oven glow, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 8,
      text: "\"마지막은 장식이야!\" 하얀 크림을 바르고, 딸기와 블루베리를 올리고, 반짝이는 별 사탕을 톡톡 얹었어요. 세상에서 가장 예쁜 케이크가 완성되었어요!",
      sceneDescription:
        "완성된 무지개 케이크를 장식하는 장면. 크림, 과일, 별 사탕으로 장식 중.",
      illustrationPrompt: `A beautiful rainbow layer cake being decorated with white cream, strawberries, blueberries, and sparkling star candies on top, baking tools around, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 9,
      text: "요정 친구들이 모여와 케이크를 한 조각씩 먹었어요. \"세상에서 가장 맛있어!\" 모두가 눈을 감고 행복하게 웃었어요. 나눠 먹으니 더더더 맛있었어요!",
      sceneDescription:
        "여러 요정 친구들이 둘러앉아 케이크를 먹고 있음. 행복한 표정. 접시와 포크.",
      illustrationPrompt: `Fairy friends gathered around a table eating slices of rainbow cake, happy expressions, plates and tiny forks, warm festive kitchen atmosphere, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 10,
      text: "눈을 떠 보니 다시 {childName}(이)의 방이었어요. 꿈이었을까? 하지만 앞치마 주머니에서 작은 레시피 카드가 나왔어요. \"다음엔 뭘 만들어 볼까?\" {childName}(이)의 눈이 반짝반짝 빛났어요!",
      sceneDescription:
        "아침, 아이 방. 손에 작은 레시피 카드가 빛나고 있음. 앞치마가 옷장에 걸려 있음.",
      illustrationPrompt: `A child's bedroom in morning light, a small glowing recipe card being held, a magical apron hanging in the slightly open wardrobe, hopeful morning atmosphere, ${STYLE}`,
      emotion: "excited",
    },
  ],
};
