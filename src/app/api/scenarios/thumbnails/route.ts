import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChildGender } from "@/types";

// 시나리오별 대표 일러스트 URL을 반환 (공개 API).
// 각 시나리오의 1페이지 일러스트 (완성 또는 승인) 중 해당 gender의 이미지.
// ?gender 미지정 시 boy 기준.
export async function GET(request: NextRequest) {
  const genderParam = request.nextUrl.searchParams.get("gender");
  const gender: ChildGender =
    genderParam === "girl" ? "girl" : "boy";

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("moobook_scenario_illustrations")
    .select("scenario_id, page_number, status, image_url, gender")
    .eq("gender", gender)
    .eq("page_number", 1)
    .in("status", ["approved", "completed"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const thumbnails: Record<string, string> = {};
  for (const row of data ?? []) {
    if (!row.image_url) continue;
    thumbnails[row.scenario_id] = row.image_url;
  }

  return NextResponse.json({ thumbnails });
}
