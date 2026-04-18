import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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
import {
  createStoryChatSession,
  generateImageWithReferences,
  generateNextPageInSession,
  isGeminiMockMode,
  type GeminiImageResult,
  type ReferenceImage,
} from "@/lib/gemini";
import type { Chat } from "@google/genai";
import {
  uploadImageBuffer,
  uploadImageFromUrl,
} from "@/lib/storage/upload-image";

const MOCK_MODE = isGeminiMockMode();

const PLACEHOLDER_CHAR = (
  scenarioId: string,
  pageNumber: number,
  gender: ChildGender
) =>
  `https://placehold.co/768x1024/ffe5d9/d2691e?text=${scenarioId}+${gender}+p${pageNumber}`;

const CHAR_BUCKET = "moobook_backgrounds";
const charPath = (
  scenarioId: string,
  pageNumber: number,
  gender: ChildGender
) =>
  `${scenarioId}/char_${gender}_page_${String(pageNumber).padStart(2, "0")}_${Date.now()}.png`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidScenarioId(id: string): id is PresetThemeId {
  return id in scenarios;
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

async function fetchReferenceImage(url: string): Promise<ReferenceImage> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`참조 이미지 다운로드 실패: ${res.status}`);
  }
  const ab = await res.arrayBuffer();
  return {
    buffer: Buffer.from(ab),
    mimeType: res.headers.get("content-type") ?? "image/png",
  };
}

type TargetRow = {
  page_number: number;
  image_url: string | null;
};

interface RunGenerationArgs {
  scenarioId: PresetThemeId;
  row: TargetRow;
  prompt: string;
  tag: string;
  gender: ChildGender;
  chat?: Chat | null;
  chatReferences?: ReferenceImage[];
  fallbackReferenceUrl?: string | null;
}

async function runGeneration({
  scenarioId,
  row,
  prompt,
  tag,
  gender,
  chat,
  chatReferences = [],
  fallbackReferenceUrl,
}: RunGenerationArgs): Promise<string> {
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

  if (MOCK_MODE) {
    console.log(`${tag} [MOCK] placeholder 사용`);
    return uploadImageFromUrl(supabase, {
      bucket: CHAR_BUCKET,
      path: charPath(scenarioId, row.page_number, gender),
      url: PLACEHOLDER_CHAR(scenarioId, row.page_number, gender),
      upsert: false,
    });
  }

  console.log(`${tag} Gemini 호출 시작`);
  let image: GeminiImageResult;
  if (chat) {
    image = await generateNextPageInSession(chat, prompt, chatReferences, {
      tag,
      pageNumber: row.page_number,
    });
  } else if (fallbackReferenceUrl) {
    image = await generateImageWithReferences(
      prompt,
      [{ url: fallbackReferenceUrl }],
      {
        tag,
        pageNumber: row.page_number,
      }
    );
  } else {
    throw new Error("chat 세션과 fallbackReferenceUrl 모두 없음");
  }

  console.log(`${tag} Gemini 완료, Storage 업로드 시작`);
  return uploadImageBuffer(supabase, {
    bucket: CHAR_BUCKET,
    path: charPath(scenarioId, row.page_number, gender),
    buffer: image.buffer,
    contentType: image.mimeType,
    upsert: false,
  });
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

  // 풀배치: 1페이지부터 시작하는 경우 chat 세션으로 캐릭터 일관성 확보
  let chat: Chat | null = null;
  let chatFailureStreak = 0;
  const shouldUseChat =
    !MOCK_MODE && firstPageRow && isEligible(firstPageRow);

  // 1페이지: 배경 위에 캐릭터 추가 (chat 세션 시작점)
  if (firstPageRow && isEligible(firstPageRow)) {
    const page = scenario.pages.find((p) => p.pageNumber === 1);
    if (page && firstPageRow.image_url) {
      const tag = `[CHAR:${gender}] ${scenarioId} p1 (first)`;
      const prompt = buildFirstPagePrompt(scenarioId, page, gender);
      try {
        if (shouldUseChat) {
          chat = createStoryChatSession();
        }

        let chatReferences: ReferenceImage[] = [];
        if (chat) {
          chatReferences = [await fetchReferenceImage(firstPageRow.image_url)];
        }

        const url = await runGeneration({
          scenarioId,
          row: firstPageRow,
          prompt,
          tag,
          gender,
          chat,
          chatReferences,
          fallbackReferenceUrl: chat ? null : firstPageRow.image_url,
        });
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
        // 1페이지 실패 시 chat 세션 유지 불가 → partial 모드로 강등
        chat = null;
      }
    }
  }

  // 2~12페이지
  const restTargets = typedRows
    .filter((r) => r.page_number !== 1 && isEligible(r))
    .sort((a, b) => a.page_number - b.page_number);

  if (restTargets.length === 0) {
    console.log(`[CHAR:${gender}] ${scenarioId}: 2p 이후 생성 대상 없음`);
    return;
  }

  // chat 세션이 없으면 (partial 모드 또는 1페이지 실패) refUrl 기반으로 동작
  let referenceUrl: string | null = null;
  if (!chat) {
    const { data: refRow } = await supabase
      .from("moobook_scenario_backgrounds")
      .select(refCol)
      .eq("scenario_id", scenarioId)
      .eq("page_number", 1)
      .maybeSingle();

    referenceUrl = (refRow as Record<string, string | null> | null)?.[
      refCol
    ] ?? null;

    if (!referenceUrl) {
      console.warn(
        `[CHAR:${gender}] ${scenarioId}: 레퍼런스 미설정으로 2p 이후 생성 스킵`
      );
      return;
    }
  }

  console.log(
    `[CHAR:${gender}] ${scenarioId}: 2p 이후 ${restTargets.length}페이지 생성 시작 (${chat ? "chat 세션" : "refUrl"})`
  );

  for (let i = 0; i < restTargets.length; i++) {
    const row = restTargets[i];
    const page = scenario.pages.find((p) => p.pageNumber === row.page_number);
    if (!page) continue;

    const tag = `[CHAR:${gender}] ${scenarioId} p${row.page_number} (${chat ? "chat" : "ref"})`;
    const prompt = buildReferenceBasedPrompt(scenarioId, page, gender);

    try {
      const url = await runGeneration({
        scenarioId,
        row,
        prompt,
        tag,
        gender,
        chat,
        chatReferences: [],
        fallbackReferenceUrl: chat ? null : referenceUrl,
      });
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
      chatFailureStreak = 0;

      if (i < restTargets.length - 1 && !MOCK_MODE) {
        await sleep(2000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await markFailed(scenarioId, row.page_number, gender, msg);

      if (chat) {
        chatFailureStreak++;
        if (chatFailureStreak >= 2) {
          console.warn(
            `[CHAR:${gender}] ${scenarioId}: chat 세션 2연속 실패 → refUrl 경로로 강등`
          );
          chat = null;
          const { data: refRow } = await supabase
            .from("moobook_scenario_backgrounds")
            .select(refCol)
            .eq("scenario_id", scenarioId)
            .eq("page_number", 1)
            .maybeSingle();
          referenceUrl = (refRow as Record<string, string | null> | null)?.[
            refCol
          ] ?? null;
          if (!referenceUrl) {
            console.warn(
              `[CHAR:${gender}] ${scenarioId}: refUrl 없음 → 이후 페이지 스킵`
            );
            break;
          }
        }
      }
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
