import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Replicate from "replicate";
import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios } from "@/lib/scenarios";
import {
  buildFirstPagePrompt,
  buildReferenceBasedPrompt,
} from "@/lib/scenarios/character-prompts";
import {
  characterImageColumn,
  characterStatusColumn,
  isValidGender,
  referenceImageColumn,
} from "@/lib/utils/gender-columns";
import type { ChildGender } from "@/types";
import type { PresetThemeId } from "@/lib/scenarios";

const MOCK_MODE =
  process.env.USE_MOCK_AI === "true" || !process.env.REPLICATE_API_TOKEN;

const CHARACTER_MODEL = "black-forest-labs/flux-kontext-pro";

const PLACEHOLDER_CHAR = (
  scenarioId: string,
  pageNumber: number,
  gender: ChildGender
) =>
  `https://placehold.co/768x1024/ffe5d9/d2691e?text=${scenarioId}+${gender}+p${pageNumber}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidScenarioId(id: string): id is PresetThemeId {
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
  pageNumber: number,
  gender: ChildGender
): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${res.status}`);

  const buffer = await res.arrayBuffer();
  const ts = Date.now();
  const path = `${scenarioId}/char_${gender}_page_${String(pageNumber).padStart(2, "0")}_${ts}.png`;

  const { error } = await supabase.storage
    .from("moobook_backgrounds")
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: false,
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
  scenarioId: PresetThemeId,
  row: TargetRow,
  inputImage: string,
  prompt: string,
  tag: string,
  replicate: Replicate | null,
  gender: ChildGender
): Promise<string> {
  const supabase = createAdminClient();
  const statusCol = characterStatusColumn(gender);

  await supabase
    .from("moobook_scenario_backgrounds")
    .update({
      [statusCol]: "generating",
      character_prompt: prompt,
      updated_at: new Date().toISOString(),
    })
    .eq("scenario_id", scenarioId)
    .eq("page_number", row.page_number);

  if (MOCK_MODE || !replicate) {
    console.log(`${tag} [MOCK] placeholder 사용`);
    return PLACEHOLDER_CHAR(scenarioId, row.page_number, gender);
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
  return uploadToStorage(supabase, outputUrl, scenarioId, row.page_number, gender);
}

async function markFailed(
  scenarioId: PresetThemeId,
  pageNumber: number,
  gender: ChildGender,
  msg: string
) {
  const supabase = createAdminClient();
  console.error(`[CHAR:${gender}] ${scenarioId} p${pageNumber} 실패: ${msg}`);
  await supabase
    .from("moobook_scenario_backgrounds")
    .update({
      [characterStatusColumn(gender)]: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("scenario_id", scenarioId)
    .eq("page_number", pageNumber);
}

async function generateInBackground(
  scenarioId: PresetThemeId,
  pageNumbers: number[] | null,
  gender: ChildGender
) {
  const supabase = createAdminClient();
  const scenario = scenarios[scenarioId];
  const imageCol = characterImageColumn(gender);
  const statusCol = characterStatusColumn(gender);
  const refCol = referenceImageColumn(gender);

  const { data: rows, error } = await supabase
    .from("moobook_scenario_backgrounds")
    .select(
      `page_number, status, image_url, ${imageCol}, ${statusCol}`
    )
    .eq("scenario_id", scenarioId)
    .eq("status", "approved");

  if (error) {
    console.error(`[CHAR:${gender}] ${scenarioId} 조회 실패:`, error.message);
    return;
  }

  const replicate = MOCK_MODE
    ? null
    : new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

  type Row = {
    page_number: number;
    status: string;
    image_url: string | null;
    [key: string]: unknown;
  };
  const typedRows = (rows ?? []) as unknown as Row[];

  const firstPageRow = typedRows.find((r) => r.page_number === 1);

  const isEligible = (r: Row) => {
    if (!r.image_url) return false;
    if (pageNumbers && !pageNumbers.includes(r.page_number)) return false;
    const st = r[statusCol];
    if (st === "completed" || st === "approved") return false;
    return true;
  };

  // 1페이지: 배경 위에 캐릭터 추가
  if (firstPageRow && isEligible(firstPageRow)) {
    const page = scenario.pages.find((p) => p.pageNumber === 1);
    if (page && firstPageRow.image_url) {
      const tag = `[CHAR:${gender}] ${scenarioId} p1 (first)`;
      const prompt = buildFirstPagePrompt(scenarioId, page, gender);
      try {
        const url = await runGeneration(
          scenarioId,
          firstPageRow,
          firstPageRow.image_url,
          prompt,
          tag,
          replicate,
          gender
        );
        await supabase
          .from("moobook_scenario_backgrounds")
          .update({
            [imageCol]: url,
            [statusCol]: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("scenario_id", scenarioId)
          .eq("page_number", 1);
        console.log(`${tag} 완료`);
      } catch (err) {
        await markFailed(
          scenarioId,
          1,
          gender,
          err instanceof Error ? err.message : String(err)
        );
      }
    }
  }

  // 2~12페이지: 성별별 레퍼런스 필요
  const restTargets = typedRows
    .filter((r) => r.page_number !== 1 && isEligible(r))
    .sort((a, b) => a.page_number - b.page_number);

  if (restTargets.length === 0) {
    console.log(`[CHAR:${gender}] ${scenarioId}: 2p 이후 생성 대상 없음`);
    return;
  }

  const { data: refRow } = await supabase
    .from("moobook_scenario_backgrounds")
    .select(refCol)
    .eq("scenario_id", scenarioId)
    .eq("page_number", 1)
    .maybeSingle();

  const referenceUrl = (refRow as Record<string, string | null> | null)?.[
    refCol
  ] ?? null;

  if (!referenceUrl) {
    console.warn(
      `[CHAR:${gender}] ${scenarioId}: 레퍼런스 미설정으로 2p 이후 생성 스킵`
    );
    return;
  }

  console.log(
    `[CHAR:${gender}] ${scenarioId}: 2p 이후 ${restTargets.length}페이지 레퍼런스 기반 생성 시작`
  );

  for (let i = 0; i < restTargets.length; i++) {
    const row = restTargets[i];
    const page = scenario.pages.find((p) => p.pageNumber === row.page_number);
    if (!page) continue;

    const tag = `[CHAR:${gender}] ${scenarioId} p${row.page_number} (ref)`;
    const prompt = buildReferenceBasedPrompt(scenarioId, page, gender);

    try {
      const url = await runGeneration(
        scenarioId,
        row,
        referenceUrl,
        prompt,
        tag,
        replicate,
        gender
      );
      await supabase
        .from("moobook_scenario_backgrounds")
        .update({
          [imageCol]: url,
          [statusCol]: "completed",
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
        gender,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  console.log(`[CHAR:${gender}] ${scenarioId}: 배치 생성 완료`);
}

/**
 * POST /api/admin/generate-characters
 * body: { scenarioId: string, pageNumbers?: number[], gender: 'boy' | 'girl' }
 */
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const { scenarioId, pageNumbers, gender } = await request.json();

    if (!scenarioId || !isValidScenarioId(scenarioId)) {
      return NextResponse.json(
        { error: "유효하지 않은 시나리오 ID" },
        { status: 400 }
      );
    }

    if (!isValidGender(gender)) {
      return NextResponse.json(
        { error: "유효하지 않은 gender (boy|girl)" },
        { status: 400 }
      );
    }

    const pages =
      Array.isArray(pageNumbers) &&
      pageNumbers.every((n) => typeof n === "number")
        ? pageNumbers
        : null;

    if (pages && pages.every((n) => n !== 1)) {
      const supabase = createAdminClient();
      const refCol = referenceImageColumn(gender);
      const { data: refRow } = await supabase
        .from("moobook_scenario_backgrounds")
        .select(refCol)
        .eq("scenario_id", scenarioId)
        .eq("page_number", 1)
        .maybeSingle();

      const refUrl =
        (refRow as Record<string, string | null> | null)?.[refCol] ?? null;

      if (!refUrl) {
        return NextResponse.json(
          {
            error:
              "레퍼런스가 설정되지 않았습니다. 1페이지 캐릭터를 먼저 생성하고 레퍼런스로 설정해 주세요.",
          },
          { status: 400 }
        );
      }
    }

    generateInBackground(scenarioId, pages, gender).catch((err) => {
      console.error(`[CHAR:${gender}] ${scenarioId} 배치 실패:`, err);
    });

    return NextResponse.json({
      success: true,
      message: `${scenarioId} (${gender}) 캐릭터 합성이 시작되었습니다`,
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
}
