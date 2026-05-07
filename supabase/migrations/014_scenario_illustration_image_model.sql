-- 시나리오 일러스트 생성에 사용한 이미지 모델 기록
-- 기존 레코드는 기존 Gemini 생성 흐름으로 간주해 백필한다.

ALTER TABLE moobook_scenario_illustrations
  ADD COLUMN IF NOT EXISTS image_model text;

UPDATE moobook_scenario_illustrations
SET image_model = 'gemini-3.1-flash-image-preview'
WHERE image_model IS NULL;
