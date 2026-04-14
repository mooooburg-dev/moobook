import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 시나리오별 대표 배경 이미지 URL을 반환 (공개 API).
// 각 시나리오에서 approved 또는 completed 상태인 가장 앞쪽 page의 image_url.
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("moobook_scenario_backgrounds")
    .select("scenario_id, page_number, status, image_url")
    .in("status", ["approved", "completed"])
    .order("page_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const thumbnails: Record<string, string> = {};
  for (const row of data ?? []) {
    if (!row.image_url) continue;
    if (thumbnails[row.scenario_id]) continue;
    thumbnails[row.scenario_id] = row.image_url;
  }

  return NextResponse.json({ thumbnails });
}
