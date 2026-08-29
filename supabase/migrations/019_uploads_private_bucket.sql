-- Phase 0 보안/개인정보: 사용자 업로드 사진 전용 private 버킷.
--
-- 기존에는 사용자가 올린 아동 사진이 생성 결과물과 같은 public 버킷
-- (moobook_photos)에 저장되어 만료 없는 공개 URL 로 노출되었다.
-- 원본 업로드만 별도 private 버킷으로 분리한다:
--   - public = false → 익명 접근 불가, 서버(service role)만 signed URL 발급
--   - 24시간 TTL 후 /api/cron/cleanup-expired 가 원본 파일을 삭제 (제로 리텐션)
--
-- 생성 결과물(일러스트/페이지/얼굴 후보)은 계속 moobook_photos(public)에 남는다.

insert into storage.buckets (id, name, public)
values ('moobook_uploads', 'moobook_uploads', false)
on conflict (id) do update set public = false;

-- 별도 storage policy 를 만들지 않으므로 anon/authenticated 는 접근 불가.
-- service_role 은 storage RLS 를 우회하므로 업로드/서명/삭제가 가능하다.
