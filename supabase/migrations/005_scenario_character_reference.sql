-- 1페이지 캐릭터 결과를 "레퍼런스"로 저장. 2~12페이지는 이 이미지를 input_image로 사용.
-- 시나리오당 1개만 사용되므로 1페이지 행에만 값이 들어가고, 나머지는 NULL.
ALTER TABLE moobook_scenario_backgrounds
  ADD COLUMN IF NOT EXISTS reference_image_url text;
