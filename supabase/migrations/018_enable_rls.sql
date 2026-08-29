-- Phase 0 보안: 모든 moobook_* 테이블에 RLS 활성화 (기본 deny).
--
-- 정책(policy)을 만들지 않으므로 anon / authenticated 롤은 SELECT/INSERT/
-- UPDATE/DELETE 를 전혀 할 수 없다. service_role(BYPASSRLS 속성) 로 접속하는
-- 서버 API(createAdminClient)만 접근 가능하다.
--
-- 이에 맞춰 브라우저에서의 직접 DB 접근은 서버 라우트로 이관되었다:
--   - book 생성:  POST /api/books
--   - book 조회:  GET  /api/books/[bookId]
--
-- 배포 순서 주의: 반드시 새 서버 라우트가 배포된 뒤(또는 동시에) 이 마이그레이션을
-- 적용해야 한다. 코드보다 먼저 적용하면 기존 클라이언트 직접 접근이 즉시 차단되어
-- 생성 플로우가 중단된다.

do $$
declare
  t text;
  tables text[] := array[
    'moobook_books',
    'moobook_orders',
    'moobook_scenario_illustrations',
    'moobook_face_test_results',
    'moobook_scenario_backgrounds'
  ];
begin
  foreach t in array tables loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;
