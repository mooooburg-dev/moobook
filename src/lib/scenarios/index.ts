import type { Book, Scenario, ScenarioCategory, ThemeId } from "@/types";
import { forestAdventure } from "./forest-adventure";
import { spaceExplorer } from "./space-explorer";
import { oceanFriends } from "./ocean-friends";
import { dinosaurWorld } from "./dinosaur-world";
import { animalSchool } from "./animal-school";
import { cookingMagic } from "./cooking-magic";
import { brushingHero } from "./brushing-hero";
import { bathMission } from "./bath-mission";
import { firstDaySchool } from "./first-day-school";
import { birthdayAdventure } from "./birthday-adventure";

export type PresetThemeId = Exclude<ThemeId, "custom">;

export const scenarios: Record<PresetThemeId, Scenario> = {
  "forest-adventure": forestAdventure,
  "space-explorer": spaceExplorer,
  "ocean-friends": oceanFriends,
  "dinosaur-world": dinosaurWorld,
  "animal-school": animalSchool,
  "cooking-magic": cookingMagic,
  "brushing-hero": brushingHero,
  "bath-mission": bathMission,
  "first-day-school": firstDaySchool,
  "birthday-adventure": birthdayAdventure,
};

export const categoryLabels: Record<ScenarioCategory, string> = {
  adventure: "모험",
  "daily-life": "일상생활",
  emotion: "감정/성장",
  celebration: "기념일",
  science: "과학",
};

export const categoryOrder: ScenarioCategory[] = [
  "adventure",
  "daily-life",
  "emotion",
  "celebration",
  "science",
];

export function getScenario(themeId: ThemeId): Scenario {
  if (themeId === "custom") {
    throw new Error("custom 테마는 getScenario로 조회할 수 없음. resolveScenario 사용");
  }
  return scenarios[themeId];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}

/**
 * book에 맞는 시나리오 반환. theme === "custom"이면 custom_scenario 사용.
 */
export function resolveScenario(
  book: Pick<Book, "theme" | "custom_scenario">
): Scenario {
  if (book.theme === "custom") {
    if (!book.custom_scenario) {
      throw new Error("custom 테마인데 custom_scenario가 비어있음");
    }
    return { id: "custom", ...book.custom_scenario };
  }
  return scenarios[book.theme];
}

export function getScenariosByCategory(): {
  category: ScenarioCategory;
  label: string;
  scenarios: Scenario[];
}[] {
  return categoryOrder.map((category) => ({
    category,
    label: categoryLabels[category],
    scenarios: getAllScenarios().filter((s) => s.category === category),
  }));
}
