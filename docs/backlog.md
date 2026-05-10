# 후속 작업 백로그

PR #13(얼굴 anchor 흐름 + polling-driven 페이지 생성) 머지 이후 누적된 후속 작업 목록.

## 우선순위 1: 안정성 보강 (Codex 라운드 4 보류)

### lease TTL 튜닝 (#4)
- 현재 `PAGE_LEASE_TTL_MS = 90s` 인데 실제 페이지 1장 생성이 30~50초.
- p95 가 70초 넘기 시작하면 lease 만료 전에 작업이 끝나야 하는데 위태로움.
- 액션: 운영 메트릭으로 generate latency 측정. p95 70초 넘으면 TTL 150~180s 로 올리기.

### orphan storage 정리 (#5)
- `staleResultDiscarded` 케이스에서 inline cleanup 시도하지만 실패 가능성 있음.
- `generated/{bookId}/page_XX_*.png` 중 `all_pages` 에 참조되지 않은 파일 주기적 정리 필요.
- 구현 옵션:
  - Vercel Cron + admin endpoint (`/api/admin/cleanup/orphan-pages`)
  - Supabase scheduled function (pg_cron)
- 임시 대안: 생성 path 에 `attemptId` 포함 → 디버깅 시 어떤 attempt 가 만든 파일인지 추적 가능.

### GenerationProgress 0/12 정지감 (#10)
- 첫 페이지 생성 30~50초 동안 `0/12 0%` 가 그대로라 사용자가 멈췄다고 느낄 수 있음.
- 액션: page count 0 일 때만 fake elapsed-based indeterminate 애니메이션을 같이 보여주기. 진행률 막대는 그대로 0~8% 사이 fake 진행, 메시지는 "AI 가 첫 그림을 그리고 있어요" 유지.

### face-select 50초 이후 안내 메시지 (#12)
- 현재 50초 cap 이후 90초 retry 까지 같은 화면에 머물러 stuck 처럼 보임.
- 액션: 50초 ~ 90초 구간에서 "서버가 아직 작업 중이에요. 중복 생성을 막고 기다리는 중입니다." 같은 lease 기반 설명 노출.

## 우선순위 2: 제품 기능

### 유료 페이지 게이트 (사용자 요청, 2026-05-09)
- **현재**: 미리보기 진입 = 12페이지 모두 생성 (결제 안 한 사용자에게도 생성 비용 발생)
- **목표**: 미리보기 = 3페이지만 생성, 결제 후 4~12페이지 추가 생성
- **결정사항** (2026-05-09 사용자 합의):
  - UX: 결제 완료 화면 + 진행률 표시 + 완성 시 이메일/푸시 알림
  - 사용자는 결제 후 화면 닫아도 OK, 완성되면 알림으로 다시 접근
- **구현 시 고려**:
  - polling-driven service 의 stop 조건을 `completedPages >= 3` (preview) / `completedPages >= 12` (paid) 둘 중 status 따라 분기
  - 결제 confirm 시점에 status `paid` 로 set + 페이지 생성 루프 재트리거
  - 결제 후 사용자가 페이지를 떠나면 누가 폴링하나? → **필요: 서버 주도 큐 (#13 임계점)**
  - 이메일 알림: Resend / SendGrid 등 도입 필요
  - 푸시: 모바일 PWA 지원 시점에 같이
- **선행 작업**:
  - 토스페이먼츠 결제 위젯 프론트 연동
  - `/api/payment/confirm` DB 업데이트 (`status: paid`, `moobook_orders` insert)

### 결제/주문 마무리 (Phase 0 미완)
- 토스페이먼츠 결제 위젯 프론트 연동
- `/api/payment/confirm` DB 업데이트 로직
- 주문 내역 페이지 (`/my/orders`)
- PDF 생성 마무리 (`lib/utils/pdf-generator.ts`)
- 사진 24시간 TTL 자동 삭제 cron

### 결제 confirm 보안 강화 (Codex P1, 2026-05-10)
**현재**: `/api/payment/confirm` 이 body 의 `bookId` 를 그대로 받아 `status=paid` 처리. 클라이언트가 임의의 bookId 를 보내면 결제와 무관한 book 도 paid 로 올라가는 결함.
**액션** (결제 위젯 연동 PR 에서 같이):
- `moobook_orders` 에 `(orderId, book_id, amount, payment_status)` 를 결제 위젯 호출 *전에* INSERT.
- confirm 에서 `orderId` 로 주문 조회 → `amount` / `book_id` / `payment_status` 검증 후 paid 처리.
- 검증된 `book_id` 로만 `moobook_books.status = paid` 업데이트.
- 토스 confirm 응답의 `paymentKey` / `approvedAt` / `method` 도 주문에 저장.

### 결제 후 생성 서버 주도화 (Codex P1, 2026-05-10)
**현재**: 결제 후 2~12페이지 생성은 클라이언트 폴링에 의존. 결제 직후 사용자가 브라우저를 닫으면 책이 영영 완성되지 않음.
**액션** (큐 시스템 #13 과 묶어서):
- confirm 성공 시 워커/큐에 "book finalize" job enqueue (Inngest / QStash / Supabase pg_cron).
- 워커가 paid book 중 `all_pages.length < 12` 인 것을 주기적으로 또는 즉시 채움.
- 완성되면 이메일/푸시 알림.
- 임시 대안 (PR 분리 시): cron 으로 "1시간 이상 paid 인데 미완성인 book" 회수해서 마저 채우기.

## 우선순위 3: 인프라 (사용량 임계점 도달 시)

### 큐 시스템 도입 (#13)
- Codex: "동시 생성 5~10명 또는 결제 후 완성 보장 필요 시점이 임계"
- 옵션: Inngest, QStash, Vercel Queues, Supabase Edge Functions + cron
- 도입하면 자연스럽게 "결제 후 생성을 사용자 브라우저에 의존 안 함" 도 해결
- 그 전까지는 polling-driven 으로 충분
