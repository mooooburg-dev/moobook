import { NextRequest, NextResponse } from "next/server";

import { loadBook } from "@/lib/face-candidates/service";

/**
 * GET /api/books/[bookId]
 * book 상태 폴링용. (RLS 활성화 후 브라우저 직접 SELECT 대체)
 *
 * bookId 는 추측 불가능한 UUID 이므로 이를 capability 로 간주한다.
 * (사용자 인증은 Phase 1 에서 도입 예정)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    if (!bookId) {
      return NextResponse.json({ error: "bookId 필요" }, { status: 400 });
    }

    const book = await loadBook(bookId);
    if (!book) {
      return NextResponse.json(
        { error: "동화책을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ book });
  } catch (err) {
    console.error("GET /api/books/[bookId] 오류:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
