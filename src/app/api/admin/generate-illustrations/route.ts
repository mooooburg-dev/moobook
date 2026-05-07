import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import OpenAI, { toFile } from "openai";
import type {
  ImageEditParamsNonStreaming,
  ImageGenerateParamsNonStreaming,
} from "openai/resources/images";
import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios, type PresetThemeId } from "@/lib/scenarios";
import {
  buildSessionSystemPrompt,
  buildPagePrompt,
  buildSinglePageRegenerationPrompt,
} from "@/lib/scenarios/character-prompts";
import {
  createStoryChatSession,
  generateImageWithReferences,
  generateNextPageInSession,
  isGeminiMockMode,
  primeCharacterSession,
  type GeminiImageResult,
} from "@/lib/gemini";
import {
  DEFAULT_SCENARIO_IMAGE_MODEL_ID,
  findScenarioImageModel,
  isValidScenarioImageModelId,
  type ScenarioImageModel,
} from "@/lib/scenario-image-models";
import type { Chat } from "@google/genai";
import {
  uploadImageBuffer,
  uploadImageFromUrl,
} from "@/lib/storage/upload-image";
import type { ChildGender } from "@/types";

const PLACEHOLDER_URL = (
  scenarioId: string,
  gender: ChildGender,
  pageNumber: number
) =>
  `https://placehold.co/768x1024/e8d5f5/7c3aed?text=${scenarioId}+${gender}+p${pageNumber}`;

const ILLUSTRATION_BUCKET = "moobook_illustrations";
const illustrationPath = (
  scenarioId: string,
  gender: ChildGender,
  pageNumber: number
) => `${scenarioId}/${gender}/page_${String(pageNumber).padStart(2, "0")}.png`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidScenarioId(id: string): id is PresetThemeId {
  return id in scenarios;
}

function isValidGender(value: unknown): value is ChildGender {
  return value === "boy" || value === "girl";
}

type IllustrationMutationRow = {
  scenario_id: PresetThemeId;
  page_number: number;
  gender: ChildGender;
  status: "pending" | "generating" | "completed";
  image_url?: string | null;
  prompt_used?: string;
  session_id?: string;
  image_model?: string;
  updated_at: string;
};

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

function isMissingImageModelColumnError(error: { message?: string }) {
  return (
    typeof error.message === "string" &&
    error.message.toLowerCase().includes("image_model")
  );
}

async function upsertIllustrationRow(row: IllustrationMutationRow) {
  const supabase = createAdminClient();
  const write = async (payload: IllustrationMutationRow) =>
    supabase
      .from("moobook_scenario_illustrations")
      .upsert(payload, { onConflict: "scenario_id,page_number,gender" });

  let { error } = await write(row);
  if (error && row.image_model && isMissingImageModelColumnError(error)) {
    const fallbackRow: IllustrationMutationRow = { ...row };
    delete fallbackRow.image_model;
    console.warn(
      "[ILL] image_model 컬럼이 없어 모델 기록 없이 일러스트 상태를 저장합니다. supabase/migrations/014_scenario_illustration_image_model.sql 적용 필요"
    );
    ({ error } = await write(fallbackRow));
  }

  if (error) {
    throw new Error(`일러스트 DB 저장 실패: ${error.message}`);
  }
}

async function upsertGenerating(
  scenarioId: PresetThemeId,
  gender: ChildGender,
  pageNumber: number,
  prompt: string,
  sessionId: string,
  modelId: string
) {
  await upsertIllustrationRow({
    scenario_id: scenarioId,
    page_number: pageNumber,
    gender,
    status: "generating",
    prompt_used: prompt,
    session_id: sessionId,
    image_model: modelId,
    updated_at: new Date().toISOString(),
  });
}

