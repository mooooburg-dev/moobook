# moobook

AI 기반 맞춤형 아동 동화책 제작 서비스.
사진 1장으로 아이가 주인공인 동화책을 만들어 실물로 배송합니다.

## 주요 기능

- 아이 사진 업로드 → AI가 아이를 주인공으로 한 동화책 이미지 12장 생성
- 프리셋 시나리오 10개 (숲속 대모험, 우주 탐험대, 바다 친구들, 공룡 나라, 동물 학교, 요리 마법사, 양치 히어로, 목욕 대작전, 첫 등원 날, 내 생일 대모험) + 사용자 커스텀 시나리오
- 카테고리별 그룹(모험 / 일상생활 / 감정·성장 / 기념일 / 과학)
- 성별(남/여) 축으로 일러스트 사전 생성, 일관된 캐릭터 외형 유지
- 미리보기 3장 제공 → 결제 후 전체 열람
- 디지털 PDF / 소프트커버 실물 배송
- 어드민 페이지 — 시나리오·일러스트 사전 생성 및 관리, 동화책 레이아웃 미리보기

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **UI**: Radix UI 기반 컴포넌트 + sonner 토스트 + lucide-react
- **백엔드**: Next.js API Routes
- **DB / Storage**: Supabase
- **AI 이미지 생성**:
  - 주: Google Gemini (`@google/genai`) — chat 세션 기반 멀티턴 생성으로 캐릭터 일관성 유지
  - 보조: Replicate / OpenAI
- **PDF**: pdf-lib + @pdf-lib/fontkit
- **결제**: 토스페이먼츠
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

`.env.local`에 값을 채워넣습니다. (`.env.local.example` 참고)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx
GEMINI_API_KEY=xxxx                  # Google Gemini (일러스트 생성 주 경로)
REPLICATE_API_TOKEN=r8_xxxx          # 보조 경로
OPENAI_API_KEY=sk-xxxx               # 보조 경로
USE_MOCK_AI=false                    # true 지정 시 강제 mock
ADMIN_PASSWORD=xxxx                  # /admin 접근 비밀번호
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxx
TOSS_SECRET_KEY=test_sk_xxxx
NEXT_PUBLIC_BASE_URL=http://localhost:4010
```

### 3. Supabase 설정

1. **테이블/스토리지 생성**: Supabase SQL Editor에서 `supabase/migrations/` 하위 파일을 번호 순서대로 실행
   - 001 → 003 → 004 → 005 → 006 → 007 → 009 → 010
2. **Storage 버킷 확인**: `moobook_photos`, `moobook_illustrations` (Public, 10MB, png/jpeg/webp). 010 마이그레이션에서 `moobook_illustrations`는 자동 생성됩니다.

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
│   ├── page.tsx                              # 랜딩 페이지
│   ├── create/
│   │   ├── page.tsx                          # 사진 업로드 + 테마 선택
│   │   └── [bookId]/
│   │       ├── page.tsx                      # 생성 진행 + 미리보기
│   │       └── checkout/page.tsx             # 결제
│   ├── my/orders/                            # 주문 내역 (stub)
│   ├── admin/                                # 어드민 (시나리오·일러스트·미리보기)
│   └── api/
│       ├── upload/route.ts
│       ├── generate/route.ts
│       ├── custom-scenario/route.ts
│       ├── payment/confirm/route.ts
│       ├── scenarios/thumbnails/route.ts     # 공개 대표 썸네일
│       └── admin/                            # 인증·일러스트 관리·배치 생성
├── components/                               # UI 컴포넌트
├── lib/
│   ├── supabase/                             # client, server, admin
│   ├── gemini.ts                             # Gemini chat 세션 + 이미지 생성
│   ├── replicate.ts                          # Replicate 래퍼 + mock fallback
│   ├── openai.ts                             # OpenAI 래퍼
│   ├── image-pipeline.ts                     # 런타임 프롬프트 합성기
│   ├── storage/upload-image.ts               # Buffer/URL → Supabase Storage
│   ├── scenarios/                            # 시나리오 10개 + character-prompts
│   └── utils/
│       ├── face-detection.ts
│       ├── korean-name.ts                    # 조사 자동 치환
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
- `/admin/backgrounds/[scenarioId]` — 시나리오×성별 일러스트 상세 · 전체 생성 · 승인/재생성 · 전체 삭제
- `/admin/preview/[scenarioId]` — 동화책 레이아웃 미리보기 (세로형/정사각형 토글, 비율 슬라이더, 전체화면 `F` 단축키)
