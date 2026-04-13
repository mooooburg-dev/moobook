import type { Scenario, ScenarioCategory, ThemeId } from "@/types";
import { forestAdventure } from "./forest-adventure";
import { spaceExplorer } from "./space-explorer";
import { oceanFriends } from "./ocean-friends";
import { dinosaurWorld } from "./dinosaur-world";
import { fairyKingdom } from "./fairy-kingdom";
import { animalSchool } from "./animal-school";
import { timeTravel } from "./time-travel";
import { cookingMagic } from "./cooking-magic";
import { musicLand } from "./music-land";
import { superheroDay } from "./superhero-day";

export const scenarios: Record<ThemeId, Scenario> = {
  "forest-adventure": forestAdventure,
  "space-explorer": spaceExplorer,
  "ocean-friends": oceanFriends,
  "dinosaur-world": dinosaurWorld,
  "fairy-kingdom": fairyKingdom,
  "animal-school": animalSchool,
  "time-travel": timeTravel,
  "cooking-magic": cookingMagic,
  "music-land": musicLand,
  "superhero-day": superheroDay,
};

export const categoryLabels: Record<ScenarioCategory, string> = {
  adventure: "모험",
  fantasy: "판타지",
  education: "교육",
  "daily-life": "일상생활",
  science: "과학",
};

export const categoryOrder: ScenarioCategory[] = [
  "adventure",
  "fantasy",
  "education",
  "daily-life",
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
