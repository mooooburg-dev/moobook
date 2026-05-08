import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateImageWithModel } from "@/lib/image-generators";
import { uploadImageBuffer } from "@/lib/storage/upload-image";
import { getDefaultImageModel } from "@/lib/openai-image";
import { buildAnchoredPagePrompt } from "@/lib/scenarios/character-prompts";
import { getScenario } from "@/lib/scenarios";
import {
  acquireFaceCandidatesLock,
  runFaceCandidatesGeneration,
  selectAnchorForBook,
} from "@/lib/face-candidates/service";
import type { Book, ChildGender, PhotoAsset, ThemeId } from "@/types";

export const maxDuration = 300;

const SMOKE_BUCKET = "moobook_photos";
const SMOKE_PREFIX = "smoke";

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  return auth?.value === process.env.ADMIN_PASSWORD;
}

interface SmokeBody {
  photoUrls: string[];
  gender?: ChildGender;
  themeId?: ThemeId;
  /** 어느 페이지를 테스트로 1장 생성할지. 기본 1(커버) */
  pageNumber?: number;
  /** 모델 ID 직접 지정 (없으면 env/기본 chain) */
  model?: string;
}

/**
 * POST /api/admin/face-anchor-smoke
 *
 * "사진 → 후보 → anchor → page 1장" 전체 흐름을 단일 호출로 검증.
 * Codex #5 반영: self-fetch 대신 service helper 직접 호출.
 */
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  let body: SmokeBody;
  try {
    body = (await request.json()) as SmokeBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 body" }, { status: 400 });
  }
  if (!Array.isArray(body.photoUrls) || body.photoUrls.length === 0) {
    return NextResponse.json(
      { error: "photoUrls 가 필요합니다." },
      { status: 400 }
    );
  }

  const gender: ChildGender = body.gender ?? "boy";
  const themeId: ThemeId = body.themeId ?? "forest-adventure";
  const pageNumber = body.pageNumber ?? 1;
  const modelId = body.model ?? getDefaultImageModel();

  const scenario = getScenario(themeId);
  if (!scenario) {
    return NextResponse.json(
      { error: `시나리오를 찾을 수 없음: ${themeId}` },
      { status: 400 }
    );
  }
  const page = scenario.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) {
    return NextResponse.json(
      { error: `pageNumber ${pageNumber} 가 시나리오에 없음` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 1) 임시 book 생성
  const photos: PhotoAsset[] = body.photoUrls.map((url, i) => ({
    url,
    order: i,
    isPrimary: i === 0,
    uploadedAt: new Date().toISOString(),
  }));

  const { data: bookInsert, error: insertError } = await supabase
    .from("moobook_books")
    .insert({
      status: "pending",
      theme: themeId,
      child_gender: gender,
      child_name: "스모크",
      photo_url: body.photoUrls[0],
      photos,
      image_model: modelId,
    })
    .select("*")
    .single();

  if (insertError || !bookInsert) {
    return NextResponse.json(
      { error: insertError?.message ?? "book 생성 실패" },
      { status: 500 }
    );
  }

  const book = bookInsert as Book;
  const bookId = book.id;
  const stages: Record<string, unknown> = { bookId };
  const startedAt = Date.now();

  // 2) 락 선점 → 후보 생성
  const lock = await acquireFaceCandidatesLock(bookId);
  if (lock.kind !== "locked") {
    return NextResponse.json(
      { error: `예상치 못한 락 상태: ${lock.kind}`, stages },
      { status: 500 }
    );
  }
  let candidateRun;
  try {
    candidateRun = await runFaceCandidatesGeneration({
      bookId,
      gender,
      photos,
      preferredModel: modelId,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "후보 생성 실패",
        stages,
      },
      { status: 500 }
    );
  }
  stages.candidates = {
    elapsedMs: Date.now() - startedAt,
    urls: candidateRun.candidateUrls,
    metadata: candidateRun.metadata,
  };

  // 3) 첫 후보를 anchor로 선택
  const anchorPickAt = Date.now();
  let anchorResult;
  try {
    anchorResult = await selectAnchorForBook(bookId, 0);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "anchor 선택 실패",
        stages,
      },
      { status: 500 }
    );
  }
  stages.anchor = {
    elapsedMs: Date.now() - anchorPickAt,
    url: anchorResult.anchorFaceUrl,
    metadata: anchorResult.anchorMetadata,
  };

  // 4) anchor + 대표 사진으로 페이지 1장 생성
  const pageStartedAt = Date.now();
  try {
    const result = await generateImageWithModel({
      prompt: buildAnchoredPagePrompt(themeId, page, gender, true),
      references: [
        { url: anchorResult.anchorFaceUrl, name: "anchor" },
        { url: body.photoUrls[0], name: "primary-photo" },
      ],
      size: "1024x1536",
      quality: "low",
      modelId,
      tag: "[smoke]",
      pageNumber,
    });

    const pageUrl = await uploadImageBuffer(supabase, {
      bucket: SMOKE_BUCKET,
      path: `${SMOKE_PREFIX}/${bookId}/page_${String(pageNumber).padStart(2, "0")}.png`,
      buffer: result.buffer,
      contentType: result.mimeType,
      upsert: true,
    });

    stages.page = {
      pageNumber,
      elapsedMs: Date.now() - pageStartedAt,
      url: pageUrl,
      modelUsed: result.modelUsed,
      provider: result.provider,
    };
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "페이지 생성 실패",
        stages,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    totalMs: Date.now() - startedAt,
    bookId,
    stages,
  });
}
