# moobook

AI 기반 맞춤형 아동 동화책 제작 서비스.
사진 1장으로 아이가 주인공인 동화책을 만들어 실물로 배송한다.

## 기술 스택
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (DB + Storage + 추후 Auth)
- Replicate API (lucataco/flux-dev-ip-adapter)
- 토스페이먼츠 결제
- Vercel 배포

## 핵심 규칙
- 모든 커밋 메시지는 한국어 음슴체로 작성 (예: "랜딩 페이지 레이아웃 추가함")
- 컴포넌트는 함수형 + TypeScript strict mode
- API Route에서 에러 처리 시 반드시 try-catch + 적절한 HTTP 상태 코드 반환
- 사용자 업로드 사진은 24시간 TTL로 관리, 이후 자동 삭제 (제로 리텐션 정책)
- AI 생성 관련 API 호출은 모두 lib/replicate.ts를 통해 수행
- 시나리오(프롬프트 세트)는 lib/scenarios/ 디렉토리에서 관리

## Supabase 네이밍 컨벤션
- 테이블: `moobook_` prefix 사용 (moobook_books, moobook_orders)
- Storage 버킷: `moobook_` prefix 사용 (moobook_photos)

## 주요 플로우
1. 랜딩(/) → 사진 업로드(/create) → 테마 선택
2. 사진 → Supabase Storage(moobook_photos) 업로드 → moobook_books INSERT
3. AI 생성 트리거(/api/generate) → 진행 상태 폴링(3초) → 미리보기(/create/[bookId])
4. 결제(/create/[bookId]/checkout) → PDF 생성 → 다운로드 or 인쇄 발주

## API Routes
- `POST /api/upload` — 사진 업로드 → moobook_photos 버킷 저장, public URL 반환
- `POST /api/generate` — book 조회 → Replicate 이미지 생성 → all_pages/preview_pages DB 저장
- `POST /api/webhook/replicate` — Replicate 완료 콜백 → 개별 페이지 DB 업데이트
- `POST /api/payment/confirm` — 토스페이먼츠 결제 확인 (DB 연동 미완)

## Replicate 연동
- 모델: lucataco/flux-dev-ip-adapter (얼굴 일관성 유지)
- REPLICATE_API_TOKEN 없으면 자동으로 mock 이미지로 fallback
- lib/replicate.ts에서 generatePages() 호출 시 동기 방식으로 12장 순차 생성

## 시나리오 구조
각 시나리오 파일(lib/scenarios/)은 아래 형태:
- id, title, description, targetAge, pageCount
- pages[]: { pageNumber, text(동화 본문), prompt(AI 이미지 생성 프롬프트), emotion }
- 현재 2개: forest-adventure(숲속 대모험), space-explorer(우주 탐험가)

## 현재 Phase
Phase 0 (MVP) - 핵심 플로우만 구현, 회원가입 없음, 최소 기능

### 구현 완료
- 랜딩 페이지 UI
- 사진 업로드 → Supabase Storage 저장
- Book 레코드 생성 + 조회
- AI 생성 트리거 + DB 상태 업데이트 (pending → generating → preview_ready)
- 3초 폴링으로 생성 진행 상태 추적
- 미리보기 페이지 (preview_pages 3장 + locked 모드)

### 미구현
- 토스페이먼츠 결제 위젯 연동 + DB 상태 업데이트
- PDF 생성 (lib/utils/pdf-generator.ts placeholder)
- 주문 내역 DB 조회 (src/app/my/orders/page.tsx)
- 얼굴 감지 API 실제 연동 (lib/utils/face-detection.ts 기본 검증만)
- RLS 정책 (Phase 1 Auth 도입 시)
