-- 어드민 얼굴 합성 테스트 (/admin/face-test) 결과 기록
-- 이 테이블은 실제 주문 플로우와 무관하며, 반복 테스트 히스토리를 영구 보존한다.
-- 결과 이미지는 moobook_backgrounds/face-test/<timestamp>.png 에 저장됨.

CREATE TABLE IF NOT EXISTS moobook_face_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_photo_url text NOT NULL,
  illustration_url text NOT NULL,
  result_url text NOT NULL,
  intensity int NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  custom_prompt text,
  prompt_used text NOT NULL,
  storage_path text,
  mock boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moobook_face_test_results_created_at
  ON moobook_face_test_results(created_at DESC);
