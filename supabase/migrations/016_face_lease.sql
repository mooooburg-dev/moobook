-- 얼굴 후보 생성 작업의 lease 정보.
-- HTTP 요청 안에서 long-running OpenAI 호출을 수행하는 현재 구조에서 stuck을
-- 정확히 판정하기 위해 startedAt/attemptId/leaseUntil을 lock 시점에 기록한다.
--
-- 기존 face_candidate_metadata는 작업 완료/실패 후의 결과(model, prompt, error 등)를
-- 담는 용도로 유지. lease는 진행 중 상태의 truth source.
--
-- jsonb 형태:
-- {
--   startedAt: ISO 시각,
--   leaseUntil: ISO 시각,
--   attemptId: uuid,
--   attempt: number  -- n번째 시도 (force 회수 시 +1)
-- }

alter table moobook_books
  add column if not exists face_generation_lease jsonb;
