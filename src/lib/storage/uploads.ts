import { createAdminClient } from "@/lib/supabase/admin";

/** 사용자 업로드 원본 사진 전용 private 버킷 */
export const UPLOADS_BUCKET = "moobook_uploads";

/** signed URL 유효기간(초). 사진 TTL(24h)과 맞춘다. */
export const UPLOAD_SIGNED_URL_TTL_SEC = 60 * 60 * 24;

/**
 * private 버킷의 object path 에 대한 signed URL 을 발급한다.
 * 실패 시 null.
 */
export async function createUploadSignedUrl(
  supabase: ReturnType<typeof createAdminClient>,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .createSignedUrl(path, UPLOAD_SIGNED_URL_TTL_SEC);
  if (error || !data) {
    console.error("signed URL 발급 실패:", error);
    return null;
  }
  return data.signedUrl;
}

/**
 * uploads 버킷의 public / signed URL 에서 object path 를 역추출한다.
 * (cleanup cron 에서 삭제 대상 경로를 얻기 위함)
 * 형식: .../storage/v1/object/(sign|public)/moobook_uploads/<path>?token=...
 * 우리 버킷 URL 이 아니면 null.
 */
export function extractUploadPath(url: string): string | null {
  if (typeof url !== "string") return null;
  const marker = `/${UPLOADS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rest = url.slice(idx + marker.length);
  const path = rest.split("?")[0];
  return path.length > 0 ? decodeURIComponent(path) : null;
}
