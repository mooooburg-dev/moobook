import type { Scenario } from "@/types";

const STYLE =
  "warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere";

export const brushingHero: Scenario = {
  id: "brushing-hero",
  title: "양치 히어로",
  description: "칫솔 검을 들고 충치 몬스터를 물리치는 이야기",
  category: "habit",
  targetAge: "3~5세",
  pageCount: 10,
  coverPrompt: `A sparkling clean bathroom with a magical glowing toothbrush standing upright like a sword, toothpaste sparkles around it, a tiny defeated cartoon germ running away, ${STYLE}`,
  educationalMessage:
    "양치 습관의 중요성을 재미있게 배우고, 스스로 이를 닦는 자신감을 키워요.",
  pages: [
    {
      pageNumber: 1,
      text: "{childName}(이)는 양치가 정말 싫었어요. \"이 안 닦으면 안 돼요?\" 거울 속 {childName}(이)가 입을 꾹 다물었어요.",
      sceneDescription:
        "밝은 욕실, 세면대 앞 거울. 칫솔과 치약이 놓여 있음. 아이가 입을 다물고 있는 분위기.",
      illustrationPrompt: `A bright cheerful bathroom with a sink, mirror, toothbrush and toothpaste on the counter, morning light through a small window, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 2,
      text: "그때 거울이 번쩍! 하고 빛나더니, {childName}(이)는 스르르 빨려 들어갔어요. 눈을 떠 보니… 여기가 어디지? 온통 하얗고 반들반들한 세계였어요!",
      sceneDescription:
        "거대한 하얀 치아들이 건물처럼 서 있는 미니어처 세계. 반짝이는 흰색 바닥.",
      illustrationPrompt: `A miniature world where giant white teeth stand like buildings, glossy white floor reflecting light, a tiny magical cityscape made of teeth, ${STYLE}`,
      emotion: "surprised",
    },
    {
      pageNumber: 3,
      text: "\"여긴 이 속 마을이야!\" 작은 요정 치카가 날아왔어요. \"큰일이야! 충치 몬스터들이 마을을 공격하고 있어!\" 저 멀리서 끈적끈적한 보라색 세균들이 우글우글 몰려오고 있었어요.",
      sceneDescription:
        "치아 마을 위를 날아다니는 작은 날개 달린 요정. 멀리서 보라색 세균 무리가 다가옴.",
      illustrationPrompt: `A tiny fairy with wings flying above a white tooth village, in the distance a crowd of purple cartoon germs approaching, ominous but cute, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 4,
      text: "치카가 반짝이는 칫솔을 건네주었어요. \"이건 마법의 칫솔 검이야! {childName}(이)만 이 마을을 구할 수 있어!\" 칫솔이 무지개빛으로 빛났어요.",
      sceneDescription:
        "빛나는 칫솔이 검처럼 서 있음. 무지개빛 아우라가 감싸고 있음. 요정이 옆에서 가리키고 있음.",
      illustrationPrompt: `A magical glowing toothbrush standing upright like a sword with rainbow aura surrounding it, sparkles and light rays, a small fairy pointing at it, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 5,
      text: "\"쓱싹쓱싹!\" {childName}(이)가 칫솔 검을 휘두르자, 끈적끈적한 세균들이 퐁퐁 터지며 사라졌어요! \"우와, 나 잘하는 거 아니야?\"",
      sceneDescription:
        "칫솔에서 거품 광선이 나가 세균들을 물리치는 장면. 세균들이 터지며 비눗방울이 됨.",
      illustrationPrompt: `Foam and bubble beams shooting from a magical toothbrush, cartoon purple germs popping into soap bubbles, dynamic action scene, ${STYLE}`,
      emotion: "excited",
    },
    {
      pageNumber: 6,
      text: "하지만 충치 대왕이 나타났어요! 까만 몸에 끈적끈적한 사탕 갑옷을 입고 있었어요. \"하하하! 이를 안 닦는 아이들 덕분에 나는 점점 강해진다!\"",
      sceneDescription:
        "커다란 충치 대왕 캐릭터. 까만색 몸에 사탕, 초콜릿으로 만든 갑옷. 위협적이지만 만화 같은 모습.",
      illustrationPrompt: `A large cartoon cavity monster boss with a dark body wearing armor made of candy and chocolate, menacing but cute and not scary, ${STYLE}`,
      emotion: "scared",
    },
    {
      pageNumber: 7,
      text: "\"겁먹지 마! 위는 쓱싹, 아래도 쓱싹, 혀도 쓱싹!\" 치카가 외쳤어요. {childName}(이)는 칫솔 검을 위아래로 정성껏 움직였어요.",
      sceneDescription:
        "칫솔로 위, 아래, 혀 순서로 닦는 동작을 보여주는 장면. 요정이 옆에서 응원함.",
      illustrationPrompt: `A sequence showing brushing motions - up, down, and tongue - with sparkle trails, a fairy cheering alongside, magical foam bubbles floating, ${STYLE}`,
      emotion: "determined",
    },
    {
      pageNumber: 8,
      text: "뽀글뽀글! 마법의 거품이 충치 대왕을 감쌌어요. \"으악! 깨끗해지잖아!\" 충치 대왕이 점점 작아지더니 펑! 사라졌어요.",
      sceneDescription:
        "거대한 거품이 충치 대왕을 감싸며 녹이는 장면. 반짝이는 거품, 충치 대왕이 줄어듦.",
      illustrationPrompt: `Giant sparkling foam bubbles surrounding and shrinking the cavity monster, the monster dissolving with a pop, victory sparkles everywhere, ${STYLE}`,
      emotion: "proud",
    },
    {
      pageNumber: 9,
      text: "\"만세!\" 치아 마을이 다시 반짝반짝 빛나기 시작했어요. 하얀 치아 친구들이 환하게 웃으며 {childName}(이)에게 고마워했어요.",
      sceneDescription:
        "깨끗해진 치아 마을. 하얀 치아 캐릭터들이 웃고 있음. 반짝이는 깨끗한 분위기.",
      illustrationPrompt: `A sparkling clean tooth village with happy smiling tooth characters celebrating, confetti and sparkles, bright and joyful atmosphere, ${STYLE}`,
      emotion: "happy",
    },
    {
      pageNumber: 10,
      text: "다시 욕실로 돌아온 {childName}(이)는 거울을 보며 활짝 웃었어요. \"양치는 재밌는 모험이야!\" 오늘부터 {childName}(이)는 양치 히어로가 되었어요!",
      sceneDescription:
        "밝은 욕실, 거울 속 환하게 웃는 모습. 칫솔을 들고 자신감 넘치는 포즈. 치약 거품이 살짝 묻어 있음.",
      illustrationPrompt: `A bright bathroom with a mirror reflecting a big smile, a toothbrush held up triumphantly, a tiny bit of toothpaste foam on the corner of a smile, morning sunshine, ${STYLE}`,
      emotion: "proud",
    },
  ],
};