async function markCompleted(
  scenarioId: PresetThemeId,
  gender: ChildGender,
  pageNumber: number,
  url: string,
  modelId: string
) {
  console.log(
    `[ILL:${gender}] ${scenarioId} p${pageNumber} DB completed upsert start model=${modelId} url=${url}`
  );
  await upsertIllustrationRow({
    scenario_id: scenarioId,
    page_number: pageNumber,
    gender,
    image_url: url,
    status: "completed",
    image_model: modelId,
    updated_at: new Date().toISOString(),
  });
  console.log(
    `[ILL:${gender}] ${scenarioId} p${pageNumber} DB completed upsert complete model=${modelId}`
  );
}

async function markFailed(
  scenarioId: PresetThemeId,
  gender: ChildGender,
  pageNumber: number,
  msg: string,
  modelId: string
) {
  console.error(
    `[ILL:${gender}] ${scenarioId} p${pageNumber} 실패: ${msg}`
  );
  await upsertIllustrationRow({
    scenario_id: scenarioId,
    page_number: pageNumber,
    gender,
    status: "pending",
    image_model: modelId,
    updated_at: new Date().toISOString(),
  });
}

async function persistImageResult(
  scenarioId: PresetThemeId,
  gender: ChildGender,
  pageNumber: number,
  image: GeminiImageResult,
  modelId: string
): Promise<string> {
  const supabase = createAdminClient();
  const path = illustrationPath(scenarioId, gender, pageNumber);
  console.log(
    `[ILL:${gender}] ${scenarioId} p${pageNumber} storage upload start path=${path} model=${modelId} bytes=${image.buffer.length} mime=${image.mimeType}`
  );
  const url = await uploadImageBuffer(supabase, {
    bucket: ILLUSTRATION_BUCKET,
    path,
    buffer: image.buffer,
    contentType: image.mimeType,
    upsert: true,
  });
  console.log(
    `[ILL:${gender}] ${scenarioId} p${pageNumber} storage upload complete path=${path} url=${url}`
  );
  return url;
}

async function persistPlaceholder(
  scenarioId: PresetThemeId,
  gender: ChildGender,
  pageNumber: number
): Promise<string> {
  const supabase = createAdminClient();
  return uploadImageFromUrl(supabase, {
    bucket: ILLUSTRATION_BUCKET,
    path: illustrationPath(scenarioId, gender, pageNumber),
    url: PLACEHOLDER_URL(scenarioId, gender, pageNumber),
    upsert: true,
  });
}

async function getFirstPageUrl(
  scenarioId: PresetThemeId,
  gender: ChildGender
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("moobook_scenario_illustrations")
    .select("image_url, status")
    .eq("scenario_id", scenarioId)
    .eq("gender", gender)
    .eq("page_number", 1)
    .maybeSingle();
  if (!data?.image_url) return null;
  if (data.status !== "completed" && data.status !== "approved") return null;
  return data.image_url;
}

function isMockMode(modelConfig: ScenarioImageModel): boolean {
  if (process.env.USE_MOCK_AI === "true") return true;
  if (modelConfig.provider === "gemini") return isGeminiMockMode();
  return !process.env.OPENAI_API_KEY;
}

