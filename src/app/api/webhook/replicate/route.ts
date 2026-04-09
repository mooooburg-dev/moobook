import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const pageNumber = searchParams.get("page");

    if (!bookId || !pageNumber) {
      return NextResponse.json(
        { error: "bookId와 page 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const { status, output } = body;
    const supabase = createAdminClient();
    const pageIdx = parseInt(pageNumber, 10) - 1;

    if (status === "succeeded" && output) {
      // output에서 이미지 URL 추출
      const imageUrl = Array.isArray(output) ? output[0] : output;

      // 현재 book 데이터 조회
      const { data: book } = await supabase
        .from("moobook_books")
        .select("all_pages, preview_pages")
        .eq("id", bookId)
        .single();

      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }

      // all_pages 배열 업데이트
      const allPages: (string | null)[] = book.all_pages || new Array(12).fill(null);
      allPages[pageIdx] = imageUrl;

      // 미리보기 페이지 (처음 3장)
      const previewPages = allPages.slice(0, 3).filter((url): url is string => url !== null);

      // 모든 페이지 완성 여부 확인
      const completedCount = allPages.filter((url) => url !== null).length;
      const isComplete = completedCount === allPages.length;

      await supabase
        .from("moobook_books")
        .update({
          all_pages: allPages,
          preview_pages: previewPages,
          ...(isComplete ? { status: "preview_ready" } : {}),
        })
        .eq("id", bookId);

      console.log(
        `페이지 생성 완료: bookId=${bookId}, page=${pageNumber}, ${completedCount}/12`
      );
    } else if (status === "failed") {
      console.error(
        `페이지 생성 실패: bookId=${bookId}, page=${pageNumber}`,
        body.error
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook 처리 실패:", error);
    return NextResponse.json(
      { error: "Webhook 처리 중 오류 발생" },
      { status: 500 }
    );
  }
}
