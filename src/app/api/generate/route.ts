import { NextRequest, NextResponse } from "next/server";
import {
  generatePreviewPages,
  generateRemainingPages,
} from "@/lib/image-pipeline";
import { resolveScenario } from "@/lib/scenarios";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePhotos } from "@/lib/face-candidates/service";
import type { Book } from "@/types";

/**
 * 사용자에게 무료로 노출하는 미리보기 페이지 수.
 * BookPreview의 잠금 오버레이가 마지막 페이지에서 켜지도록, 이 만큼만
 * preview_pages 컬럼에 저장해 클라이언트에 노출한다. 나머지는 all_pages로만.
 */
const PUBLIC_PREVIEW_LIMIT = 3;

export const maxDuration = 300;

const ALLOWED_START_STATUSES = ["pending", "faces_ready"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, photoUrl: bodyPhotoUrl } = body as {
      bookId: string;
      photoUrl?: string;
    };

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId는 필수 값입니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: book, error: fetchError } = await supabase
      .from("moobook_books")
      .select("*")
      .eq("id", bookId)
      .single<Book>();

    if (fetchError || !book) {
      return NextResponse.json(
        { error: "해당 동화책을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    let scenario;
    try {
      scenario = resolveScenario(book);
    } catch (err) {
      console.error("시나리오 해석 실패:", err);
      return NextResponse.json(
        { error: "시나리오 정보가 누락되어 생성을 시작할 수 없습니다." },
        { status: 400 }
      );
    }

    // Codex #10: 대표 사진은 서버에서 resolve. body의 photoUrl은 legacy 호환용으로만 사용.
    const photos = resolvePhotos(book);
    const primary = photos.find((p) => p.isPrimary) ?? photos[0];
    const photoUrl =
      primary?.url ?? book.photo_url ?? bodyPhotoUrl ?? null;
    if (!photoUrl) {
      return NextResponse.json(
        { error: "사진 정보가 없는 book입니다." },
        { status: 400 }
      );
    }

    // Codex #1, #8: conditional update로 atomic 선점.
    // pending → generating 또는 faces_ready → generating 만 허용.
    const { data: locked } = await supabase
      .from("moobook_books")
      .update({ status: "generating" })
      .eq("id", bookId)
      .in("status", ALLOWED_START_STATUSES as unknown as string[])
      .select("status")
      .maybeSingle();

    if (!locked) {
      // 이미 생성 중이거나 완료된 경우 — 현재 상태 그대로 반환
      return NextResponse.json({ bookId, status: book.status });
    }

    // 페이지 한 장 끝날 때마다 DB에 incremental 반영.
    // - preview_pages: 처음 PUBLIC_PREVIEW_LIMIT 장까지만 누적
    // - all_pages: 모든 장 누적 (결제 후 노출)
    const completed = new Map<number, string>();
    const persistProgress = async (pageNumber: number, url: string) => {
      completed.set(pageNumber, url);
      const sortedUrls = Array.from(completed.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, u]) => u);
      const previewSlice = sortedUrls.slice(0, PUBLIC_PREVIEW_LIMIT);
      try {
        await supabase
          .from("moobook_books")
          .update({
            preview_pages: previewSlice,
            all_pages: sortedUrls,
          })
          .eq("id", bookId);
      } catch (err) {
        console.error(
          `[백그라운드] p${pageNumber} 진행 업데이트 실패 (bookId: ${bookId}):`,
          err
        );
      }
    };

    const generateInput = {
      photoUrl,
      scenario,
      childName: book.child_name || "주인공",
      bookId,
      gender: (book.child_gender ?? "boy") as "boy" | "girl",
      anchorFaceUrl: book.anchor_face_url ?? null,
      imageModel: book.image_model ?? null,
      onPageDone: persistProgress,
    };

    // 1단계: preview(현재 1장) 동기 생성. onPageDone 으로 preview_pages가 즉시 채워짐.
    const previewUrls = await generatePreviewPages(generateInput);

    const { error: previewUpdateError } = await supabase
      .from("moobook_books")
      .update({ status: "preview_ready" })
      .eq("id", bookId);

    if (previewUpdateError) {
      console.error("Preview 업데이트 실패:", previewUpdateError);
      return NextResponse.json(
        { error: "미리보기 상태 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    // 2단계: 나머지 페이지 백그라운드 생성. 각 페이지 완료마다 preview_pages가
    // 3장까지 자동으로 채워지고, all_pages는 12장까지 누적된다.
    generateRemainingPages(generateInput)
      .then((remainingUrls) => {
        console.log(
          `[백그라운드] 전체 ${previewUrls.length + remainingUrls.length}페이지 생성 완료 (bookId: ${bookId})`
        );
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
