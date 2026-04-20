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
- AI 이미지 생성
  - **주 생성기**: Google Gemini (`@google/genai`) — chat 세션 기반 멀티턴 생성으로 캐릭터 일관성 확보
  - **보조**: Replicate / OpenAI — 호환용 헬퍼 유지 (`lib/replicate.ts`, `lib/openai.ts`)
- UI: Radix UI (dialog, select, switch, tabs 등) + sonner 토스트 + lucide-react 아이콘
- 토스페이먼츠 결제
- pdf-lib + @pdf-lib/fontkit (PDF 생성)
- Vercel 배포

## 핵심 규칙
- 모든 커밋 메시지는 한국어 음슴체로 작성 (예: "랜딩 페이지 레이아웃 추가함")
- Co-Authored-By 메시지는 포함하지 않음
- 컴포넌트는 함수형 + TypeScript strict mode
- API Route에서 에러 처리 시 반드시 try-catch + 적절한 HTTP 상태 코드 반환
- 사용자 업로드 사진은 24시간 TTL로 관리, 이후 자동 삭제 (제로 리텐션 정책)
- 이미지 생성 관련 API 호출은 모두 `lib/gemini.ts`(주) 또는 `lib/replicate.ts`(보조)를 통해 수행. Storage 업로드는 `lib/storage/upload-image.ts`의 헬퍼를 사용
- 시나리오(프롬프트 세트)는 `lib/scenarios/` 디렉토리에서 관리하고, 캐릭터 외형·구도·화풍 규칙은 `lib/scenarios/character-prompts.ts`에 공통 정의
- 동화 본문에 들어가는 한국어 조사(`(이)는`, `이(가)`, `(아)` 등)는 `lib/utils/korean-name.ts`의 `replaceChildName()`으로 치환

## Supabase 네이밍 컨벤션
- 테이블: `moobook_` prefix (moobook_books, moobook_orders, moobook_scenario_illustrations)
- Storage 버킷: `moobook_` prefix (moobook_photos, moobook_illustrations)
- `moobook_illustrations` 경로 컨벤션: `<scenarioId>/<gender>/page_<XX>.png` (영구 보존)

## 주요 플로우
1. 랜딩(/) → 사진 업로드 + 테마 선택(/create)
2. 사진 → Supabase Storage(`moobook_photos`) 업로드 → `moobook_books` INSERT
3. AI 생성 트리거(`POST /api/generate`) → 진행 상태 폴링(3초) → 미리보기(`/create/[bookId]`)
4. 결제(`/create/[bookId]/checkout`) → PDF 생성 → 다운로드 or 인쇄 발주

### 어드민 플로우
- `/admin` 은 ADMIN_PASSWORD 쿠키 인증 기반 (`/api/admin/auth`)
- `/admin/scenarios` / `/admin/scenarios/[id]` — 시나리오 목록·상세 (읽기 전용)
- `/admin/backgrounds/[scenarioId]` — 시나리오×성별 일러스트 상세, 승인/재생성/전체 생성/전체 삭제
- `/admin/preview/[scenarioId]` — 동화책 레이아웃 미리보기 (세로형/정사각형 토글, 비율 슬라이더, 오버레이 모드, 전체화면 토글 + `F` 키 단축키)

