import type { ChildGender, ScenarioPage, ThemeId } from "@/types";

type PresetScenarioId = Exclude<ThemeId, "custom">;

const CHARACTER_APPEARANCE: Record<ChildGender, string> = {
  boy: "a cute 5-year-old Korean boy with short brown hair, round big eyes, rosy cheeks, wearing a light blue fluffy hooded jacket, brown pants, and brown shoes",
  girl: "a cute 5-year-old Korean girl with shoulder-length brown hair tied with a small pink hair pin, round big eyes, rosy cheeks, wearing a soft pink coat, a floral pattern skirt, and white shoes",
};

const STYLE_RULES =
  "Art style: warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, consistent art style across every page, no text, no words, no letters, no captions, portrait orientation with a 3:4 aspect ratio (768x1024).";

const COMPOSITION_RULES =
  "Composition: wide establishing shot showing the full scene with rich environmental detail. The child character is small within the frame (around 25-35% of the image height), fully visible from head to toe, never cropped. The background, environment, and supporting characters take up most of the frame. Never use close-up, portrait, or bust shots — always show the entire scene with the child as part of it.";

const PAGE_ACTIONS: Record<PresetScenarioId, Record<number, string>> = {
  "forest-adventure": {
    1: "The child stands at a sunlit forest entrance with wide excited eyes, one foot stepping forward, warm morning light pouring through green leaves.",
    2: "The child crouches down curiously on the forest path, eyes gleaming as a small rabbit hops up to greet them.",
    3: "The child walks hand in paw with the rabbit along a trail of glowing blue, purple and pink mushrooms, gazing around in wonder.",
    4: "The child tilts their head back in awe beneath a massive ancient oak tree, looking up at a wise owl perched on a high branch.",
    5: "The child leans forward with intrigued eyes as the owl, bathed in mysterious moonlit glow, speaks of a hidden treasure.",
    6: "The child stands tall with a determined smile, hands outstretched to receive a sparkling old treasure map from the owl.",
    7: "The child stands at the edge of a babbling stream with a worried expression, gripping the map as the rabbit fidgets beside them.",
    8: "The child rides happily on a large turtle's back alongside the rabbit, splashing across the sparkling stream with a thrilled grin.",
    9: "The child twirls joyfully through a vast colorful flower field as rainbow butterflies circle around their head.",
    10: "The child kneels in the center of the flower field with wide thrilled eyes and open mouth, reaching toward a glittering small treasure box.",
    11: "The child kneels gently holding an open treasure box, gazing down with touched, shining eyes at a star-bright necklace and a little letter inside.",
    12: "The child walks home along a sunset forest path with a peaceful happy smile, surrounded by the rabbit, owl, and turtle friends.",
  },
  "space-explorer": {
    1: "The child stands in a backyard at night with hands clasped together hopefully, looking up at a sky full of sparkling stars.",
    2: "The child stands in the garden with amazed wide eyes and mouth agape as a small spaceship's door slides open before them.",
    3: "The child climbs excitedly into the spaceship cockpit, smiling at a round cute robot waving hello from the pilot seat.",
    4: "The child grips the spaceship controls with a thrilled grin as Earth shrinks below through the cockpit window and stars streak past.",
    5: "The child walks across a vivid rainbow-colored planet surface with arms spread wide in wonder, gazing at swirling colorful landscapes.",
    6: "The child giggles with delighted eyes while biting into a fluffy pink cloud of candy cotton on the rainbow planet.",
    7: "The child stands on a glittering planet surrounded by sparkling jewel-like stones, hands held near their face in awe.",
    8: "The child grips the spaceship console with a worried, tense expression as red warning lights flash around the cockpit.",
    9: "The child leans toward the robot companion with hopeful, attentive eyes as the robot points upward at twinkling stars outside.",
    10: "The child floats bravely in a spacesuit outside the ship, cupping their hands together to gather glowing streams of starlight.",
    11: "The child pilots the spaceship with a relieved, happy smile as glowing energy surges through the cockpit and Earth appears ahead.",
    12: "The child sits up in bed content and smiling, clutching a shining star-shaped necklace to their chest as the robot waves goodbye.",
  },
  "ocean-friends": {
    1: "The child crouches on a sunny sandy beach with curious bright eyes, carefully picking up a shimmering seashell as waves lap nearby.",
    2: "The child floats amazed underwater surrounded by bubbles, hugging the glowing shell to their chest with wide astonished eyes.",
    3: "The child waves excitedly with a big smile at a tiny seahorse greeting them among vibrant pink and orange coral reefs.",
    4: "The child swims in wide-eyed wonder through a towering green seaweed forest as sunbeams filter down in golden shafts.",
    5: "The child listens with a concerned, caring expression as a slow wise sea turtle drifts nearby speaking to them.",
    6: "The child peers bravely into a dark rocky crevice with a determined face, the little seahorse hovering beside them.",
    7: "The child kneels near the seabed with a tender, gentle expression, reaching into a shell to comfort a tiny trembling baby fish.",
    8: "The child beams with a happy smile as a family of colorful fish swim joyfully around, reuniting with their little baby fish.",
    9: "The child dances and twirls joyfully among a swirl of brightly colored fish at a festive underwater celebration with bubbles rising.",
    10: "The child stands proudly with hands on hips smiling, as a friendly octopus inks their name onto a coral wall.",
    11: "The child holds out their wrist with touched shining eyes as the seahorse fastens a delicate pearl bracelet onto it.",
    12: "The child stands on the sunset beach waving gratefully toward the waves, the pearl bracelet shimmering on their wrist.",
  },
  "dinosaur-world": {
    1: "The child peers curiously into a glass museum display, leaning close with wide eyes toward a glowing dinosaur egg.",
    2: "The child stands amazed with arms raised, surrounded by prehistoric ferns and giant trees of the dinosaur era under a bright sky.",
    3: "The child kneels compassionately in tall grass, reaching out a gentle hand to a small teary-eyed baby triceratops.",
    4: "The child walks with determined steps beside the baby triceratops through a lush valley, looking up as a pteranodon soars overhead pointing the way.",
    5: "The child stands at a riverbank with hopeful upturned eyes, looking way up at an enormous long-necked brachiosaurus drinking water.",
    6: "The child freezes with surprised round eyes and raised eyebrows beside the baby triceratops as a huge T-rex sneezes comically in a flurry of pollen.",
    7: "The child stands on tiptoe with a kind, caring smile, gently wiping the T-rex's nose with a large green leaf.",
    8: "The child rides thrilled on the T-rex's back with arms spread wide, laughing as the sprawling dinosaur world stretches far below.",
    9: "The child points excitedly with a bright grin from the hilltop toward a mother triceratops searching in the distance.",
    10: "The child watches with touched, teary eyes as the mother triceratops nuzzles her baby in a warm reunion among the grasses.",
    11: "The child smiles proudly with a slight blush, bowing slightly to accept a necklace with a dinosaur footprint pendant from the mother triceratops.",
    12: "The child stands back in the museum with a happy content smile, clutching the dinosaur footprint necklace as soft light fades around the egg.",
  },
  "animal-school": {
    1: "The child stands nervously in front of a giant tree school, clutching a backpack strap with slightly hunched shoulders and big anxious eyes.",
    2: "The child stands shyly in a cozy classroom doorway, giving a tiny wave to a kindly bear teacher while a fox, rabbit, and squirrel peek from desks.",
    3: "The child sits at a desk focused on drawing, glancing sideways with an envious little pout at the squirrel's impressive artwork.",
    4: "The child kneels kindly beside a crying rabbit in the cafeteria, offering half of their lunchbox with a warm smile.",
    5: "The child runs determinedly down a grassy track in last place, face flushed but eyes fixed forward while the fox sprints ahead.",
    6: "The child stands before the bear teacher with encouraged sparkling eyes, blushing happily as the teacher claps warmly.",
    7: "The child stands confidently singing with one hand over their heart, animal classmates listening with wide admiring eyes.",
    8: "The child smiles warmly at the squirrel extending a paw, both exchanging a friendly handshake in the classroom.",
    9: "The child and the squirrel sit side by side growing their skills together, the child singing and the squirrel painting happily in a sunny corner.",
    10: "The child stands proudly on a small stage with the squirrel, singing into a microphone while the squirrel paints beside them.",
    11: "The child bows on stage with moved, teary eyes as a crowd of animal classmates and the bear teacher clap enthusiastically.",
    12: "The child walks home on a golden sunset path with a happy bright smile, holding a little picture letter in their pocket.",
  },
  "cooking-magic": {
    1: "The child stands at a kitchen counter with a worried furrowed brow, flipping through a big recipe book with flour-dusted hands.",
    2: "The child leans back surprised with wide eyes as a tiny flour fairy pops out of the glowing recipe book in a puff of sparkles.",
    3: "The child stands amazed in a huge magical kitchen, arms up as pots dance on their own and spoons sing around them.",
    4: "The child focuses intently while shaking a sieve, watching flour fall like snowflakes onto the big mixing bowl below.",
    5: "The child stands embarrassed with blushing cheeks and a frown, looking down at a broken egg on the kitchen floor.",
    6: "The child grins excitedly while stirring a bowl of batter that bubbles up with swirling rainbow light.",
    7: "The child peeks anticipating into a bright oven window with hopeful wide eyes, cheerful fruit characters bustling around with decorations.",
    8: "The child proudly pulls a puffy, cloud-soft cake out of the magical oven, mitts on hands and a big smile on their face.",
    9: "The child loves the task, carefully piping chocolate letters onto a strawberry-topped cake with a focused, tender expression.",
    10: "The child stands thrilled with hands clasped near their face, eyes sparkling as the flour fairy sprinkles glittering magic dust onto the finished cake.",
    11: "The child smiles shyly while presenting the cake to a touched, teary-eyed grandmother in a warm cozy dining room.",
    12: "The child sits happily at the table sharing a slice of cake with grandmother, a glowing little fairy letter peeking from their pocket.",
  },
  "brushing-hero": {
    1: "The child stands reluctantly in a bathroom with lips pursed tight and arms crossed, shaking their head at a toothbrush on the sink.",
    2: "The child floats amazed with wide wondering eyes inside a dreamscape where the mouth has become a vast gleaming white kingdom.",
    3: "The child stands curiously at the gates of a tall white tooth castle, greeted by little tooth soldiers in shiny armor.",
    4: "The child cowers with a scared gasp as a dark blobby cavity monster and its candy army charge forward, flinging sticky candies.",
    5: "The child watches with a worried, anguished face as the once-shining tooth soldiers turn yellow and weaken around them.",
    6: "The child stands with excited bright eyes as a glowing toothbrush sword and toothpaste shield appear in a beam of light before them.",
    7: "The child charges forward with determined fierce eyes, gripping the toothbrush sword high above their head toward the cavity monster.",
    8: "The child brushes bravely in a powerful stance, sweeping the toothbrush sword across glowing teeth as sparkles fly behind each stroke.",
    9: "The child raises their arms thrilled with a triumphant grin as the cavity monster shrieks and melts away along with the candy army.",
    10: "The child stands joyfully in the center of the peaceful tooth kingdom, arms lifted high as sparkling tooth soldiers cheer around them.",
    11: "The child kneels proudly with puffed chest as the tooth king pins a shining hero medal onto them in a ceremonial hall.",
    12: "The child stands happily at the bathroom sink in the morning, brushing teeth vigorously with a big gleaming smile in the mirror.",
  },
  "bath-mission": {
    1: "The child dashes reluctantly across a living room, hiding behind a couch cushion with a pouty face while peeking out warily.",
    2: "The child peers surprised over the rim of a bathtub with round eyes and open mouth as magical bubbles froth and rise up.",
    3: "The child stands amazed on the bathroom floor as a round cheerful bubble captain pops up from the bubble-filled tub to greet them.",
    4: "The child grins excitedly with arms outstretched as the bathroom transforms into a vast rainbow bubble sea stretching endlessly around them.",
    5: "The child rides thrilled at the front of a bubble ship with hair flying back, bubble captain beside them as frothy waves splash up.",
    6: "The child slides joyfully down a slick soap island slide with arms up and legs kicking, laughing freely.",
    7: "The child stands happily under a cascading shampoo waterfall, eyes closed contentedly as singing hair sprites swirl around their head.",
    8: "The child laughs amused with scrunched-up shoulders and giggles as a friendly gentle octopus scrubs their back with soft tentacles.",
    9: "The child stands bravely aiming a water jet with determined focus, blasting a cartoonish bubble pirate that pops apart.",
    10: "The child holds up a shimmering rainbow soap necklace with a delighted grin, bubbles floating around the treasure trove.",
    11: "The child sits refreshed in the bathtub back home, clean and rosy-cheeked with shining skin and a content smile.",
    12: "The child stands wrapped in a fluffy towel with a big happy smile, the fragrant soap necklace shining gently at their chest.",
  },
  "first-day-school": {
    1: "The child stands on a morning sidewalk gripping a parent's hand tightly, shoulders drawn up and lips trembling with nervous eyes.",
    2: "The child stands frozen and scared at a large kindergarten gate, eyes wide and body stiff as muffled happy sounds spill out from inside.",
    3: "The child stands shyly at the doorway, cheeks flushed as a warm smiling teacher pins a pretty flower nametag onto their shirt.",
    4: "The child stands relieved just inside the classroom, surprised little smile forming as they notice other children also tearful around them.",
    5: "The child sits at a small desk glancing sideways, making an awkward but connecting shy smile with a neighbor child who smiles back.",
    6: "The child sits on the classroom floor curiously stacking colorful blocks together with the new friend, both focused and gentle.",
    7: "The child giggles amused with a huge open-mouthed laugh as a tall block tower crashes down in front of them and the friend.",
    8: "The child chats excitedly at a lunch table with sparkling eyes, sharing food and talking animatedly with the new best friend.",
    9: "The child sits focused at a drawing table with tongue peeking out, carefully drawing a portrait of the friend with crayons.",
    10: "The child grins happily as the friend presses a pretend promise stamp onto their hand, both beaming beside the finished drawing.",
    11: "The child stands at the classroom door at pickup time with reluctant pleading eyes, tugging a parent's sleeve to stay longer.",
    12: "The child walks home on a bright sidewalk holding a parent's hand, chatting excitedly with a huge happy smile and bouncing steps.",
  },
  "birthday-adventure": {
    1: "The child sits up surprised in bed on a sunny birthday morning, pulling a sparkling glittering invitation out from under the pillow with wide eyes.",
    2: "The child holds the shimmering invitation close with curious focused eyes, reading the glowing letters in a cozy bedroom.",
    3: "The child stands amazed in a doorway with mouth open and arms dropped, staring at a long rainbow-colored path unfurling brightly ahead.",
    4: "The child skips happily along the rainbow path, smiling widely as a bear in a party hat hands over a bunch of colorful floating balloons.",
    5: "The child walks excitedly with bright wide eyes beside a rabbit carefully carrying a towering birthday cake down the rainbow path.",
    6: "The child reaches out helpfully on a small bridge, carrying a gift box for grateful happy squirrels struggling with a stack of presents.",
    7: "The child stands anticipating in front of a huge decorated door with hands clasped near their chest, eyes glittering with butterflies.",
    8: "The child throws arms overjoyed into the air with a huge grin as animal friends jump out in a surprise party with confetti exploding everywhere.",
    9: "The child leans in hopefully with closed eyes and hands together, cheeks puffed to blow out candles on a gorgeous birthday cake.",
    10: "The child sits on the floor grateful and touched, unwrapping presents surrounded by a plush doll, letter, and acorn necklace.",
    11: "The child dances ecstatic with arms flung wide in the middle of cheering animal friends, balloons and confetti swirling in a joyful party.",
    12: "The child stands happily in their bedroom back home with a bright smile, hugging a plush doll while the real gifts sit arranged on the bed.",
  },
};

