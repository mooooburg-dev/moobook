import { NextRequest, NextResponse } from "next/server";
import {
  generatePreviewPages,
  generateRemainingPages,
} from "@/lib/replicate";
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

    const generateInput = {
      photoUrl,
      scenario,
      childName: book.child_name || "주인공",
      bookId,
    };

    // 1단계: preview 3페이지 생성 (동기)
    const previewUrls = await generatePreviewPages(generateInput);

    // preview_pages 저장 + status를 preview_ready로 업데이트
    const { error: previewUpdateError } = await supabase
      .from("moobook_books")
      .update({
        preview_pages: previewUrls,
        status: "preview_ready",
      })
      .eq("id", bookId);

    if (previewUpdateError) {
      console.error("Preview 업데이트 실패:", previewUpdateError);
      return NextResponse.json(
        { error: "미리보기 상태 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    // 2단계: 나머지 9페이지 백그라운드 생성 (응답은 먼저 반환)
    generateRemainingPages(generateInput)
      .then(async (remainingUrls) => {
        const allPages = [...previewUrls, ...remainingUrls];
        const { error: updateError } = await supabase
          .from("moobook_books")
          .update({ all_pages: allPages })
          .eq("id", bookId);

        if (updateError) {
          console.error(
            `[백그라운드] all_pages 업데이트 실패 (bookId: ${bookId}):`,
            updateError
          );
        } else {
          console.log(
            `[백그라운드] 전체 ${allPages.length}페이지 생성 완료 (bookId: ${bookId})`
          );
        }
      })
      .catch((err) => {
        console.error(
          `[백그라운드] 나머지 페이지 생성 실패 (bookId: ${bookId}):`,
          err
        );
      });

    return NextResponse.json({
      bookId,
      status: "preview_ready",
      previewCount: previewUrls.length,
      totalPages: scenario.pages.length,
    });
  } catch (error) {
    console.error("이미지 생성 트리거 실패:", error);
    return NextResponse.json(
      { error: "이미지 생성을 시작할 수 없습니다." },
      { status: 500 }
    );
  }
}
