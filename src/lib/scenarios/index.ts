import type { Scenario, ThemeId } from "@/types";
import { forestAdventure } from "./forest-adventure";
import { spaceExplorer } from "./space-explorer";

export const scenarios: Record<ThemeId, Scenario> = {
  "forest-adventure": forestAdventure,
  "space-explorer": spaceExplorer,
};

export function getScenario(themeId: ThemeId): Scenario {
  return scenarios[themeId];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}
