-- 배경 이미지 위에 캐릭터를 합성한 결과 저장을 위한 컬럼 추가
ALTER TABLE moobook_scenario_backgrounds
  ADD COLUMN IF NOT EXISTS character_image_url text,
  ADD COLUMN IF NOT EXISTS character_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS character_prompt text;

-- character_status: pending → generating → completed → approved (또는 rejected)
