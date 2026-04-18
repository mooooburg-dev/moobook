import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios, type PresetThemeId } from "@/lib/scenarios";
import {
  generateImageFromText,
  isGeminiMockMode,
  STYLE_SUFFIX,
} from "@/lib/gemini";
import { uploadImageBuffer, uploadImageFromUrl } from "@/lib/storage/upload-image";

const MOCK_MODE = isGeminiMockMode();

const PLACEHOLDER_BG = (scenarioId: string, pageNumber: number) =>
  `https://placehold.co/768x1024/d4edda/2d6a4f?text=${scenarioId}+p${pageNumber}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidScenarioId(id: string): id is PresetThemeId {
  return id in scenarios;
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

const BG_BUCKET = "moobook_backgrounds";
const bgPath = (scenarioId: string, pageNumber: number) =>
  `${scenarioId}/page_${String(pageNumber).padStart(2, "0")}.png`;

/**
 * 배경 생성 백그라운드 프로세스
 */
async function generateInBackground(scenarioId: PresetThemeId) {
  const supabase = createAdminClient();
  const scenario = scenarios[scenarioId];

  // 이미 completed/approved인 페이지 조회
  const { data: existing } = await supabase
    .from("moobook_scenario_backgrounds")
    .select("page_number, status")
    .eq("scenario_id", scenarioId)
    .in("status", ["completed", "approved"]);

  const completedPages = new Set(existing?.map((r) => r.page_number) ?? []);

  // 미생성 페이지 필터
  const pagesToGenerate = scenario.pages.filter(
    (p) => !completedPages.has(p.pageNumber)
  );

  if (pagesToGenerate.length === 0) {
    console.log(`[BG] ${scenarioId}: 모든 페이지 이미 생성됨`);
    return;
  }

  console.log(
    `[BG] ${scenarioId}: ${pagesToGenerate.length}개 페이지 생성 시작 (Gemini)`
  );

  for (const page of pagesToGenerate) {
    const tag = `[BG] ${scenarioId} p${page.pageNumber}`;

    try {
      // upsert로 generating 상태 설정
      await supabase.from("moobook_scenario_backgrounds").upsert(
        {
          scenario_id: scenarioId,
          page_number: page.pageNumber,
          illustration_prompt: page.illustrationPrompt,
          status: "generating",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "scenario_id,page_number" }
      );

      let imageUrl: string;

      if (MOCK_MODE) {
        // Mock 모드: placeholder URL을 직접 Storage에 업로드해 최종 URL 확보
        console.log(`${tag} [MOCK] placeholder 사용`);
        imageUrl = await uploadImageFromUrl(supabase, {
          bucket: BG_BUCKET,
          path: bgPath(scenarioId, page.pageNumber),
          url: PLACEHOLDER_BG(scenarioId, page.pageNumber),
        });
      } else {
        // Gemini 호출 → Buffer로 직접 업로드
        console.log(`${tag} Gemini 호출 시작`);
        const prompt = page.illustrationPrompt.includes("watercolor children's book")
          ? page.illustrationPrompt
          : page.illustrationPrompt + STYLE_SUFFIX;

        const { buffer, mimeType } = await generateImageFromText(prompt, {
          tag,
          appendStyle: false,
          pageNumber: page.pageNumber,
        });

        console.log(`${tag} Gemini 완료, Storage 업로드 시작`);

        imageUrl = await uploadImageBuffer(supabase, {
          bucket: BG_BUCKET,
          path: bgPath(scenarioId, page.pageNumber),
          buffer,
          contentType: mimeType,
          upsert: true,
        });
      }

      // DB 업데이트: completed
      await supabase
        .from("moobook_scenario_backgrounds")
        .update({
          image_url: imageUrl,
          replicate_output_url: null,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("scenario_id", scenarioId)
        .eq("page_number", page.pageNumber);

      console.log(`${tag} 완료`);

      // Gemini rate limit 대비: 2초 대기 (마지막 페이지 제외)
      if (page !== pagesToGenerate[pagesToGenerate.length - 1] && !MOCK_MODE) {
        await sleep(2000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${tag} 실패: ${msg}`);

      // 실패 시 pending으로 복원
      await supabase
        .from("moobook_scenario_backgrounds")
        .update({
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("scenario_id", scenarioId)
        .eq("page_number", page.pageNumber);
    }
  }

  console.log(`[BG] ${scenarioId}: 배치 생성 완료`);
}

/**
 * POST /api/admin/generate-backgrounds
 * body: { scenarioId: string }
 * 즉시 응답 후 백그라운드에서 생성 진행
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

    // 백그라운드에서 생성 시작 (await하지 않음)
    generateInBackground(scenarioId).catch((err) => {
      console.error(`[BG] ${scenarioId} 배치 실패:`, err);
    });

    return NextResponse.json({
      success: true,
      message: `${scenarioId} 배경 생성이 시작되었습니다`,
    });
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다" },
      { status: 400 }
    );
  }
}
