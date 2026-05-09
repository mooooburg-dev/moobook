-- 본문 페이지 생성용 lease.
-- polling-driven 방식으로 클라이언트가 /api/generate 를 반복 호출할 때
-- 동시 생성을 막기 위해 페이지 단위 lease 를 둔다.
--
-- jsonb 형태:
-- {
--   pageNumber: 현재 진행 중인 페이지 번호,
--   startedAt: ISO 시각,
--   leaseUntil: ISO 시각 (보통 startedAt + 90s),
--   attemptId: uuid
-- }

alter table moobook_books
  add column if not exists page_generation_lease jsonb;
