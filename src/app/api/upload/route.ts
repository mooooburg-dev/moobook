import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 3;

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "JPG, PNG, WEBP 형식만 지원합니다.";
  }
  if (file.size > MAX_BYTES) {
    return "파일 크기는 10MB 이하여야 합니다.";
  }
  return null;
}

async function uploadOne(
  supabase: ReturnType<typeof createAdminClient>,
  file: File
): Promise<{ url: string } | { error: string }> {
  const validationError = validateFile(file);
  if (validationError) return { error: validationError };

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `uploads/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("moobook_photos")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage 업로드 실패:", uploadError);
    return { error: "사진 업로드에 실패했습니다." };
  }

  const { data: urlData } = supabase.storage
    .from("moobook_photos")
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const multi = formData.getAll("files") as File[];
    const single = formData.get("file") as File | null;
    const files: File[] = multi.length > 0 ? multi : single ? [single] : [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "파일이 필요합니다." },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `최대 ${MAX_FILES}장까지 업로드 가능합니다.` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const results = await Promise.all(files.map((f) => uploadOne(supabase, f)));

    const failed = results.find((r) => "error" in r);
    if (failed) {
      return NextResponse.json({ error: (failed as { error: string }).error }, {
        status: 400,
      });
    }

    const urls = (results as { url: string }[]).map((r) => r.url);

    // 호환성: 단일 업로드 시 기존 응답 형식도 함께 반환
    return NextResponse.json({ url: urls[0], urls });
  } catch (error) {
    console.error("업로드 처리 실패:", error);
    return NextResponse.json(
      { error: "업로드 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
