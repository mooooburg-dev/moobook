# moobook

AI 기반 맞춤형 아동 동화책 제작 서비스.
사진 1장으로 아이가 주인공인 동화책을 만들어 실물로 배송합니다.

## 주요 기능

- 아이 사진 업로드 → AI가 아이를 주인공으로 한 동화책 이미지 12장 생성
- 10개 시나리오 (숲속 대모험, 우주 탐험대, 바다 친구들, 공룡 나라, 동물 학교, 요리 마법사, 양치 히어로, 목욕 대작전, 첫 등원 날, 내 생일 대모험)
- 카테고리별 그룹(모험 / 일상생활 / 감정·성장 / 기념일 / 과학)
- 미리보기 3장 제공 → 결제 후 전체 열람
- 디지털 PDF / 소프트커버 실물 배송
- 어드민 페이지 — 시나리오·배경 일러스트 사전 생성 및 관리, 동화책 미리보기

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **백엔드**: Next.js API Routes
- **DB / Storage**: Supabase
- **AI 이미지 생성**: Replicate
  - 본문: `lucataco/flux-dev-ip-adapter` (얼굴 일관성)
  - 배경: `black-forest-labs/flux-1.1-pro`
- **PDF**: pdf-lib + @pdf-lib/fontkit
- **결제**: 토스페이먼츠
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

`.env.local`에 값을 채워넣습니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx
REPLICATE_API_TOKEN=r8_xxxx          # 없으면 mock 이미지로 동작
USE_MOCK_AI=false                    # true 지정 시 강제 mock
ADMIN_PASSWORD=xxxx                  # /admin 접근 비밀번호
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxx
TOSS_SECRET_KEY=test_sk_xxxx
NEXT_PUBLIC_BASE_URL=http://localhost:4010
```

### 3. Supabase 설정

1. **테이블 생성**: Supabase SQL Editor에서 아래 파일 순서대로 실행
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/003_scenario_backgrounds.sql`
2. **Storage 버킷 생성**: Dashboard → Storage → New Bucket
   - `moobook_photos` (Public)
   - `moobook_backgrounds` (Public)

### 4. 개발 서버 실행

```bash
yarn dev
```

http://localhost:4010 에서 확인합니다.

### 자주 쓰는 명령어

```bash
yarn build          # 프로덕션 빌드
yarn start          # 빌드 결과 실행
yarn lint           # ESLint
yarn tsc --noEmit   # 타입 체크
```

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                          # 랜딩 페이지
│   ├── create/
│   │   ├── page.tsx                      # 사진 업로드 + 테마 선택
│   │   └── [bookId]/
│   │       ├── page.tsx                  # 생성 진행 + 미리보기
│   │       └── checkout/page.tsx         # 결제
│   ├── my/orders/page.tsx                # 주문 내역
│   ├── admin/                            # 어드민 (시나리오·배경·미리보기)
│   └── api/
│       ├── upload/route.ts
│       ├── generate/route.ts
│       ├── webhook/replicate/route.ts
│       ├── payment/confirm/route.ts
│       ├── scenarios/thumbnails/route.ts # 공개 대표 썸네일
│       └── admin/                        # 인증·배경 관리·생성 트리거
├── components/                           # UI 컴포넌트 (ThemeSelector, BookPreview 등)
├── lib/
│   ├── supabase/                         # client, server, admin
│   ├── replicate.ts                      # Replicate 래퍼 + mock fallback
│   ├── scenarios/                        # 시나리오 10개
│   └── utils/
│       ├── face-detection.ts
│       ├── korean-name.ts                # 조사 자동 치환
│       └── pdf-generator.ts
└── types/index.ts
```

## 사용자 플로우

```
랜딩(/) → 사진 업로드 + 테마 선택(/create)
       → AI 생성 + 미리보기(/create/[bookId])
       → 결제(/create/[bookId]/checkout)
```

## 어드민

- `/admin` — ADMIN_PASSWORD로 로그인
- `/admin/scenarios` — 시나리오 목록 및 상세
- `/admin/backgrounds` — 시나리오별 배경 일러스트 사전 생성·진행률·썸네일
- `/admin/preview/[scenarioId]` — 동화책 레이아웃 미리보기 (세로형/정사각형 토글)
