# moobook

AI 기반 맞춤형 아동 동화책 제작 서비스.
사진 1장으로 아이가 주인공인 동화책을 만들어 실물로 배송한다.

## 기술 스택
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
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

## 프로젝트 구조
```
src/
├── app/
│   ├── page.tsx                  # 랜딩 페이지
│   ├── layout.tsx                # 루트 레이아웃 (헤더/푸터)
│   ├── create/
│   │   ├── page.tsx              # 사진 업로드 + 테마 선택
│   │   └── [bookId]/
│   │       ├── page.tsx          # 생성 진행 + 미리보기
│   │       └── checkout/page.tsx # 결제 (UI만, 위젯 미연동)
│   ├── my/orders/page.tsx        # 주문 내역 (미구현)
│   └── api/
│       ├── upload/route.ts       # 사진 업로드
│       ├── generate/route.ts     # AI 이미지 생성 트리거
│       ├── webhook/replicate/    # Replicate 콜백
│       └── payment/confirm/      # 토스페이먼츠 확인
├── components/
│   ├── PhotoUploader.tsx         # 사진 선택 + 검증
│   ├── ThemeSelector.tsx         # 테마 카드 선택
│   ├── BookPreview.tsx           # 페이지 캐러셀 + 잠금 오버레이
│   ├── GenerationProgress.tsx    # 진행률 바 + 상태 메시지
│   ├── PricingTable.tsx          # 요금제 선택 카드
│   └── ui/                       # 공통 UI (Button, Card, ProgressBar)
├── lib/
│   ├── supabase/                 # Supabase 클라이언트 (client/server/admin)
│   ├── replicate.ts              # Replicate API 래퍼 + mock fallback
│   ├── scenarios/                # 시나리오 (forest-adventure, space-explorer)
│   └── utils/                    # face-detection, pdf-generator
└── types/index.ts                # TypeScript 인터페이스
```

## API Routes
- `POST /api/upload` — 사진 업로드 → moobook_photos 버킷 저장, public URL 반환
- `POST /api/generate` — book 조회 → Replicate 이미지 생성 → all_pages/preview_pages DB 저장
- `POST /api/webhook/replicate` — Replicate 완료 콜백 → 개별 페이지 DB 업데이트
- `POST /api/payment/confirm` — 토스페이먼츠 결제 확인 (DB 연동 미완)

## DB 스키마
- `moobook_books` — id, status, theme, child_name, photo_url, preview_pages(jsonb), all_pages(jsonb), pdf_url, expires_at
  - status: pending → generating → preview_ready → paid → printing → shipped → completed
- `moobook_orders` — id, book_id(FK), tier(digital/softcover), amount, payment_key, payment_status, shipping_status

## Replicate 연동
- 모델: lucataco/flux-dev-ip-adapter (얼굴 일관성 유지)
- REPLICATE_API_TOKEN 없으면 자동으로 mock 이미지로 fallback
- lib/replicate.ts에서 generatePages() 호출 시 동기 방식으로 12장 순차 생성

## 시나리오 구조
각 시나리오 파일(lib/scenarios/)은 아래 형태:
- id, title, description, targetAge, pageCount
- pages[]: { pageNumber, text(동화 본문), prompt(AI 이미지 생성 프롬프트), emotion }
- 현재 2개: forest-adventure(숲속 대모험), space-explorer(우주 탐험가)

## 가격 정책
- 디지털 PDF: ₩9,900
- 소프트커버 실물: ₩29,900

## 현재 Phase
Phase 0 (MVP) - 핵심 플로우만 구현, 회원가입 없음, 최소 기능

### 구현 완료
- 랜딩 페이지 UI (히어로, 3단계 가이드, 가격표, CTA)
- 사진 업로드 → Supabase Storage 저장 (JPG/PNG/WEBP, 10MB 제한)
- Book 레코드 생성 + 조회
- AI 생성 트리거 + DB 상태 업데이트 (pending → generating → preview_ready)
- 3초 폴링으로 생성 진행 상태 추적
- 미리보기 페이지 (preview_pages 3장 + locked 모드)
- BookPreview 캐러셀 컴포넌트
- 동화책 컨셉 UI 디자인 (커스텀 애니메이션, 테마 색상)

### 미구현 (다음 단계)
- 토스페이먼츠 결제 위젯 프론트엔드 연동
- 결제 확인 API의 DB 상태 업데이트 로직
- PDF 생성 (lib/utils/pdf-generator.ts — stub)
- 주문 내역 페이지 (src/app/my/orders/page.tsx — stub)
- 얼굴 감지 API 실제 연동 (lib/utils/face-detection.ts — 기본 검증만)
- 사진 24시간 TTL 자동 삭제 실행 (expires_at 필드만 설정됨)
- RLS 정책 (Phase 1 Auth 도입 시)
