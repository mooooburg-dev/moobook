import { createAdminClient } from "@/lib/supabase/admin";
import type { ChildGender } from "@/types";

const ILLUSTRATIONS_TABLE = "moobook_scenario_illustrations";
const USABLE_STATUSES = ["approved", "completed"] as const;

type UsableStatus = (typeof USABLE_STATUSES)[number];

interface IllustrationRow {
  scenario_id: string;
  page_number: number;
  gender: ChildGender;
  image_url: string | null;
  status: UsableStatus;
}

/**
 * boy/girl 외의 gender 값(현재 타입엔 없지만 DB에 들어올 가능성 대비)이 들어오면
 * boy를 기본 fallback 으로 사용한다.
 */
function normalizeGender(gender: ChildGender | string): ChildGender {
  return gender === "girl" ? "girl" : "boy";
}

/**
 * 시나리오 × 성별의 페이지별 일러스트 URL 맵을 한 번에 조회.
 * 사용 가능 상태(approved | completed)인 행만 반환하며, 누락된 페이지는 맵에서 빠진다.
 *
 * 반환값 예시: { 1: "https://…/page_01.png", 2: "https://…/page_02.png", ... }
 */
export async function fetchPreGeneratedIllustrationMap(
  scenarioId: string,
  gender: ChildGender
): Promise<Record<number, string>> {
  const supabase = createAdminClient();
  const normalizedGender = normalizeGender(gender);

  const { data, error } = await supabase
    .from(ILLUSTRATIONS_TABLE)
    .select("scenario_id, page_number, gender, image_url, status")
    .eq("scenario_id", scenarioId)
    .eq("gender", normalizedGender)
    .in("status", USABLE_STATUSES);

  if (error) {
    console.warn(
      `[scenario-illustrations] fetch 실패 (scenarioId=${scenarioId}, gender=${normalizedGender}): ${error.message}`
    );
    return {};
  }

  const map: Record<number, string> = {};
  for (const row of (data ?? []) as IllustrationRow[]) {
    if (!row.image_url) continue;
    map[row.page_number] = row.image_url;
  }
  return map;
}

/**
 * 시나리오 × 성별 단건 페이지의 사용 가능한 일러스트 URL 조회.
 * 누락이거나 미승인이면 null.
 */
export async function fetchPreGeneratedIllustration(
  scenarioId: string,
  pageNumber: number,
  gender: ChildGender
): Promise<string | null> {
  const supabase = createAdminClient();
  const normalizedGender = normalizeGender(gender);

  const { data, error } = await supabase
    .from(ILLUSTRATIONS_TABLE)
    .select("image_url, status")
    .eq("scenario_id", scenarioId)
    .eq("page_number", pageNumber)
    .eq("gender", normalizedGender)
    .in("status", USABLE_STATUSES)
    .maybeSingle();

  if (error) {
    console.warn(
      `[scenario-illustrations] fetch 실패 (scenarioId=${scenarioId}, page=${pageNumber}, gender=${normalizedGender}): ${error.message}`
    );
    return null;
  }
  return data?.image_url ?? null;
}

/**
 * scenarioId × gender 쌍이 totalPages 만큼 모두 사용 가능 상태인지 확인.
 * ThemeSelector에서 "사전 일러스트가 완비된 시나리오만 노출" 용도.
 */
export async function listFullyApprovedScenarioIds(
  gender: ChildGender,
  expectedPageCountByScenario: Record<string, number>
): Promise<Set<string>> {
  const supabase = createAdminClient();
  const normalizedGender = normalizeGender(gender);

  const { data, error } = await supabase
    .from(ILLUSTRATIONS_TABLE)
    .select("scenario_id, page_number")
    .eq("gender", normalizedGender)
    .in("status", USABLE_STATUSES);

  if (error) {
    console.warn(
      `[scenario-illustrations] coverage 조회 실패 (gender=${normalizedGender}): ${error.message}`
    );
    return new Set();
  }

  const counts = new Map<string, Set<number>>();
  for (const row of (data ?? []) as Pick<
    IllustrationRow,
    "scenario_id" | "page_number"
  >[]) {
    const set = counts.get(row.scenario_id) ?? new Set<number>();
    set.add(row.page_number);
    counts.set(row.scenario_id, set);
  }

  const complete = new Set<string>();
  for (const [scenarioId, pages] of counts) {
    const expected = expectedPageCountByScenario[scenarioId];
    if (!expected) continue;
    if (pages.size >= expected) complete.add(scenarioId);
  }
  return complete;
}
