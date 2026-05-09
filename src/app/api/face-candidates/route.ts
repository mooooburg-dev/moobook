import { NextRequest, NextResponse } from "next/server";

import {
  acquireFaceCandidatesLock,
  loadBook,
  resolvePhotos,
  runFaceCandidatesGeneration,
  selectAnchorForBook,
} from "@/lib/face-candidates/service";

// 후보 3장 생성에 30~60초 걸릴 수 있어 Vercel max duration 명시 (Codex #9)
export const maxDuration = 300;

interface RequestBody {
  bookId: string;
  /** 강제 재생성. 기존 후보를 새로 만든다. (admin/내부 용도) */
  force?: boolean;
}

/**
 * GET /api/face-candidates?bookId=...
 * 폴링용 — 현재 후보 상태와 URL 반환.
 */
export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId 필요" }, { status: 400 });
  }
  const book = await loadBook(bookId);
  if (!book) {
    return NextResponse.json({ error: "book을 찾을 수 없음" }, { status: 404 });
  }
  return NextResponse.json({
    status: book.status,
    candidates: book.face_candidate_urls ?? [],
    metadata: book.face_candidate_metadata ?? null,
    anchorFaceUrl: book.anchor_face_url ?? null,
  });
}

/**
 * POST /api/face-candidates
 * body: { bookId, force? }
 *
 * Codex #1 반영: conditional update (`acquireFaceCandidatesLock`)으로 race 제거.
 * - locked: 우리가 락을 잡았으므로 실제 생성 진행
 * - in_progress: 다른 호출이 이미 실행 중 — 폴링하라고 응답
 * - ready: 이미 완료 — 현재 결과 반환
 */
export async function POST(request: NextRequest) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 body" }, { status: 400 });
  }
  const { bookId, force } = body;
  if (!bookId) {
    return NextResponse.json({ error: "bookId 필요" }, { status: 400 });
  }

  const lockResult = await acquireFaceCandidatesLock(bookId, { force });
  if (lockResult.kind === "not_found") {
    return NextResponse.json({ error: "book을 찾을 수 없음" }, { status: 404 });
  }
  if (lockResult.kind === "ready") {
    return NextResponse.json({
      status: lockResult.book.status,
      candidates: lockResult.book.face_candidate_urls,
      metadata: lockResult.book.face_candidate_metadata,
      idempotent: true,
    });
  }
  if (lockResult.kind === "in_progress") {
    return NextResponse.json({
      status: lockResult.book.status,
      candidates: [],
      idempotent: true,
      message: "이미 생성 중입니다.",
    });
  }

  const book = lockResult.book;
  const photos = resolvePhotos(book);
  if (photos.length === 0) {
    return NextResponse.json(
      { error: "사진이 업로드되지 않은 book입니다." },
      { status: 400 }
    );
  }

  try {
    const result = await runFaceCandidatesGeneration({
      bookId,
      gender: book.child_gender,
      photos,
      preferredModel: book.image_model,
      lease: lockResult.lease,
    });
    return NextResponse.json({
      status: "faces_ready",
      candidates: result.candidateUrls,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error("[face-candidates] 생성 실패:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "후보 생성 실패" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/face-candidates?bookId=...
 * body: { candidateIndex: number }
 * 부모가 후보 1개를 선택해 anchor로 확정.
 */
export async function PATCH(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId 필요" }, { status: 400 });
  }

  let body: { candidateIndex?: unknown };
  try {
    body = (await request.json()) as { candidateIndex?: unknown };
  } catch {
    return NextResponse.json({ error: "잘못된 요청 body" }, { status: 400 });
  }
  if (
    typeof body.candidateIndex !== "number" ||
    !Number.isInteger(body.candidateIndex) ||
    body.candidateIndex < 0
  ) {
    return NextResponse.json(
      { error: "candidateIndex 는 0 이상의 정수여야 합니다." },
      { status: 400 }
    );
  }

  try {
    const result = await selectAnchorForBook(bookId, body.candidateIndex);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "anchor 선택 실패" },
      { status: 500 }
    );
  }
}
