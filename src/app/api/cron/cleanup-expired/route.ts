import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { UPLOADS_BUCKET, extractUploadPath } from "@/lib/storage/uploads";
import type { PhotoAsset } from "@/types";

export const maxDuration = 60;

/** 한 번의 실행에서 처리할 최대 book 수 (타임아웃 방지) */
const BATCH_LIMIT = 500;

/**
 * GET /api/cron/cleanup-expired
 *
 * 제로 리텐션: expires_at(업로드 +24h)이 지난 book 의 원본 업로드 사진을
 * private 버킷에서 삭제하고 photos 참조를 비운다. 생성된 일러스트/페이지는 유지한다.
 *
 * Vercel Cron 이 매시간 호출한다(vercel.json). CRON_SECRET 으로 보호.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authz = request.headers.get("authorization");
  if (!secret || authz !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    const { data: books, error } = await supabase
      .from("moobook_books")
      .select("id, photos, photo_url")
      .lt("expires_at", nowIso)
      .not("photos", "is", null)
      .limit(BATCH_LIMIT);

    if (error) {
      console.error("만료 book 조회 실패:", error);
      return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }

    let scrubbedBooks = 0;
    let deletedFiles = 0;

    for (const book of books ?? []) {
      const b = book as { id: string; photos: PhotoAsset[] | null; photo_url: string | null };

      const urls = [
        ...(b.photos ?? []).map((p) => p.url),
        ...(b.photo_url ? [b.photo_url] : []),
      ];
      const paths = Array.from(
        new Set(
          urls
            .map((u) => extractUploadPath(u))
            .filter((p): p is string => p !== null)
        )
      );

      if (paths.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(UPLOADS_BUCKET)
          .remove(paths);
        if (removeError) {
          console.error(`book ${b.id} 파일 삭제 실패:`, removeError);
          continue; // 삭제 실패 시 photos 를 비우지 않고 다음 실행에서 재시도
        }
        deletedFiles += paths.length;
      }

      const { error: updateError } = await supabase
        .from("moobook_books")
        .update({ photos: null })
        .eq("id", b.id);
      if (updateError) {
        console.error(`book ${b.id} photos 스크럽 실패:`, updateError);
        continue;
      }
      scrubbedBooks += 1;
    }

    return NextResponse.json({
      ok: true,
      scrubbedBooks,
      deletedFiles,
      scanned: books?.length ?? 0,
    });
  } catch (err) {
    console.error("cleanup-expired 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
