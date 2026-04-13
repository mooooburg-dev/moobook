import type { Scenario, ScenarioCategory, ThemeId } from "@/types";
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

export const scenarios: Record<ThemeId, Scenario> = {
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
  return scenarios[themeId];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
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
