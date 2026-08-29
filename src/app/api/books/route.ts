import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { scenarios } from "@/lib/scenarios";
import type { ChildGender, PhotoAsset, ThemeId } from "@/types";

/**
 * POST /api/books
 * book 을 서버에서 생성한다. (RLS 활성화 후 브라우저 직접 INSERT 대체)
 *
 * status=pending 으로 시작하며, 이후 face-select 페이지가
 * /api/face-candidates 로 얼굴 생성 흐름을 이어간다.
 */

function isValidTheme(theme: unknown): theme is ThemeId {
  return (
    typeof theme === "string" &&
    (theme === "custom" || Object.prototype.hasOwnProperty.call(scenarios, theme))
  );
}

function isValidGender(g: unknown): g is ChildGender {
  return g === "boy" || g === "girl";
}

/** 사진 URL 이 우리 Supabase Storage 도메인에서 나온 것인지 검증 (임의 URL 주입 차단) */
function isOwnStorageUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length === 0) return false;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  // private 버킷 업로드는 signed URL(.../object/sign/...), 그 외 public URL 도 허용
  return (
    url.startsWith(`${base}/storage/v1/object/sign/`) ||
    url.startsWith(`${base}/storage/v1/object/public/`)
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 });
    }

    const {
      theme,
      childName,
      childGender,
      photos: rawPhotos,
    } = (body ?? {}) as {
      theme?: unknown;
      childName?: unknown;
      childGender?: unknown;
      photos?: unknown;
    };

    if (!isValidTheme(theme)) {
      return NextResponse.json(
        { error: "유효하지 않은 테마입니다." },
        { status: 400 }
      );
    }

    const name = typeof childName === "string" ? childName.trim() : "";
    if (name.length < 1 || name.length > 20) {
      return NextResponse.json(
        { error: "이름은 1~20자로 입력해주세요." },
        { status: 400 }
      );
    }

    if (!isValidGender(childGender)) {
      return NextResponse.json(
        { error: "성별 값이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (!Array.isArray(rawPhotos) || rawPhotos.length < 1 || rawPhotos.length > 3) {
      return NextResponse.json(
        { error: "사진은 1~3장 필요합니다." },
        { status: 400 }
      );
    }

    // 클라이언트가 보낸 photos 를 신뢰하지 않고, url 출처만 검증한 뒤
    // order/isPrimary/uploadedAt 은 서버에서 재구성한다.
    const uploadedAt = new Date().toISOString();
    const photos: PhotoAsset[] = [];
    for (let i = 0; i < rawPhotos.length; i++) {
      const p = rawPhotos[i] as { url?: unknown } | null;
      const url = p?.url;
      if (!isOwnStorageUrl(url)) {
        return NextResponse.json(
          { error: "유효하지 않은 사진 URL 입니다." },
          { status: 400 }
        );
      }
      photos.push({ url, order: i, isPrimary: i === 0, uploadedAt });
    }

    const supabase = createAdminClient();
    const { data: book, error: insertError } = await supabase
      .from("moobook_books")
      .insert({
        status: "pending",
        theme,
        child_name: name,
        child_gender: childGender,
        photo_url: photos[0].url,
        photos,
      })
      .select("id")
      .single();

    if (insertError || !book) {
      console.error("book 생성 실패:", insertError);
      return NextResponse.json(
        { error: "동화책 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: book.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/books 오류:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
