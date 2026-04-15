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
    .select(
      "scenario_id, page_number, status, character_status, image_url, character_image_url"
    )
    .order("page_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type PhaseStats = {
    total: number;
    completed: number;
    approved: number;
    generating: number;
  };

  const stats: Record<
    string,
    PhaseStats & { character: PhaseStats }
  > = {};
  const thumbnails: Record<string, string[]> = {};

  for (const themeId of Object.keys(scenarios) as ThemeId[]) {
    const total = scenarios[themeId].pageCount;
    stats[themeId] = {
      total,
      completed: 0,
      approved: 0,
      generating: 0,
      character: { total, completed: 0, approved: 0, generating: 0 },
    };
    thumbnails[themeId] = [];
  }

  for (const row of data ?? []) {
    const s = stats[row.scenario_id];
    if (!s) continue;

    if (row.status === "completed") s.completed++;
    if (row.status === "approved") s.approved++;
    if (row.status === "generating") s.generating++;

    if (row.character_status === "completed") s.character.completed++;
    if (row.character_status === "approved") s.character.approved++;
    if (row.character_status === "generating") s.character.generating++;

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
 * body: { scenarioId, pageNumber, action: 'approve' | 'reject', target?: 'background' | 'character' }
 * target 기본값은 'background'. 'character'면 character_status 컬럼을 업데이트.
 */
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const { scenarioId, pageNumber, action, target } = await request.json();

    if (
      !scenarioId ||
      !pageNumber ||
      !["approve", "reject", "reset"].includes(action)
    ) {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    const useCharacter = target === "character";
    if (target && !["background", "character"].includes(target)) {
      return NextResponse.json({ error: "잘못된 target" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const newStatus =
      action === "approve"
        ? "approved"
        : action === "reject"
          ? "rejected"
          : "pending";

    const updatePayload = useCharacter
      ? { character_status: newStatus, updated_at: new Date().toISOString() }
      : { status: newStatus, updated_at: new Date().toISOString() };

    const { error } = await supabase
      .from("moobook_scenario_backgrounds")
      .update(updatePayload)
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