const EMOTION_MAP: Record<string, string> = {
  excited: "with bright excited eyes and a big smile",
  curious: "looking curious, tilting head slightly",
  worried: "with slightly furrowed brows and a worried expression",
  happy: "smiling warmly and happily",
  joyful: "laughing joyfully with arms slightly open",
  surprised: "eyes wide in surprise, mouth slightly open",
  proud: "standing tall with a proud confident expression",
  determined: "with a determined brave expression",
  touched: "with a gentle touched expression, eyes slightly misty",
  grateful: "with a warm grateful smile",
  thrilled: "eyes sparkling, grinning with excitement",
  intrigued: "leaning forward with an intrigued look",
  awe: "gazing upward in awe, mouth slightly open",
  wonder: "eyes wide with wonder, soft smile",
  nervous: "standing a little stiffly with a nervous smile",
  calm: "with a calm and peaceful expression",
  sleepy: "rubbing eyes sleepily",
  playful: "with a playful mischievous grin",
};

function isPresetScenario(scenarioId: ThemeId): scenarioId is PresetScenarioId {
  return scenarioId !== "custom";
}

function getActionDescription(
  scenarioId: ThemeId,
  page: ScenarioPage
): string {
  if (isPresetScenario(scenarioId)) {
    const mapped = PAGE_ACTIONS[scenarioId]?.[page.pageNumber];
    if (mapped) return mapped;
  }
  const emotionDesc =
    EMOTION_MAP[page.emotion] ?? "with a cheerful bright expression";
  return `The scene: ${page.sceneDescription}. The child is ${emotionDesc}.`;
}

