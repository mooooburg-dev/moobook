import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Replicate from "replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios } from "@/lib/scenarios";
import type { ThemeId } from "@/types";

const MOCK_MODE =
  process.env.USE_MOCK_AI === "true" || !process.env.REPLICATE_API_TOKEN;

const BACKGROUND_MODEL = "black-forest-labs/flux-1.1-pro";

const STYLE_SUFFIX =
  ", warm watercolor children's book illustration, soft pastel colors, gentle lighting, storybook atmosphere, high quality, detailed background, no text, no words, no letters";

const PLACEHOLDER_BG = (scenarioId: string, pageNumber: number) =>
  `https://placehold.co/768x1024/d4edda/2d6a4f?text=${scenarioId}+p${pageNumber}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidScenarioId(id: string): id is ThemeId {
  return id in scenarios;
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

/**
 * 배경 이미지를 Supabase Storage에 업로드
 */
async function uploadToStorage(
  supabase: ReturnType<typeof createAdminClient>,
  imageUrl: string,
  scenarioId: string,
  pageNumber: number
): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${res.status}`);

  const buffer = await res.arrayBuffer();
  const path = `${scenarioId}/page_${String(pageNumber).padStart(2, "0")}.png`;

  const { error } = await supabase.storage
    .from("moobook_backgrounds")
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`Storage 업로드 실패: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from("moobook_backgrounds")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * 배경 생성 백그라운드 프로세스
 */
async function generateInBackground(scenarioId: ThemeId) {
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
    `[BG] ${scenarioId}: ${pagesToGenerate.length}개 페이지 생성 시작`
  );

  const replicate = MOCK_MODE
    ? null
    : new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

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
      let replicateOutputUrl: string | null = null;

      if (MOCK_MODE || !replicate) {
        // Mock 모드: placeholder 사용
        console.log(`${tag} [MOCK] placeholder 사용`);
        imageUrl = PLACEHOLDER_BG(scenarioId, page.pageNumber);
      } else {
        // Replicate API 호출
        console.log(`${tag} Replicate 호출 시작`);
        const prompt = page.illustrationPrompt.includes(STYLE_SUFFIX.trim())
          ? page.illustrationPrompt
          : page.illustrationPrompt + STYLE_SUFFIX;

        const output = await replicate.run(
          BACKGROUND_MODEL as `${string}/${string}`,
          {
            input: {
              prompt,
              aspect_ratio: "3:4",
              output_format: "png",
              safety_tolerance: 2,
            },
          }
        );

        replicateOutputUrl = String(output);
        if (!replicateOutputUrl.startsWith("http")) {
          throw new Error("유효하지 않은 Replicate URL");
        }

        console.log(`${tag} Replicate 완료, Storage 업로드 시작`);

        // Supabase Storage에 영구 저장
        imageUrl = await uploadToStorage(
          supabase,
          replicateOutputUrl,
          scenarioId,
          page.pageNumber
        );
      }

      // DB 업데이트: completed
      await supabase
        .from("moobook_scenario_backgrounds")
        .update({
          image_url: imageUrl,
          replicate_output_url: replicateOutputUrl,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("scenario_id", scenarioId)
        .eq("page_number", page.pageNumber);

      console.log(`${tag} 완료`);

      // Rate limit 방지: 5초 대기 (마지막 페이지 제외)
      if (page !== pagesToGenerate[pagesToGenerate.length - 1] && !MOCK_MODE) {
        await sleep(5000);
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
