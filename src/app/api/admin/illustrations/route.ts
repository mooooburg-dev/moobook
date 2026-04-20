import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios, type PresetThemeId } from "@/lib/scenarios";
import type { ChildGender, IllustrationStatus } from "@/types";

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

function isValidGender(value: unknown): value is ChildGender {
  return value === "boy" || value === "girl";
}

interface GenderStats {
  total: number;
  completed: number;
  approved: number;
  generating: number;
  failed: number;
}

function emptyStats(total: number): GenderStats {
  return { total, completed: 0, approved: 0, generating: 0, failed: 0 };
}

const STALE_GENERATING_MS = 5 * 60 * 1000;

async function resetStaleGenerating(
  supabase: ReturnType<typeof createAdminClient>,
  scenarioId?: string | null
) {
  const threshold = new Date(Date.now() - STALE_GENERATING_MS).toISOString();
  let query = supabase
    .from("moobook_scenario_illustrations")
    .update({ status: "pending", updated_at: new Date().toISOString() })
    .eq("status", "generating")
    .lt("updated_at", threshold);

  if (scenarioId) {
    query = query.eq("scenario_id", scenarioId);
  }

  await query;
}

/**
 * GET /api/admin/illustrations
 * 전체 시나리오×성별 현황 통계 반환
 *
 * GET /api/admin/illustrations?scenarioId=forest-adventure
 * 특정 시나리오의 페이지별 상세 (남/여 24행)
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const scenarioId = request.nextUrl.searchParams.get("scenarioId");

  await resetStaleGenerating(supabase, scenarioId);

  if (scenarioId) {
    const { data, error } = await supabase
      .from("moobook_scenario_illustrations")
      .select("*")
      .eq("scenario_id", scenarioId)
      .order("gender", { ascending: true })
      .order("page_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ illustrations: data ?? [] });
  }

  const { data, error } = await supabase
    .from("moobook_scenario_illustrations")
    .select("scenario_id, page_number, gender, status, image_url")
    .order("page_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stats: Record<string, { boy: GenderStats; girl: GenderStats }> = {};
  const thumbnails: Record<string, { boy: string | null; girl: string | null }> =
    {};

  for (const themeId of Object.keys(scenarios) as PresetThemeId[]) {
    const total = scenarios[themeId].pageCount;
    stats[themeId] = { boy: emptyStats(total), girl: emptyStats(total) };
    thumbnails[themeId] = { boy: null, girl: null };
  }

  for (const row of data ?? []) {
    const bucket = stats[row.scenario_id];
    if (!bucket) continue;
    const gender = row.gender as ChildGender;
    const s = bucket[gender];
    if (!s) continue;

    const status = row.status as IllustrationStatus;
    if (status === "completed") s.completed++;
    if (status === "approved") s.approved++;
    if (status === "generating") s.generating++;
    if (status === "rejected") s.failed++;

    if (
      row.page_number === 1 &&
      row.image_url &&
      (status === "completed" || status === "approved")
    ) {
      thumbnails[row.scenario_id][gender] = row.image_url;
    }
  }

  return NextResponse.json({ stats, thumbnails });
}

/**
 * PATCH /api/admin/illustrations
 * body: { scenarioId, pageNumber, gender, action: 'approve' | 'reject' | 'reset' }
 */
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const { scenarioId, pageNumber, gender, action } = await request.json();

    if (
      !scenarioId ||
      !pageNumber ||
      !isValidGender(gender) ||
      !["approve", "reject", "reset"].includes(action)
    ) {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    const newStatus: IllustrationStatus =
      action === "approve"
        ? "approved"
        : action === "reject"
          ? "rejected"
          : "pending";

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("moobook_scenario_illustrations")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("scenario_id", scenarioId)
      .eq("page_number", pageNumber)
      .eq("gender", gender);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/illustrations?scenarioId=xxx&gender=boy
 * gender 미지정 시 시나리오 전체 (남/여 모두) 삭제
 */
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const scenarioId = request.nextUrl.searchParams.get("scenarioId");
  const gender = request.nextUrl.searchParams.get("gender");
  if (!scenarioId) {
    return NextResponse.json({ error: "scenarioId 필요" }, { status: 400 });
  }
  if (gender && !isValidGender(gender)) {
    return NextResponse.json({ error: "유효하지 않은 gender" }, { status: 400 });
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("moobook_scenario_illustrations")
    .delete()
    .eq("scenario_id", scenarioId);
  if (gender) {
    query = query.eq("gender", gender);
  }
  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
