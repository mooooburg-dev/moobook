import type { ChildGender } from "@/types";
import type { PresetThemeId } from "@/lib/scenarios";

/**
 * 한국 4계절 매핑.
 * - 봄(3~5월) / 여름(6~8월) / 가을(9~11월) / 겨울(12~2월)
 */
export type Season = "spring" | "summer" | "autumn" | "winter";

export function getSeasonForMonth(month: number): Season {
  const m = ((month - 1) % 12) + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

export function getCurrentSeason(now: Date = new Date()): Season {
  return getSeasonForMonth(now.getMonth() + 1);
}

/**
 * 시나리오 배경(실내/실외) 분류.
 * 실내 시나리오는 계절 옷차림이 어색하므로 사계절 무관 실내복으로 고정한다.
 */
const INDOOR_SCENARIO_IDS = new Set<PresetThemeId>([
  "brushing-hero",
  "bath-mission",
  "cooking-magic",
]);

export function isIndoorScenario(scenarioId: string): boolean {
  return INDOOR_SCENARIO_IDS.has(scenarioId as PresetThemeId);
}

interface OutfitDescriptor {
  /** 옷차림 본문 (영문, 프롬프트 삽입용) */
  description: string;
  /** 라벨 (영문 1~2단어, 메타데이터/로그용) */
  label: string;
}

const SEASONAL_OUTFITS: Record<Season, Record<ChildGender, OutfitDescriptor>> = {
  spring: {
    boy: {
      label: "spring",
      description:
        "a soft pastel long-sleeve cotton t-shirt, a light unzipped cardigan, comfortable knee-length cotton pants, and white sneakers (spring outfit, mild weather)",
    },
    girl: {
      label: "spring",
      description:
        "a soft pastel long-sleeve blouse, a light open cardigan, a knee-length cotton skirt or comfy leggings, and white sneakers (spring outfit, mild weather)",
    },
  },
  summer: {
    boy: {
      label: "summer",
      description:
        "a light blue short-sleeve cotton t-shirt, beige knee-length shorts, and white sneakers (summer outfit, warm weather)",
    },
    girl: {
      label: "summer",
      description:
        "a soft pink short-sleeve blouse, a light floral pattern skirt above the knee, and white sandals (summer outfit, warm weather)",
    },
  },
  autumn: {
    boy: {
      label: "autumn",
      description:
        "a warm-toned long-sleeve cotton t-shirt, a light denim jacket, comfortable long cotton pants, and brown sneakers (autumn outfit, cool weather)",
    },
    girl: {
      label: "autumn",
      description:
        "a warm-toned long-sleeve knit top, a light cardigan, a knee-length corduroy skirt with leggings underneath, and brown sneakers (autumn outfit, cool weather)",
    },
  },
  winter: {
    boy: {
      label: "winter",
      description:
        "a thick knit sweater under a padded winter coat, long warm pants, a soft knitted beanie, a wool scarf, and warm winter boots (winter outfit, cold weather)",
    },
    girl: {
      label: "winter",
      description:
        "a thick knit sweater under a padded winter coat, warm tights with a wool skirt or long pants, a soft knitted beanie, a wool scarf, and warm winter boots (winter outfit, cold weather)",
    },
  },
};

const INDOOR_OUTFITS: Record<ChildGender, OutfitDescriptor> = {
  boy: {
    label: "indoor",
    description:
      "comfortable indoor clothes — a short-sleeve cotton t-shirt and soft cotton shorts in pastel tones (year-round indoor wear)",
  },
  girl: {
    label: "indoor",
    description:
      "comfortable indoor clothes — a short-sleeve cotton top and soft cotton shorts or a casual skirt in pastel tones (year-round indoor wear)",
  },
};

/**
 * 시나리오와 계절을 받아 적절한 옷차림 설명을 반환.
 * 실내 시나리오는 계절 무관 실내복으로 고정.
 */
export function resolveOutfit(
  scenarioId: string,
  gender: ChildGender,
  season: Season
): OutfitDescriptor {
  if (isIndoorScenario(scenarioId)) return INDOOR_OUTFITS[gender];
  return SEASONAL_OUTFITS[season][gender];
}

/**
 * 시나리오 컨텍스트 없이 계절 옷만 가져올 때 사용.
 * face-candidate(반신 portrait) 등에 사용.
 */
export function resolveSeasonalOutfit(
  gender: ChildGender,
  season: Season
): OutfitDescriptor {
  return SEASONAL_OUTFITS[season][gender];
}
