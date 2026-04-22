import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI, { toFile } from "openai";

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadImageBuffer } from "@/lib/storage/upload-image";

const FACE_TEST_BUCKET = "moobook_backgrounds";
const FACE_TEST_PREFIX = "face-test";

type Intensity = 1 | 2 | 3 | 4 | 5;

interface FaceTestRequest {
  childPhotoUrl: string;
  illustrationUrl: string;
  intensity: Intensity;
  customPrompt?: string;
}

interface FaceTestResponse {
  resultUrl: string;
  promptUsed: string;
  mock: boolean;
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
 * POST /api/admin/face-test
 * body: { childPhotoUrl, illustrationUrl, intensity, customPrompt? }
 * 아이 사진 + 대상 일러스트를 합성한 결과 이미지 URL 반환.
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

  if (isMockMode()) {
    const payload: FaceTestResponse = {
      resultUrl: `https://placehold.co/1024x1024/e8d5f5/7c3aed?text=face-test+mock+intensity+${intensity}`,
      promptUsed,
      mock: true,
    };
    return NextResponse.json(payload);
  }

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

    const publicUrl = await uploadImageBuffer(supabase, {
      bucket: FACE_TEST_BUCKET,
      path: resultPath,
      buffer,
      contentType: "image/png",
      upsert: true,
    });

    const payload: FaceTestResponse = {
      resultUrl: publicUrl,
      promptUsed,
      mock: false,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[face-test] 합성 실패:", err);
    const message =
      err instanceof Error ? err.message : "얼굴 합성에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
