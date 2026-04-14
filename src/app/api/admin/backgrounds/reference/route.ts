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

function isValidScenarioId(id: string): id is ThemeId {
  return id in scenarios;
}

/**
 * POST /api/admin/backgrounds/reference
 * body: { scenarioId }
 * 1페이지의 character_image_url을 reference_image_url로 복사.
 */
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const { scenarioId } = await request.json();
    if (!scenarioId || !isValidScenarioId(scenarioId)) {
      return NextResponse.json(
        { error: "유효하지 않은 시나리오 ID" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: row, error: fetchErr } = await supabase
      .from("moobook_scenario_backgrounds")
      .select("character_image_url, character_status")
      .eq("scenario_id", scenarioId)
      .eq("page_number", 1)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!row?.character_image_url) {
      return NextResponse.json(
        { error: "1페이지 캐릭터 이미지가 아직 없어요." },
        { status: 400 }
      );
    }
    if (
      row.character_status !== "completed" &&
      row.character_status !== "approved"
    ) {
      return NextResponse.json(
        { error: "1페이지 캐릭터가 완료 상태여야 해요." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("moobook_scenario_backgrounds")
      .update({
        reference_image_url: row.character_image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("scenario_id", scenarioId)
      .eq("page_number", 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reference_image_url: row.character_image_url,
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/backgrounds/reference?scenarioId=xxx
 * 레퍼런스 해제.
 */
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const scenarioId = request.nextUrl.searchParams.get("scenarioId");
  if (!scenarioId || !isValidScenarioId(scenarioId)) {
    return NextResponse.json(
      { error: "유효하지 않은 시나리오 ID" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("moobook_scenario_backgrounds")
    .update({
      reference_image_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("scenario_id", scenarioId)
    .eq("page_number", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
