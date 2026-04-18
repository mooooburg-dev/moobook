-- moobook_books에 커스텀 시나리오 저장 컬럼 추가
alter table moobook_books
  add column if not exists custom_scenario jsonb;

comment on column moobook_books.custom_scenario is
  'LLM이 생성한 커스텀 12페이지 시나리오. theme=custom일 때만 사용.';
