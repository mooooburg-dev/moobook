import { NextRequest, NextResponse } from "next/server";
import { generatePages } from "@/lib/replicate";
import { getScenario } from "@/lib/scenarios";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ThemeId } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, photoUrl, theme } = body as {
      bookId: string;
      photoUrl: string;
      theme: ThemeId;
    };

    if (!bookId || !photoUrl || !theme) {
      return NextResponse.json(
        { error: "bookId, photoUrl, theme은 필수 값입니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const scenario = getScenario(theme);

    // book 조회
    const { data: book, error: fetchError } = await supabase
      .from("moobook_books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (fetchError || !book) {
      return NextResponse.json(
        { error: "해당 동화책을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 생성 중이거나 완료된 경우 스킵
    if (book.status !== "pending") {
      return NextResponse.json({ bookId, status: book.status });
    }

    // status를 generating으로 업데이트
    await supabase
      .from("moobook_books")
      .update({ status: "generating" })
      .eq("id", bookId);

    // 이미지 생성 (동기 방식 - mock이면 즉시, 실제면 순차 호출)
    const imageUrls = await generatePages({
      photoUrl,
      scenario,
      childName: book.child_name || "주인공",
      bookId,
    });

    // 미리보기용 이미지 (처음 3장)
    const previewPages = imageUrls.slice(0, 3);

    // DB 업데이트: all_pages, preview_pages, status
    const { error: updateError } = await supabase
      .from("moobook_books")
      .update({
        all_pages: imageUrls,
        preview_pages: previewPages,
        status: "preview_ready",
      })
      .eq("id", bookId);

    if (updateError) {
      console.error("Book 업데이트 실패:", updateError);
      return NextResponse.json(
        { error: "동화책 상태 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bookId,
      status: "preview_ready",
      pageCount: imageUrls.length,
    });
  } catch (error) {
    console.error("이미지 생성 트리거 실패:", error);
    return NextResponse.json(
      { error: "이미지 생성을 시작할 수 없습니다." },
      { status: 500 }
    );
  }
}
