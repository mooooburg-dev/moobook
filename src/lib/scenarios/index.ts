import type { Scenario, ScenarioCategory, ThemeId } from "@/types";
import { forestAdventure } from "./forest-adventure";
import { spaceExplorer } from "./space-explorer";
import { brushingHero } from "./brushing-hero";
import { bathMission } from "./bath-mission";
import { firstDaySchool } from "./first-day-school";
import { newSibling } from "./new-sibling";
import { birthdayAdventure } from "./birthday-adventure";
import { santasGift } from "./santas-gift";
import { firefighterMe } from "./firefighter-me";
import { chefMe } from "./chef-me";

export const scenarios: Record<ThemeId, Scenario> = {
  "forest-adventure": forestAdventure,
  "space-explorer": spaceExplorer,
  "brushing-hero": brushingHero,
  "bath-mission": bathMission,
  "first-day-school": firstDaySchool,
  "new-sibling": newSibling,
  "birthday-adventure": birthdayAdventure,
  "santas-gift": santasGift,
  "firefighter-me": firefighterMe,
  "chef-me": chefMe,
};

export const categoryLabels: Record<ScenarioCategory, string> = {
  adventure: "모험",
  habit: "생활습관",
  emotion: "감정/성장",
  celebration: "기념일",
  dream: "꿈/직업",
};

export const categoryOrder: ScenarioCategory[] = [
  "adventure",
  "habit",
  "emotion",
  "celebration",
  "dream",
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