## 프로젝트 구조
```
src/
├── app/
│   ├── page.tsx                              # 랜딩
│   ├── layout.tsx                            # 루트 레이아웃
│   ├── create/
│   │   ├── page.tsx                          # 사진 업로드 + 테마 선택
│   │   └── [bookId]/
│   │       ├── page.tsx                      # 생성 진행 + 미리보기
│   │       └── checkout/page.tsx             # 결제 (UI만)
│   ├── my/orders/                            # 주문 내역 (미구현 stub)
│   ├── admin/
│   │   ├── layout.tsx                        # 인증 + 사이드바
│   │   ├── page.tsx                          # 어드민 홈
│   │   ├── scenarios/                        # 목록 + [id] 상세
│   │   ├── backgrounds/[scenarioId]/         # 일러스트 생성·관리 (배경+캐릭터 통합)
│   │   └── preview/[scenarioId]/             # 동화책 미리보기
│   └── api/
│       ├── upload/route.ts
│       ├── generate/route.ts
│       ├── custom-scenario/route.ts          # 커스텀 시나리오 저장
│       ├── payment/confirm/route.ts
│       ├── scenarios/thumbnails/route.ts     # 공개용 대표 썸네일
│       └── admin/
│           ├── auth/                         # 로그인 / 체크
│           ├── illustrations/                # 일러스트 현황·승인·삭제
│           └── generate-illustrations/       # 일러스트 배치 생성 트리거
├── components/
│   ├── PhotoUploader.tsx
│   ├── ThemeSelector.tsx                     # 카테고리 그룹 + 썸네일 fallback 이모지
│   ├── ScenarioPreviewModal.tsx
│   ├── CustomKeywordsModal.tsx
│   ├── BookPreview.tsx
│   ├── GenerationProgress.tsx
│   ├── PricingTable.tsx
│   ├── SiteChrome.tsx
│   └── ui/                                   # Button, Card, Dialog, Tabs 등 (Radix 기반)
├── lib/
│   ├── supabase/                             # client, server, admin
│   ├── gemini.ts                             # Gemini chat 세션 + priming + 이미지 생성
│   ├── replicate.ts                          # Replicate 래퍼 + mock fallback
│   ├── openai.ts                             # OpenAI 래퍼
│   ├── image-pipeline.ts                     # 런타임 프롬프트 합성기 (공통)
│   ├── storage/upload-image.ts               # Buffer/URL → Supabase Storage 업로드
│   ├── scenarios/                            # 10개 시나리오 + character-prompts
│   └── utils/
│       ├── face-detection.ts                 # 업로드 사진 기본 검증
│       ├── korean-name.ts                    # 조사 치환 (받침 판정)
│       ├── pdf-generator.ts
│       └── fonts/
└── types/index.ts
```

## API Routes
### 공개
- `POST /api/upload` — 사진 업로드 → `moobook_photos` 버킷 저장, public URL 반환
- `POST /api/generate` — book 조회 → 이미지 생성 → preview_pages/all_pages DB 저장
- `POST /api/custom-scenario` — 사용자 커스텀 시나리오 저장
- `POST /api/payment/confirm` — 토스페이먼츠 결제 확인 (DB 연동 미완)
- `GET /api/scenarios/thumbnails` — 시나리오×성별 대표 일러스트 URL 맵 (1페이지 approved/completed 기준)

### 어드민 (쿠키 `admin_auth` 필수)
- `POST /api/admin/auth` / `GET /api/admin/auth/check`
- `GET /api/admin/illustrations` — 전체 시나리오×성별 통계 + 썸네일
- `GET /api/admin/illustrations?scenarioId=xxx` — 페이지별 상세 (남/여 24행). 호출 시 5분 이상 stale된 `generating` 레코드를 자동 `pending`으로 리셋
- `PATCH /api/admin/illustrations` — 승인/거부/리셋 (`action: approve | reject | reset`)
- `DELETE /api/admin/illustrations?scenarioId=xxx[&gender=boy|girl]` — 전체 또는 성별 단위 삭제
- `POST /api/admin/generate-illustrations` — 일러스트 배치 생성 시작. 페이지 1부터 순차 생성 + sleep, 1페이지 재생성 시 2~12페이지도 재생성 필요 (일관성)

## DB 스키마
- `moobook_books` — id, status, theme, custom_scenario(jsonb), child_name, child_gender, photo_url, preview_pages(jsonb), all_pages(jsonb), pdf_url, expires_at
  - status: `pending → generating → preview_ready → paid → printing → shipped → completed`
- `moobook_orders` — id, book_id(FK), tier(softcover), amount, payment_key, payment_status, shipping_status
- `moobook_scenario_illustrations` — id, scenario_id, page_number, gender(`boy|girl`), image_url, status, prompt_used, session_id, created_at, updated_at
  - status: `pending | generating | completed | approved | rejected`
  - 유니크: `(scenario_id, page_number, gender)`
  - Phase 3에서 기존 `moobook_scenario_backgrounds`(배경/캐릭터 분리) 폐기하고 통합

