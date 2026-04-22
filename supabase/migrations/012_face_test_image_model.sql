-- face-test 히스토리에 사용된 이미지 모델 기록
-- 기존 레코드는 gpt-image-1.5 로 가정하고 백필한다.

ALTER TABLE moobook_face_test_results
  ADD COLUMN IF NOT EXISTS image_model text;

UPDATE moobook_face_test_results
SET image_model = 'gpt-image-1.5'
WHERE image_model IS NULL;

ALTER TABLE moobook_face_test_results
  ALTER COLUMN image_model SET NOT NULL;
