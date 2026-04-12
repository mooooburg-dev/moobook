import type { Scenario, ThemeId } from "@/types";
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

export function getScenario(themeId: ThemeId): Scenario {
  return scenarios[themeId];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}
