import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

interface UploadBufferArgs {
  bucket: string;
  path: string;
  buffer: Buffer;
  contentType?: string;
  upsert?: boolean;
}

interface UploadFromUrlArgs {
  bucket: string;
  path: string;
  url: string;
  contentType?: string;
  upsert?: boolean;
}

async function uploadAndGetPublicUrl(
  supabase: AdminClient,
  { bucket, path, buffer, contentType, upsert }: UploadBufferArgs
): Promise<string> {
  const effectiveContentType = contentType ?? "image/png";
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: effectiveContentType,
      upsert: upsert ?? true,
    });

  if (uploadError) {
    throw new Error(`Storage 업로드 실패: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Storage publicUrl 조회 실패");
  }
  return data.publicUrl;
}

/**
 * Buffer를 Supabase Storage에 업로드하고 public URL 반환
 */
export async function uploadImageBuffer(
  supabase: AdminClient,
  args: UploadBufferArgs
): Promise<string> {
  return uploadAndGetPublicUrl(supabase, args);
}

/**
 * 외부 URL의 이미지를 fetch해서 Supabase Storage에 업로드
 * (face-swap 등 URL 기반 응답 처리용)
 */
export async function uploadImageFromUrl(
  supabase: AdminClient,
  { bucket, path, url, contentType, upsert }: UploadFromUrlArgs
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`이미지 fetch 실패: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const effectiveContentType =
    contentType ?? res.headers.get("content-type") ?? "image/png";

  return uploadAndGetPublicUrl(supabase, {
    bucket,
    path,
    buffer,
    contentType: effectiveContentType,
    upsert,
  });
}
