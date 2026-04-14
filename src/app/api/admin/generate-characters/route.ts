import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Replicate from "replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios } from "@/lib/scenarios";
import {
  buildFirstPagePrompt,
  buildReferenceBasedPrompt,
} from "@/lib/scenarios/character-prompts";
import type { ThemeId } from "@/types";

const MOCK_MODE =
  process.env.USE_MOCK_AI === "true" || !process.env.REPLICATE_API_TOKEN;

const CHARACTER_MODEL = "black-forest-labs/flux-kontext-pro";

const PLACEHOLDER_CHAR = (scenarioId: string, pageNumber: number) =>
  `https://placehold.co/768x1024/ffe5d9/d2691e?text=${scenarioId}+char+p${pageNumber}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidScenarioId(id: string): id is ThemeId {
  return id in scenarios;
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

async function uploadToStorage(
  supabase: ReturnType<typeof createAdminClient>,
  imageUrl: string,
  scenarioId: string,
  pageNumber: number
): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${res.status}`);

  const buffer = await res.arrayBuffer();
  const path = `${scenarioId}/char_page_${String(pageNumber).padStart(2, "0")}.png`;

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

type TargetRow = {
  page_number: number;
  image_url: string | null;
};

async function runGeneration(
  scenarioId: ThemeId,
  row: TargetRow,
  inputImage: string,
  prompt: string,
  tag: string,
  replicate: Replicate | null
): Promise<string> {
  const supabase = createAdminClient();

  await supabase
    .from("moobook_scenario_backgrounds")
    .update({
      character_status: "generating",
      character_prompt: prompt,
      updated_at: new Date().toISOString(),
    })
    .eq("scenario_id", scenarioId)
    .eq("page_number", row.page_number);

  if (MOCK_MODE || !replicate) {
    console.log(`${tag} [MOCK] placeholder 사용`);
    return PLACEHOLDER_CHAR(scenarioId, row.page_number);
  }

  console.log(`${tag} Replicate 호출 시작`);
  const output = await replicate.run(
    CHARACTER_MODEL as `${string}/${string}`,
    {
      input: {
        input_image: inputImage,
        prompt,
        aspect_ratio: "3:4",
        output_format: "png",
        safety_tolerance: 2,
      },
    }
  );

  const outputUrl = String(output);
  if (!outputUrl.startsWith("http")) {
    throw new Error("유효하지 않은 Replicate URL");
  }

  console.log(`${tag} Replicate 완료, Storage 업로드 시작`);
  return uploadToStorage(supabase, outputUrl, scenarioId, row.page_number);
}

