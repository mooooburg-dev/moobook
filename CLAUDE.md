# moobook

AI 기반 맞춤형 아동 동화책 제작 서비스.
사진 1장으로 아이가 주인공인 동화책을 만들어 실물로 배송한다.

## 빌드 및 실행 명령어

패키지 매니저는 **yarn** 사용 (npm 금지).

```bash
yarn install        # 의존성 설치
yarn dev            # 개발 서버 (포트 4010)
yarn build          # 프로덕션 빌드
yarn start          # 빌드 결과 실행 (포트 4010)
yarn lint           # ESLint
yarn tsc --noEmit   # 타입 체크
```

테스트 프레임워크는 아직 없음.

## 기술 스택
- Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS v4
- Supabase (DB + Storage + 추후 Auth)
- Replicate API
  - 본문 이미지: `lucataco/flux-dev-ip-adapter` (얼굴 일관성)
  - 배경 일러스트: `black-forest-labs/flux-1.1-pro`
- 토스페이먼츠 결제
- pdf-lib + @pdf-lib/fontkit (PDF 생성)
- Vercel 배포

## 핵심 규칙
- 모든 커밋 메시지는 한국어 음슴체로 작성 (예: "랜딩 페이지 레이아웃 추가함")
- Co-Authored-By 메시지는 포함하지 않음
- 컴포넌트는 함수형 + TypeScript strict mode
- API Route에서 에러 처리 시 반드시 try-catch + 적절한 HTTP 상태 코드 반환
- 사용자 업로드 사진은 24시간 TTL로 관리, 이후 자동 삭제 (제로 리텐션 정책)
- AI 생성 관련 API 호출은 모두 `lib/replicate.ts` 또는 admin 라우트(`/api/admin/generate-backgrounds`)를 통해 수행
- 시나리오(프롬프트 세트)는 `lib/scenarios/` 디렉토리에서 관리
- 동화 본문에 들어가는 한국어 조사(`(이)는`, `이(가)`, `(아)` 등)는 `lib/utils/korean-name.ts`의 `replaceChildName()`으로 치환

## Supabase 네이밍 컨벤션
- 테이블: `moobook_` prefix (moobook_books, moobook_orders, moobook_scenario_backgrounds)
- Storage 버킷: `moobook_` prefix (moobook_photos, moobook_backgrounds)

## 주요 플로우
1. 랜딩(/) → 사진 업로드 + 테마 선택(/create)
2. 사진 → Supabase Storage(`moobook_photos`) 업로드 → `moobook_books` INSERT
3. AI 생성 트리거(`POST /api/generate`) → 진행 상태 폴링(3초) → 미리보기(`/create/[bookId]`)
4. 결제(`/create/[bookId]/checkout`) → PDF 생성 → 다운로드 or 인쇄 발주

### 어드민 플로우
- `/admin` 은 ADMIN_PASSWORD 쿠키 인증 기반 (`/api/admin/auth`)
- `/admin/scenarios` — 시나리오 전체/상세 조회 (읽기 전용)
- `/admin/backgrounds` — 시나리오별 배경 일러스트 사전 생성·진행률·썸네일
- `/admin/backgrounds/[scenarioId]` — 페이지별 배경 상세 + 승인/거부/재생성
- `/admin/preview/[scenarioId]` — 동화책 레이아웃 미리보기 (세로형/정사각형 토글, 이미지·텍스트 비율 슬라이더, 오버레이 모드, 인쇄 가이드)

## 프로젝트 구조
```
src/
├── app/
│   ├── page.tsx                          # 랜딩
│   ├── layout.tsx                        # 루트 레이아웃
│   ├── create/
│   │   ├── page.tsx                      # 사진 업로드 + 테마 선택
│   │   └── [bookId]/
│   │       ├── page.tsx                  # 생성 진행 + 미리보기
│   │       └── checkout/page.tsx         # 결제 (UI만)
│   ├── my/orders/page.tsx                # 주문 내역 (미구현 stub)
│   ├── admin/
│   │   ├── layout.tsx                    # 인증 + 사이드바
│   │   ├── page.tsx                      # 어드민 홈
│   │   ├── scenarios/                    # 시나리오 목록/상세
│   │   ├── backgrounds/                  # 배경 생성 관리
│   │   └── preview/                      # 동화책 미리보기
│   └── api/
│       ├── upload/route.ts
│       ├── generate/route.ts
│       ├── webhook/replicate/route.ts
│       ├── payment/confirm/route.ts
│       ├── scenarios/thumbnails/route.ts # 공개용 대표 썸네일
│       └── admin/
│           ├── auth/                     # 로그인 / 체크
│           ├── backgrounds/              # 현황·승인·삭제
│           └── generate-backgrounds/     # 백그라운드 생성 트리거
├── components/
│   ├── PhotoUploader.tsx
│   ├── ThemeSelector.tsx                 # 카테고리 그룹 + 썸네일 fallback 이모지
│   ├── BookPreview.tsx
│   ├── GenerationProgress.tsx
│   ├── PricingTable.tsx
│   ├── SiteChrome.tsx
│   └── ui/                               # Button, Card, ProgressBar 등
├── lib/
│   ├── supabase/                         # client, server, admin
│   ├── replicate.ts                      # 본문 생성 래퍼 + mock fallback
│   ├── scenarios/                        # 10개 시나리오 + getScenariosByCategory 등
│   └── utils/
│       ├── face-detection.ts
│       ├── korean-name.ts                # 조사 치환 (받침 판정)
│       ├── pdf-generator.ts
│       └── fonts/
└── types/index.ts
```

