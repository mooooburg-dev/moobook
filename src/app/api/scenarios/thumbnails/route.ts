import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllScenarios } from "@/lib/scenarios";
import type { ChildGender } from "@/types";

/**
 * 시나리오별 대표 일러스트 URL과 "사전 일러스트 완비 여부" 를 함께 반환 (공개 API).
 *
 * - thumbnails: scenarioId → 1페이지 image_url (approved | completed)
 * - completeScenarioIds: 해당 gender 기준 모든 페이지가 사용 가능 상태인 시나리오 id 목록
 *
 * 클라이언트는 completeScenarioIds 에 포함된 시나리오만 노출해 본문 생성 시
 * face-swap 경로가 보장되도록 한다.
 */
export async function GET(request: NextRequest) {
  const genderParam = request.nextUrl.searchParams.get("gender");
  const gender: ChildGender = genderParam === "girl" ? "girl" : "boy";

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("moobook_scenario_illustrations")
    .select("scenario_id, page_number, status, image_url, gender")
    .eq("gender", gender)
    .in("status", ["approved", "completed"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const expectedPageCount: Record<string, number> = {};
  for (const scenario of getAllScenarios()) {
    expectedPageCount[scenario.id] = scenario.pages.length;
  }

  const thumbnails: Record<string, string> = {};
  const pageSets = new Map<string, Set<number>>();

  for (const row of data ?? []) {
    if (!row.image_url) continue;
    if (row.page_number === 1) thumbnails[row.scenario_id] = row.image_url;
    const set = pageSets.get(row.scenario_id) ?? new Set<number>();
    set.add(row.page_number);
    pageSets.set(row.scenario_id, set);
  }

  const completeScenarioIds: string[] = [];
  for (const [scenarioId, pages] of pageSets) {
    const expected = expectedPageCount[scenarioId];
    if (!expected) continue;
    if (pages.size >= expected) completeScenarioIds.push(scenarioId);
  }

  return NextResponse.json({ thumbnails, completeScenarioIds });
}