async function fetchAsOpenAIFile(url: string, fallbackName: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`참조 이미지 fetch 실패 (${fallbackName}): ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/png";
  const ext = contentType.includes("jpeg")
    ? "jpg"
    : contentType.includes("webp")
      ? "webp"
      : "png";
  return toFile(Buffer.from(arrayBuffer), `${fallbackName}.${ext}`, {
    type: contentType,
  });
}

function extractOpenAIImageBuffer(response: {
  data?: Array<{ b64_json?: string }>;
}) {
  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI 응답에 b64_json 이 없습니다.");
  }
  return {
    buffer: Buffer.from(b64, "base64"),
    mimeType: "image/png",
  };
}

async function generateOpenAIFromText(
  prompt: string,
  modelId: string
): Promise<GeminiImageResult> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const options: ImageGenerateParamsNonStreaming = {
    model: modelId,
    prompt,
    size: "1024x1536",
    quality: "high",
  };
  const response = await openai.images.generate(options);
  const image = extractOpenAIImageBuffer(response);
  console.log(
    `[ILL:openai] text image generated model=${modelId} bytes=${image.buffer.length}`
  );
  return image;
}

async function generateOpenAIWithReferences(
  prompt: string,
  references: Array<{ url: string }>,
  modelId: string
): Promise<GeminiImageResult> {
  if (references.length === 0) {
    return generateOpenAIFromText(prompt, modelId);
  }

  const files = await Promise.all(
    references.map((ref, idx) =>
      fetchAsOpenAIFile(ref.url, `scenario-reference-${idx + 1}`)
    )
  );
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const options: ImageEditParamsNonStreaming = {
    model: modelId,
    image: files,
    prompt,
    size: "1024x1536",
    quality: "high",
  };
  if (modelId !== "gpt-image-2") {
    options.input_fidelity = "high";
  }
  const response = await openai.images.edit(options);
  const image = extractOpenAIImageBuffer(response);
  console.log(
    `[ILL:openai] reference image generated model=${modelId} refs=${references.length} bytes=${image.buffer.length}`
  );
  return image;
}

async function generateWithReferencesByModel(
  prompt: string,
  references: Array<{ url: string }>,
  modelConfig: ScenarioImageModel,
  opts: { tag: string; pageNumber: number; appendStyle?: boolean }
): Promise<GeminiImageResult> {
  if (modelConfig.provider === "gemini") {
    return generateImageWithReferences(prompt, references, {
      tag: opts.tag,
      pageNumber: opts.pageNumber,
      appendStyle: opts.appendStyle,
    });
  }
  return generateOpenAIWithReferences(prompt, references, modelConfig.id);
}

/**
 * 이전 실행 중 서버 재시작 등으로 generating 상태로 stuck된 레코드를 pending으로 복원.
 * updated_at이 5분 이상 지난 것만 stale로 간주.
 */
async function resetStaleGenerating(
  scenarioId: PresetThemeId,
  gender: ChildGender
) {
  const supabase = createAdminClient();
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("moobook_scenario_illustrations")
    .update({ status: "pending", updated_at: new Date().toISOString() })
    .eq("scenario_id", scenarioId)
    .eq("gender", gender)
    .eq("status", "generating")
    .lt("updated_at", fiveMinAgo)
    .select("page_number");
  if (error) {
    console.warn(
      `[ILL:${gender}] ${scenarioId}: stale reset 실패 ${error.message}`
    );
    return;
  }
  if (data && data.length > 0) {
    console.log(
      `[ILL:${gender}] ${scenarioId}: stale generating ${data.length}개 리셋 (p${data.map((r) => r.page_number).join(",")})`
    );
  }
}

async function generateBatch(
  scenarioId: PresetThemeId,
  gender: ChildGender,
  pageNumbers: number[] | null,
  modelConfig: ScenarioImageModel
) {
  const modelId = modelConfig.id;
  const mockMode = isMockMode(modelConfig);
  console.log(
    `[ILL:${gender}] ${scenarioId}: generateBatch 진입 (model=${modelId})`
  );
  const scenario = scenarios[scenarioId];
  const systemPrompt = buildSessionSystemPrompt(gender);
  const sessionId = randomUUID();

  try {
    await resetStaleGenerating(scenarioId, gender);
  } catch (err) {
    console.error(
      `[ILL:${gender}] ${scenarioId}: resetStaleGenerating 예외 ${err instanceof Error ? err.message : err}`
    );
  }

  const targetPages = (
    pageNumbers
      ? scenario.pages.filter((p) => pageNumbers.includes(p.pageNumber))
      : scenario.pages
  ).sort((a, b) => a.pageNumber - b.pageNumber);

  if (targetPages.length === 0) {
    console.log(`[ILL:${gender}] ${scenarioId}: 생성 대상 없음`);
    return;
  }

  console.log(
    `[ILL:${gender}] ${scenarioId}: ${targetPages.length}개 페이지 생성 시작 (session=${sessionId.slice(0, 8)})`
  );

  const startsAtPageOne = targetPages[0].pageNumber === 1;

  // 단건/일부 재생성 (1페이지 없음) — anchor로 1페이지 이미지 사용
  if (!startsAtPageOne) {
    const firstPageUrl = await getFirstPageUrl(scenarioId, gender);
    if (!firstPageUrl && !mockMode) {
      console.warn(
        `[ILL:${gender}] ${scenarioId}: 1페이지 이미지 없음 → 단건 재생성 불가`
      );
      return;
    }

    for (let i = 0; i < targetPages.length; i++) {
      const page = targetPages[i];
      const tag = `[ILL:${gender}] ${scenarioId} p${page.pageNumber} (anchor)`;
      const prompt = buildSinglePageRegenerationPrompt(scenarioId, page, gender);

      try {
        await upsertGenerating(
          scenarioId,
          gender,
          page.pageNumber,
          prompt,
          sessionId,
          modelId
        );

        let url: string;
        if (mockMode) {
          url = await persistPlaceholder(
            scenarioId,
            gender,
            page.pageNumber
          );
        } else {
          const image = await generateWithReferencesByModel(
            prompt,
            [{ url: firstPageUrl! }],
            modelConfig,
            { tag, pageNumber: page.pageNumber, appendStyle: false }
          );
          url = await persistImageResult(
            scenarioId,
            gender,
            page.pageNumber,
            image,
            modelId
          );
        }

        await markCompleted(scenarioId, gender, page.pageNumber, url, modelId);
        console.log(`${tag} 완료`);

        if (i < targetPages.length - 1 && !mockMode) {
          await sleep(3000);
        }
      } catch (err) {
        await markFailed(
          scenarioId,
          gender,
          page.pageNumber,
          err instanceof Error ? err.message : String(err),
          modelId
        );
      }
    }

    console.log(`[ILL:${gender}] ${scenarioId}: 단건 배치 완료`);
    return;
  }

  // 풀배치 (1페이지부터) — chat 세션 priming 후 연속 생성
  let chat: Chat | null = null;
  let chatFailureStreak = 0;

  if (!mockMode && modelConfig.provider === "gemini") {
    chat = createStoryChatSession();
    if (chat) {
      try {
        await primeCharacterSession(chat, systemPrompt, {
          tag: `[ILL:${gender}] ${scenarioId} prime`,
        });
      } catch (err) {
        console.warn(
          `[ILL:${gender}] ${scenarioId}: priming 실패 → chat 포기 (${err instanceof Error ? err.message : err})`
        );
        chat = null;
      }
    }
  }

  for (let i = 0; i < targetPages.length; i++) {
    const page = targetPages[i];
    const tag = `[ILL:${gender}] ${scenarioId} p${page.pageNumber} (${
      chat ? "chat" : modelConfig.provider
    })`;
    const pagePrompt =
      modelConfig.provider === "openai"
        ? buildSinglePageRegenerationPrompt(scenarioId, page, gender)
        : buildPagePrompt(scenarioId, page);

    try {
      await upsertGenerating(
        scenarioId,
        gender,
        page.pageNumber,
        pagePrompt,
        sessionId,
        modelId
      );

      let url: string;
      if (mockMode) {
        url = await persistPlaceholder(
          scenarioId,
          gender,
          page.pageNumber
        );
      } else if (chat) {
        const image = await generateNextPageInSession(chat, pagePrompt, [], {
          tag,
          pageNumber: page.pageNumber,
          skipStyleSuffix: true,
          skipAspectDirective: true,
        });
        url = await persistImageResult(
          scenarioId,
          gender,
          page.pageNumber,
          image,
          modelId
        );
      } else {
        // chat 포기 후 fallback: 1페이지가 이미 있으면 anchor, 없으면 단건 단독 생성
        const firstPageUrl =
          page.pageNumber === 1
            ? null
            : await getFirstPageUrl(scenarioId, gender);
        const fallbackPrompt = buildSinglePageRegenerationPrompt(
          scenarioId,
          page,
          gender
        );
        const image = await generateWithReferencesByModel(
          fallbackPrompt,
          firstPageUrl ? [{ url: firstPageUrl }] : [],
          modelConfig,
          { tag, pageNumber: page.pageNumber, appendStyle: false }
        );
        url = await persistImageResult(
          scenarioId,
          gender,
          page.pageNumber,
          image,
          modelId
        );
      }

      await markCompleted(scenarioId, gender, page.pageNumber, url, modelId);
      console.log(`${tag} 완료`);
      chatFailureStreak = 0;

      if (i < targetPages.length - 1 && !mockMode) {
        await sleep(3000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await markFailed(scenarioId, gender, page.pageNumber, msg, modelId);

      if (chat) {
        chatFailureStreak++;
        if (chatFailureStreak >= 2) {
          console.warn(
            `[ILL:${gender}] ${scenarioId}: chat 2연속 실패 → fallback 경로로 강등`
          );
          chat = null;
        }
      }
    }
  }

  console.log(`[ILL:${gender}] ${scenarioId}: 풀배치 완료`);
}

/**
 * POST /api/admin/generate-illustrations
 * body: { scenarioId, gender, pageNumbers?, model? }
 * 즉시 202 응답 후 백그라운드에서 생성
 */
export async function POST(request: NextRequest) {
  console.log("[ILL] POST 진입");
  if (!(await verifyAdmin())) {
    console.warn("[ILL] 인증 실패");
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { scenarioId, gender, pageNumbers, model } = body;
    console.log(
      `[ILL] 요청 body: scenarioId=${scenarioId} gender=${gender} pageNumbers=${JSON.stringify(pageNumbers)} model=${model}`
    );

    if (!scenarioId || !isValidScenarioId(scenarioId)) {
      console.warn(`[ILL] 유효하지 않은 scenarioId: ${scenarioId}`);
      return NextResponse.json(
        { error: "유효하지 않은 scenarioId" },
        { status: 400 }
      );
    }
    if (!isValidGender(gender)) {
      console.warn(`[ILL] 유효하지 않은 gender: ${gender}`);
      return NextResponse.json(
        { error: "유효하지 않은 gender (boy|girl)" },
        { status: 400 }
      );
    }

    const pages =
      Array.isArray(pageNumbers) &&
      pageNumbers.every(
        (n) => typeof n === "number" && n >= 1 && n <= 12
      )
        ? pageNumbers
        : null;
    if (model && !isValidScenarioImageModelId(model)) {
      return NextResponse.json(
        { error: `사용할 수 없는 이미지 모델: ${model}` },
        { status: 400 }
      );
    }

    const modelId = model ?? DEFAULT_SCENARIO_IMAGE_MODEL_ID;
    const modelConfig = findScenarioImageModel(modelId);
    if (!modelConfig) {
      return NextResponse.json(
        { error: `알 수 없는 이미지 모델: ${modelId}` },
        { status: 400 }
      );
    }

    console.log(
      `[ILL] 배치 시작: ${scenarioId} ${gender} pages=${pages ? pages.join(",") : "ALL"} model=${modelId}`
    );
    generateBatch(scenarioId, gender, pages, modelConfig).catch((err) => {
      console.error(`[ILL:${gender}] ${scenarioId} 배치 실패:`, err);
    });

    return NextResponse.json(
      {
        success: true,
        message: `${scenarioId} (${gender}) 일러스트 생성이 시작되었습니다`,
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("[ILL] POST 처리 중 예외:", err);
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
}