## API Routes
### 공개
- `POST /api/upload` — 사진 업로드 → `moobook_photos` 버킷 저장, public URL 반환
- `POST /api/generate` — book 조회 → Replicate 이미지 생성 → preview_pages/all_pages DB 저장
- `POST /api/webhook/replicate` — Replicate 완료 콜백
- `POST /api/payment/confirm` — 토스페이먼츠 결제 확인 (DB 연동 미완)
- `GET /api/scenarios/thumbnails` — 시나리오별 대표 배경 이미지 URL 맵 (approved/completed 중 가장 앞 페이지)

### 어드민 (쿠키 `admin_auth` 필수)
- `POST /api/admin/auth` / `GET /api/admin/auth/check`
- `GET /api/admin/backgrounds` — 전체 통계 + 썸네일 URL 목록
- `GET /api/admin/backgrounds?scenarioId=xxx` — 페이지별 상세
- `PATCH /api/admin/backgrounds` — 승인/거부 (`action: approve | reject`)
- `DELETE /api/admin/backgrounds?scenarioId=xxx` — 전체 레코드 삭제
- `POST /api/admin/generate-backgrounds` — 백그라운드 생성 시작

## DB 스키마
- `moobook_books` — id, status, theme, child_name, photo_url, preview_pages(jsonb), all_pages(jsonb), pdf_url, expires_at
  - status: `pending → generating → preview_ready → paid → printing → shipped → completed`
- `moobook_orders` — id, book_id(FK), tier(softcover), amount, payment_key, payment_status, shipping_status
- `moobook_scenario_backgrounds` — id, scenario_id, page_number, illustration_prompt, image_url, replicate_output_url, status, created_at, updated_at
  - status: `pending | generating | completed | approved | rejected`
  - 유니크: `(scenario_id, page_number)`

## Replicate 연동
- 본문(캐릭터): `lucataco/flux-dev-ip-adapter` — 업로드 사진 기반 얼굴 일관성
- 배경(일러스트): `black-forest-labs/flux-1.1-pro` — aspect_ratio 3:4, 워터컬러 스타일 suffix 자동 부여
- `REPLICATE_API_TOKEN`이 없거나 `USE_MOCK_AI=true`이면 placeholder 이미지로 자동 fallback
- 배경 배치 생성은 페이지당 순차 처리 + rate limit 방지용 5초 sleep

## 시나리오 구조
- `src/lib/scenarios/` 내 파일 하나 = 한 시나리오
- 필드: `id, title, description, category, educationMessage, targetAge, pageCount, pages[]`
- `pages[]`: `{ pageNumber, text, sceneDescription, illustrationPrompt, emotion }` (`prompt`는 deprecated alias)
- 카테고리: `adventure | daily-life | emotion | celebration | science`
- 현재 10개: forest-adventure, space-explorer, ocean-friends, dinosaur-world, animal-school, cooking-magic, brushing-hero, bath-mission, first-day-school, birthday-adventure

## 가격 정책
- 소프트커버 실물: ₩29,900 (현재 단일 tier)

## 현재 Phase
Phase 0 (MVP) — 핵심 플로우 + 어드민 시나리오/배경 사전 생성 시스템

### 구현 완료
- 랜딩 페이지 UI
- 사진 업로드 → Supabase Storage (JPG/PNG/WEBP, 10MB)
- Book 생성/조회, AI 본문 생성 트리거, 3초 폴링
- 미리보기 (preview_pages 3장 + 잠금 오버레이)
- 시나리오 10개 + 카테고리별 그룹핑 UI
- 어드민 인증 (쿠키 기반)
- 어드민 시나리오/배경/미리보기 페이지
- 배경 일러스트 사전 생성 시스템 (`moobook_scenario_backgrounds`)
- `ThemeSelector` 썸네일 — 생성된 배경 이미지가 있으면 이모지 대신 노출
- 한국어 조사 자동 치환 (`replaceChildName`)

### 미구현 (다음 단계)
- 토스페이먼츠 결제 위젯 프론트엔드 연동
- 결제 확인 API의 DB 상태 업데이트 로직
- PDF 생성 마무리 (`lib/utils/pdf-generator.ts` 기본 구현만)
- 주문 내역 페이지 (`src/app/my/orders/page.tsx` stub)
- 얼굴 감지 API 실제 연동 (`lib/utils/face-detection.ts` 기본 검증만)
- 사진 24시간 TTL 자동 삭제 실행 (expires_at 필드만 설정됨)
- RLS 정책 (Phase 1 Auth 도입 시)