async function markFailed(
  scenarioId: ThemeId,
  pageNumber: number,
  msg: string
) {
  const supabase = createAdminClient();
  console.error(`[CHAR] ${scenarioId} p${pageNumber} 실패: ${msg}`);
  await supabase
    .from("moobook_scenario_backgrounds")
    .update({
      character_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("scenario_id", scenarioId)
    .eq("page_number", pageNumber);
}

async function generateInBackground(
  scenarioId: ThemeId,
  pageNumbers: number[] | null
) {
  const supabase = createAdminClient();
  const scenario = scenarios[scenarioId];

  const { data: rows, error } = await supabase
    .from("moobook_scenario_backgrounds")
    .select(
      "page_number, status, image_url, character_status, character_image_url, reference_image_url"
    )
    .eq("scenario_id", scenarioId)
    .eq("status", "approved");

  if (error) {
    console.error(`[CHAR] ${scenarioId} 조회 실패:`, error.message);
    return;
  }

  const replicate = MOCK_MODE
    ? null
    : new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

  const firstPageRow = (rows ?? []).find((r) => r.page_number === 1);

  const isEligible = (r: (typeof rows)[number]) => {
    if (!r.image_url) return false;
    if (pageNumbers && !pageNumbers.includes(r.page_number)) return false;
    if (
      r.character_status === "completed" ||
      r.character_status === "approved"
    ) {
      return false;
    }
    return true;
  };

  // 1페이지: 배경 위에 캐릭터 추가 (기존 방식)
  if (firstPageRow && isEligible(firstPageRow)) {
    const page = scenario.pages.find((p) => p.pageNumber === 1);
    if (page && firstPageRow.image_url) {
      const tag = `[CHAR] ${scenarioId} p1 (first)`;
      const prompt = buildFirstPagePrompt(scenarioId, page);
      try {
        const url = await runGeneration(
          scenarioId,
          firstPageRow,
          firstPageRow.image_url,
          prompt,
          tag,
          replicate
        );
        await supabase
          .from("moobook_scenario_backgrounds")
          .update({
            character_image_url: url,
            character_status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("scenario_id", scenarioId)
          .eq("page_number", 1);
        console.log(`${tag} 완료`);
      } catch (err) {
        await markFailed(scenarioId, 1, err instanceof Error ? err.message : String(err));
      }
    }
  }

  // 2~12페이지: 레퍼런스 필요
  const restTargets = (rows ?? [])
    .filter((r) => r.page_number !== 1 && isEligible(r))
    .sort((a, b) => a.page_number - b.page_number);

  if (restTargets.length === 0) {
    console.log(`[CHAR] ${scenarioId}: 2p 이후 생성 대상 없음`);
    return;
  }

  // 레퍼런스 조회 (1페이지 행에만 저장됨)
  const { data: refRow } = await supabase
    .from("moobook_scenario_backgrounds")
    .select("reference_image_url")
    .eq("scenario_id", scenarioId)
    .eq("page_number", 1)
    .maybeSingle();

  const referenceUrl = refRow?.reference_image_url ?? null;

  if (!referenceUrl) {
    console.warn(
      `[CHAR] ${scenarioId}: 레퍼런스 미설정으로 2p 이후 생성 스킵`
    );
    return;
  }

  console.log(
    `[CHAR] ${scenarioId}: 2p 이후 ${restTargets.length}페이지 레퍼런스 기반 생성 시작`
  );

  for (let i = 0; i < restTargets.length; i++) {
    const row = restTargets[i];
    const page = scenario.pages.find((p) => p.pageNumber === row.page_number);
    if (!page) continue;

    const tag = `[CHAR] ${scenarioId} p${row.page_number} (ref)`;
    const prompt = buildReferenceBasedPrompt(scenarioId, page);

    try {
      const url = await runGeneration(
        scenarioId,
        row,
        referenceUrl,
        prompt,
        tag,
        replicate
      );
      await supabase
        .from("moobook_scenario_backgrounds")
        .update({
          character_image_url: url,
          character_status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("scenario_id", scenarioId)
        .eq("page_number", row.page_number);
      console.log(`${tag} 완료`);

      if (i < restTargets.length - 1 && !MOCK_MODE) {
        await sleep(5000);
      }
    } catch (err) {
      await markFailed(
        scenarioId,
        row.page_number,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  console.log(`[CHAR] ${scenarioId}: 배치 생성 완료`);
}

/**
 * POST /api/admin/generate-characters
 * body: { scenarioId: string, pageNumbers?: number[] }
 *
 * 동작:
 * - 1페이지: 배경 위에 캐릭터 추가.
 * - 2페이지 이후: 1페이지 reference_image_url이 설정되어 있어야 하며, 레퍼런스를 input_image로 사용.
 */
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const { scenarioId, pageNumbers } = await request.json();

    if (!scenarioId || !isValidScenarioId(scenarioId)) {
      return NextResponse.json(
        { error: "유효하지 않은 시나리오 ID" },
        { status: 400 }
      );
    }

    const pages =
      Array.isArray(pageNumbers) &&
      pageNumbers.every((n) => typeof n === "number")
        ? pageNumbers
        : null;

    // 2페이지 이후만 요청인데 레퍼런스 미설정이면 차단
    if (pages && pages.every((n) => n !== 1)) {
      const supabase = createAdminClient();
      const { data: refRow } = await supabase
        .from("moobook_scenario_backgrounds")
        .select("reference_image_url")
        .eq("scenario_id", scenarioId)
        .eq("page_number", 1)
        .maybeSingle();

      if (!refRow?.reference_image_url) {
        return NextResponse.json(
          {
            error:
              "레퍼런스가 설정되지 않았습니다. 1페이지 캐릭터를 먼저 생성하고 레퍼런스로 설정해 주세요.",
          },
          { status: 400 }
        );
      }
    }

    generateInBackground(scenarioId, pages).catch((err) => {
      console.error(`[CHAR] ${scenarioId} 배치 실패:`, err);
    });

    return NextResponse.json({
      success: true,
      message: `${scenarioId} 캐릭터 합성이 시작되었습니다`,
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
}