/**
 * 세션 첫 메시지용 시스템 프롬프트.
 * 전체 규칙(캐릭터 외형, 화풍, 제약)을 1회 priming으로 전달.
 */
export function buildSessionSystemPrompt(gender: ChildGender): string {
  const appearance = CHARACTER_APPEARANCE[gender];
  return [
    "You are creating a 12-page children's storybook series.",
    `The main character is ${appearance}.`,
    "Keep the character's face, hair, outfit, and art style perfectly consistent across every page I ask for.",
    STYLE_RULES,
    COMPOSITION_RULES,
    "When I describe a page, respond only with the rendered illustration image (no text, no explanation).",
  ].join(" ");
}

/**
 * 세션 내 페이지별 요청 프롬프트.
 * priming 후이므로 외형·화풍 중복 지시는 최소화하고 장면 묘사에 집중.
 */
export function buildPagePrompt(
  scenarioId: ThemeId,
  page: ScenarioPage
): string {
  const action = getActionDescription(scenarioId, page);
  const consistency =
    page.pageNumber === 1
      ? "This is page 1 — establish the main character's appearance clearly."
      : "Keep the character's appearance exactly the same as in previous pages, same face, hair, and outfit.";
  const composition =
    "Wide shot, full body visible, the child small within the frame (about 25-35% of image height). Emphasize the environment and surroundings.";
  return `Page ${page.pageNumber}: ${action} ${consistency} ${composition}`;
}

/**
 * 1페이지 이미지를 anchor로 첨부해 단건 재생성할 때 사용.
 * 세션 priming이 없는 단발 호출이라 외형/화풍 규칙을 함께 담는다.
 */
export function buildSinglePageRegenerationPrompt(
  scenarioId: ThemeId,
  page: ScenarioPage,
  gender: ChildGender
): string {
  const appearance = CHARACTER_APPEARANCE[gender];
  const action = getActionDescription(scenarioId, page);
  return [
    `The main character in the reference image is ${appearance}.`,
    "Match the character in the reference image exactly — same face, same hair, same outfit, same art style.",
    STYLE_RULES,
    COMPOSITION_RULES,
    `Page ${page.pageNumber}: ${action}`,
  ].join(" ");
}
