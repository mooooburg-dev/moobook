-- 배경 일러스트 사전 생성 테이블
CREATE TABLE scenario_backgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id text NOT NULL,
  page_number int NOT NULL,
  illustration_prompt text NOT NULL,
  image_url text,
  replicate_output_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scenario_id, page_number)
);

-- 인덱스: 시나리오별 조회 최적화
CREATE INDEX idx_scenario_backgrounds_scenario_id ON scenario_backgrounds(scenario_id);

-- Storage 버킷: backgrounds (public, 영구 보존)
-- Supabase Dashboard에서 직접 생성 필요:
-- 버킷명: backgrounds
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/png, image/jpeg, image/webp
