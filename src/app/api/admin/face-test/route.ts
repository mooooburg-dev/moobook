import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI, { toFile } from "openai";

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImageBuffer } from "@/lib/storage/upload-image";

const FACE_TEST_BUCKET = "moobook_backgrounds";
const FACE_TEST_PREFIX = "face-test";
const HISTORY_LIMIT = 50;

type Intensity = 1 | 2 | 3 | 4 | 5;

interface FaceTestRequest {
  childPhotoUrl: string;
  illustrationUrl: string;
  intensity: Intensity;
  customPrompt?: string;
}

interface FaceTestResultRow {
  id: string;
  child_photo_url: string;
  illustration_url: string;
  result_url: string;
  intensity: number;
  custom_prompt: string | null;
  prompt_used: string;
  storage_path: string | null;
  mock: boolean;
  created_at: string;
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

function isValidIntensity(value: unknown): value is Intensity {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

const INTENSITY_DIRECTIVES: Record<Intensity, string> = {
  1: "extremely subtle illustration effect, 95% realistic, only very slight artistic touch",
  2: "slight illustration effect, mostly realistic face, soft watercolor hint",
  3: "balanced mix of realistic and illustration style, warm watercolor children's book feel",
  4: "illustration style with realistic facial features preserved, clear watercolor children's book style",
  5: "full children's book illustration style, realistic facial features clearly maintained",
};

function buildPrompt(intensity: Intensity, customPrompt?: string): string {
  const directive = INTENSITY_DIRECTIVES[intensity];
  const base =
    `Take the child's face from the first reference photo and blend it into the second reference illustration. ` +
    `Preserve the child's facial identity (eyes, nose, mouth proportions, skin tone, hair color and style). ` +
    `Keep the illustration's overall composition, background, and clothing. ` +
    `Apply this styling: ${directive}. ` +
    `No text, no words, no letters in the final image.`;

  if (customPrompt && customPrompt.trim().length > 0) {
    return `${base}\n\nAdditional direction: ${customPrompt.trim()}`;
  }
  return base;
}

function isMockMode(): boolean {
  return process.env.USE_MOCK_AI === "true" || !process.env.OPENAI_API_KEY;
}

async function fetchAsBlobPart(url: string, fallbackName: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`이미지 fetch 실패 (${fallbackName}): ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/png";
  const ext = contentType.includes("jpeg")
    ? "jpg"
    : contentType.includes("webp")
      ? "webp"
      : "png";
  const filename = `${fallbackName}.${ext}`;
  return await toFile(Buffer.from(arrayBuffer), filename, {
    type: contentType,
  });
}

/**
 * GET /api/admin/face-test
 * 최근 합성 히스토리 HISTORY_LIMIT 개 반환 (created_at desc)
 */
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("moobook_face_test_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: (data ?? []) as FaceTestResultRow[] });
}

/**
 * POST /api/admin/face-test
 * body: { childPhotoUrl, illustrationUrl, intensity, customPrompt? }
 * 아이 사진 + 대상 일러스트를 합성하고 DB에 결과 기록 후 레코드 반환.
 */
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  let body: FaceTestRequest;
  try {
    body = (await request.json()) as FaceTestRequest;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 body" }, { status: 400 });
  }

  const { childPhotoUrl, illustrationUrl, intensity, customPrompt } = body;

  if (!childPhotoUrl || !illustrationUrl) {
    return NextResponse.json(
      { error: "childPhotoUrl 과 illustrationUrl 이 필요합니다." },
      { status: 400 }
    );
  }
  if (!isValidIntensity(intensity)) {
    return NextResponse.json(
      { error: "intensity 는 1~5 사이의 정수여야 합니다." },
      { status: 400 }
    );
  }

  const promptUsed = buildPrompt(intensity, customPrompt);
  const timestamp = Date.now();
  const resultPath = `${FACE_TEST_PREFIX}/${timestamp}.png`;
  const supabase = createAdminClient();

  const mock = isMockMode();
  let resultUrl: string;
  let storagePath: string | null = null;

  if (mock) {
    resultUrl = `https://placehold.co/1024x1024/e8d5f5/7c3aed?text=face-test+mock+intensity+${intensity}`;
  } else {
    try {
      const [childFile, illustrationFile] = await Promise.all([
        fetchAsBlobPart(childPhotoUrl, "child-photo"),
        fetchAsBlobPart(illustrationUrl, "illustration"),
      ]);

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      // TODO(2026-05): gpt-image-2 API 공개 이후 "gpt-image-2"로 전환
      const response = await openai.images.edit({
        model: "gpt-image-1.5",
        image: [childFile, illustrationFile],
        prompt: promptUsed,
        size: "1024x1024",
        input_fidelity: "high",
        quality: "high",
      });

      const b64 = response.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("OpenAI 응답에 b64_json 이 없습니다.");
      }
      const buffer = Buffer.from(b64, "base64");

      resultUrl = await uploadImageBuffer(supabase, {
        bucket: FACE_TEST_BUCKET,
        path: resultPath,
        buffer,
        contentType: "image/png",
        upsert: true,
      });
      storagePath = resultPath;
    } catch (err) {
      console.error("[face-test] 합성 실패:", err);
      const message =
        err instanceof Error ? err.message : "얼굴 합성에 실패했습니다.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("moobook_face_test_results")
    .insert({
      child_photo_url: childPhotoUrl,
      illustration_url: illustrationUrl,
      result_url: resultUrl,
      intensity,
      custom_prompt: customPrompt?.trim() ? customPrompt.trim() : null,
      prompt_used: promptUsed,
      storage_path: storagePath,
      mock,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    console.error("[face-test] DB 저장 실패:", insertError);
    return NextResponse.json(
      { error: insertError?.message ?? "히스토리 저장 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ result: inserted as FaceTestResultRow });
}

/**
 * DELETE /api/admin/face-test?id=xxx
 * 히스토리 레코드 + Storage 이미지 삭제.
 */
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id 필요" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: row, error: fetchError } = await supabase
    .from("moobook_face_test_results")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json(
      { error: fetchError?.message ?? "레코드를 찾을 수 없음" },
      { status: 404 }
    );
  }

  if (row.storage_path) {
    const { error: removeError } = await supabase.storage
      .from(FACE_TEST_BUCKET)
      .remove([row.storage_path]);
    if (removeError) {
      // Storage 삭제 실패해도 DB 레코드는 계속 지운다. (orphan 파일은 추후 정리 가능)
      console.warn("[face-test] Storage 삭제 실패:", removeError);
    }
  }

  const { error: deleteError } = await supabase
    .from("moobook_face_test_results")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
