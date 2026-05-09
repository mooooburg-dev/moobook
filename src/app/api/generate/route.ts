import { NextRequest, NextResponse } from "next/server";
import { generateNextPage } from "@/lib/page-generation/service";

/**
 * POST /api/generate
 * body: { bookId }
 *
 * polling-driven 페이지 생성 endpoint.
 * 클라이언트가 폴링하면서 매번 호출하면 서버는 다음 미생성 페이지 1장만 만들고
 * 즉시 응답한다. 모든 페이지 완료 시 done:true. 다른 워커가 진행 중이면 busy.
 *
 * 응답 시간이 30~50초 사이지만 단일 페이지라 dev/prod 모두에서 connection 이
 * 끊겨도 다음 폴링이 자동으로 이어 만든다.
 */
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookId = (body as { bookId?: string }).bookId;
    if (!bookId) {
      return NextResponse.json(
        { error: "bookId는 필수 값입니다." },
        { status: 400 }
      );
    }

    const result = await generateNextPage(bookId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("페이지 생성 실패:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "페이지 생성 실패" },
      { status: 500 }
    );
  }
}
