-- Storage 버킷 moobook_illustrations 생성 (public, 10MB, png/jpeg/webp)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moobook_illustrations',
  'moobook_illustrations',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 공개 읽기 정책 (public 버킷이므로 SELECT는 이미 anonymous 허용이지만 명시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'moobook_illustrations_public_read'
  ) THEN
    CREATE POLICY "moobook_illustrations_public_read" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'moobook_illustrations');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'moobook_illustrations_service_write'
  ) THEN
    CREATE POLICY "moobook_illustrations_service_write" ON storage.objects
      FOR ALL TO service_role
      USING (bucket_id = 'moobook_illustrations')
      WITH CHECK (bucket_id = 'moobook_illustrations');
  END IF;
END $$;
