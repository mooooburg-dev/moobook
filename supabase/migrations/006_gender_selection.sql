-- 남아/여아 성별 선택 기능
-- 1) moobook_books: 주문 시 성별 저장
ALTER TABLE moobook_books
  ADD COLUMN IF NOT EXISTS child_gender text DEFAULT 'boy';

-- 2) moobook_scenario_backgrounds: 성별별 캐릭터 이미지와 레퍼런스를 별도 컬럼으로 관리.
--    기존 character_image_url / character_status / reference_image_url 은 하위 호환을 위해 유지.
ALTER TABLE moobook_scenario_backgrounds
  ADD COLUMN IF NOT EXISTS character_image_url_boy text,
  ADD COLUMN IF NOT EXISTS character_image_url_girl text,
  ADD COLUMN IF NOT EXISTS character_status_boy text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS character_status_girl text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reference_image_url_boy text,
  ADD COLUMN IF NOT EXISTS reference_image_url_girl text;