## AI 이미지 연동
- **주 경로 (Gemini)**: `lib/gemini.ts`의 `createStoryChatSession()`으로 chat 세션을 만들고 시스템 프롬프트(`buildSessionSystemPrompt()`)로 캐릭터 외형·화풍·구도를 priming. 이후 `generateNextPageInSession()`으로 페이지별 프롬프트만 보내 일관성 확보
- **단발 재생성**: `buildSinglePageRegenerationPrompt()` + anchor 이미지(주로 page 1)를 `generateImageWithReferences()`에 전달
- **캐릭터 외형**: `lib/scenarios/character-prompts.ts`의 `CHARACTER_APPEARANCE` (성별별 1개 템플릿, 현재 여름 반팔/반바지 고정)
- **Mock 모드**: Gemini API 키가 없거나 `USE_MOCK_AI=true`면 placeholder 이미지 사용
- **배치 생성**: 페이지 간 sleep을 두어 rate limit 회피. 5분 이상 진행이 없는 `generating` 레코드는 GET 호출 시 자동으로 `pending`으로 회수

## 시나리오 구조
- `src/lib/scenarios/` 내 파일 하나 = 한 시나리오
- 필드: `id, title, description, category, educationMessage, targetAge, pageCount, pages[]`
- `pages[]`: `{ pageNumber, text, sceneDescription, illustrationPrompt, emotion }` (`prompt`는 deprecated alias)
- 카테고리: `adventure | daily-life | emotion | celebration | science`
- 프리셋 10개 + `custom` 테마(사용자 키워드 기반 동적 시나리오)
- 프리셋 목록: forest-adventure, space-explorer, ocean-friends, dinosaur-world, animal-school, cooking-magic, brushing-hero, bath-mission, first-day-school, birthday-adventure
- 시나리오 해상: `getScenario(themeId)` / `resolveScenario(book)` — `theme === "custom"`이면 `book.custom_scenario` 사용

## 가격 정책
- 소프트커버 실물: ₩29,900 (현재 단일 tier)

## 현재 Phase
Phase 0 (MVP) — 핵심 플로우 + 어드민 시나리오/일러스트 사전 생성 시스템

### 구현 완료
- 랜딩 페이지 UI
- 사진 업로드 → Supabase Storage (JPG/PNG/WEBP, 10MB)
- Book 생성/조회, AI 본문 생성 트리거, 3초 폴링
- 미리보기 (preview_pages 3장 + 잠금 오버레이)
- 시나리오 10개 + 카테고리별 그룹핑 UI + 커스텀 키워드 시나리오
- 어드민 인증 (쿠키 기반)
- 어드민 시나리오/일러스트/미리보기 페이지 (전체화면 토글 + F 단축키, 비율 슬라이더)
- Gemini chat 세션 기반 일러스트 사전 생성 (`moobook_scenario_illustrations`, 성별 × 페이지)
- 배경+캐릭터 통합 레코드 구조 (Phase 3 재설계)
- stale `generating` 레코드 자동 회수 (GET 시 5분 임계)
- `ThemeSelector` 썸네일 — 생성된 일러스트가 있으면 이모지 대신 노출
- 한국어 조사 자동 치환 (`replaceChildName`)
- 캐릭터 기본 복장: 여름 반팔/반바지 (계절 고정)

### 미구현 (다음 단계)
- 토스페이먼츠 결제 위젯 프론트엔드 연동
- 결제 확인 API의 DB 상태 업데이트 로직
- PDF 생성 마무리 (`lib/utils/pdf-generator.ts` 기본 구현만)
- 주문 내역 페이지 (`src/app/my/orders/page.tsx` stub)
- 얼굴 감지 API 실제 연동 (`lib/utils/face-detection.ts` 기본 검증만)
- 사진 24시간 TTL 자동 삭제 실행 (expires_at 필드만 설정됨)
- RLS 정책 (Phase 1 Auth 도입 시)
