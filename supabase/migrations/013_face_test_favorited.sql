-- face-test 히스토리에 즐겨찾기 플래그 추가
-- 괜찮게 합성된 결과물을 따로 모아 프롬프트/모델 조합을 분석하기 위함.

ALTER TABLE moobook_face_test_results
  ADD COLUMN IF NOT EXISTS favorited boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_moobook_face_test_results_favorited
  ON moobook_face_test_results(favorited)
  WHERE favorited = true;
