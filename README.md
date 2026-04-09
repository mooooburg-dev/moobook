# moobook

AI 기반 맞춤형 아동 동화책 제작 서비스.
사진 1장으로 아이가 주인공인 동화책을 만들어 실물로 배송합니다.

## 주요 기능

- 아이 사진 업로드 → AI가 아이를 주인공으로 한 동화책 이미지 12장 생성
- 2가지 테마 (숲속 대모험, 우주 탐험가) 선택
- 미리보기 3장 제공 → 결제 후 전체 열람
- 디지털 PDF / 소프트커버 실물 배송

## 기술 스택

- **프론트엔드**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **백엔드**: Next.js API Routes
- **DB / Storage**: Supabase
- **AI 이미지 생성**: Replicate (lucataco/flux-dev-ip-adapter)
- **결제**: 토스페이먼츠
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 복사해서 `.env.local`을 만들고 값을 채워넣습니다.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx
REPLICATE_API_TOKEN=r8_xxxx          # 없으면 mock 이미지로 동작
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxx
TOSS_SECRET_KEY=test_sk_xxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Supabase 설정

1. **테이블 생성**: Supabase SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
2. **Storage 버킷 생성**: Dashboard → Storage → New Bucket → 이름: `moobook_photos`, Public 체크

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인합니다.

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
│   └── api/
│       ├── upload/route.ts               # 사진 업로드
│       ├── generate/route.ts             # AI 생성 트리거
│       ├── webhook/replicate/route.ts    # Replicate 콜백
│       └── payment/confirm/route.ts      # 결제 확인
├── components/                           # UI 컴포넌트
├── lib/
│   ├── supabase/                         # Supabase 클라이언트 (client, server, admin)
│   ├── replicate.ts                      # Replicate API 래퍼 + mock fallback
│   ├── scenarios/                        # 동화 시나리오 데이터
│   └── utils/                            # 얼굴 감지, PDF 생성
└── types/index.ts                        # 타입 정의
```

## 사용자 플로우

```
랜딩(/) → 사진 업로드 + 테마 선택(/create) → AI 생성 + 미리보기(/create/[bookId]) → 결제(/create/[bookId]/checkout)
```
