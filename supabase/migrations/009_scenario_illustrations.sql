-- Phase 3: 완성 일러스트 테이블로 재설계
-- 기존 moobook_scenario_backgrounds (배경+캐릭터 분리 구조) 폐기
-- 새 moobook_scenario_illustrations (배경+캐릭터 통합, 성별 1급 축)

DROP TABLE IF EXISTS moobook_scenario_backgrounds;

CREATE TABLE moobook_scenario_illustrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id text NOT NULL,
  page_number int NOT NULL,
  gender text NOT NULL CHECK (gender IN ('boy', 'girl')),
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  prompt_used text,
  session_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scenario_id, page_number, gender)
);

CREATE INDEX idx_moobook_scenario_illustrations_scenario_gender
  ON moobook_scenario_illustrations(scenario_id, gender, page_number);

-- Storage 버킷: moobook_illustrations (public, 영구 보존)
-- Supabase Dashboard에서 직접 생성 필요:
-- 버킷명: moobook_illustrations
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/png, image/jpeg, image/webp
-- 경로 컨벤션: <scenarioId>/<gender>/page_<XX>.png
