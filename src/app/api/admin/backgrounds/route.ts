import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios } from "@/lib/scenarios";
import type { ThemeId } from "@/types";

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

/**
 * GET /api/admin/backgrounds
 * 전체 시나리오별 배경 생성 현황 조회
 *
 * GET /api/admin/backgrounds?scenarioId=forest-adventure
 * 특정 시나리오의 페이지별 배경 상세 조회
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const scenarioId = request.nextUrl.searchParams.get("scenarioId");

  if (scenarioId) {
    // 특정 시나리오 상세 조회
    const { data, error } = await supabase
      .from("moobook_scenario_backgrounds")
      .select("*")
      .eq("scenario_id", scenarioId)
      .order("page_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ backgrounds: data ?? [] });
  }

  // 전체 시나리오 현황 조회
  const { data, error } = await supabase
    .from("moobook_scenario_backgrounds")
    .select("scenario_id, page_number, status, image_url")
    .order("page_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 시나리오별 통계 집계
  const stats: Record<
    string,
    { total: number; completed: number; approved: number; generating: number }
  > = {};
  const thumbnails: Record<string, string[]> = {};

  for (const themeId of Object.keys(scenarios) as ThemeId[]) {
    stats[themeId] = { total: scenarios[themeId].pageCount, completed: 0, approved: 0, generating: 0 };
    thumbnails[themeId] = [];
  }

  for (const row of data ?? []) {
    if (!stats[row.scenario_id]) continue;
    if (row.status === "completed") stats[row.scenario_id].completed++;
    if (row.status === "approved") stats[row.scenario_id].approved++;
    if (row.status === "generating") stats[row.scenario_id].generating++;
    if (
      (row.status === "completed" || row.status === "approved") &&
      row.image_url
    ) {
      thumbnails[row.scenario_id].push(row.image_url);
    }
  }

  return NextResponse.json({ stats, thumbnails });
}

/**
 * PATCH /api/admin/backgrounds
 * body: { scenarioId, pageNumber, action: 'approve' | 'reject' }
 * 개별 배경 승인/거부
 */
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const { scenarioId, pageNumber, action } = await request.json();

    if (!scenarioId || !pageNumber || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const newStatus = action === "approve" ? "approved" : "rejected";

    const { error } = await supabase
      .from("moobook_scenario_backgrounds")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("scenario_id", scenarioId)
      .eq("page_number", pageNumber);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/backgrounds?scenarioId=xxx
 * 시나리오의 모든 배경 레코드 삭제 (전체 재생성 준비)
 */
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const scenarioId = request.nextUrl.searchParams.get("scenarioId");
  if (!scenarioId) {
    return NextResponse.json({ error: "scenarioId 필요" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("moobook_scenario_backgrounds")
    .delete()
    .eq("scenario_id", scenarioId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
