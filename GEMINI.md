# moobook (무북) - AI 맞춤형 아동 동화책 서비스

AI 기술을 활용하여 아이의 얼굴이 주인공으로 등장하는 세상에 하나뿐인 맞춤형 동화책을 제작하는 서비스입니다.

## 🚀 프로젝트 개요

- **목표**: 아이들에게 자신만의 특별한 경험을 선물하고, 독서에 대한 흥미를 고취시킵니다.
- **핵심 가치**: 개인화(Personalization), 창의성(Creativity), 교육적 가치(Educational Value).
- **주요 기능**:
  - 아이 사진 업로드 및 분석 (성별, 특징 유지).
  - 10가지 이상의 테마별 시나리오 제공.
  - Google Gemini 기반 고품질 수채화풍 일러스트 생성.
  - Replicate 기반 얼굴 합성(Face-swap) 기술 적용.
  - 실시간 생성 진행률 확인 및 미리보기 제공.
  - 최종 동화책 PDF 생성 및 다운로드.

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 16.2 (App Router)
- **Library**: React 19, Lucide React (Icons), Sonner (Toast)
- **Styling**: Tailwind CSS v4, Radix UI (Headless Components)
- **Language**: TypeScript

### Backend & Infrastructure
- **BaaS**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (Generated images, PDFs)

### AI Core
- **Image Generation**: Google Gemini (`gemini-3.1-flash-image-preview`)
  - 특징: 수채화 스타일(Watercolor), 캐릭터 일관성 유지(Reference Image 활용).
- **Face Synthesis**: Replicate (`codeplugtech/face-swap`)
  - 특징: 일러스트와 실제 아이 얼굴의 자연스러운 합성.
- **Text Processing**: OpenAI (Prompt engineering & content generation).

### PDF Generation
- **Library**: `pdf-lib`, `@pdf-lib/fontkit`
- **Font**: Jua (주아체) - 친근하고 부드러운 아동용 폰트.

## 📂 주요 디렉토리 구조

- `src/app/`: Next.js 페이지 및 API 라우트.
  - `admin/`: 배경 및 일러스트 관리용 어드민 페이지.
  - `create/`: 동화책 생성 프로세스 (사진 업로드 -> 시나리오 선택 -> 미리보기 -> 생성).
  - `api/`: AI 생성 및 데이터 처리용 서버리스 함수.
- `src/components/`: 재사용 가능한 UI 컴포넌트.
- `src/lib/`: 핵심 비즈니스 로직 및 외부 서비스 연동.
  - `gemini.ts`: Google Gemini API 연동.
  - `replicate.ts`: Replicate API 연동.
  - `image-pipeline.ts`: 일러스트 생성부터 합성까지의 전체 파이프라인.
  - `scenarios/`: 동화책 시나리오 데이터 (숲속 대모험, 우주 탐험대 등).
- `src/types/`: TypeScript 타입 정의.
- `supabase/`: 데이터베이스 마이그레이션 파일.

## ⚙️ 주요 환경 변수 (.env)

| 변수명 | 설명 |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 측 관리 작업용) |
| `GEMINI_API_KEY` | Google AI Studio Gemini API 키 |
| `REPLICATE_API_TOKEN` | Replicate API 토큰 |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `USE_MOCK_AI` | `true` 설정 시 AI 호출 대신 Placeholder 이미지 반환 (개발용) |
| `DEV_PAGE_LIMIT` | 개발 중 생성할 최대 페이지 수 제한 |

## 📝 개발 가이드라인

1. **AI 호출 최적화**: Gemini API는 Rate Limit이 존재하므로 `withGeminiRetry`와 같은 재시도 로직을 준수합니다.
2. **이미지 비율**: 모든 동화책 일러스트는 **3:4 세로형(768x1024)** 비율을 유지합니다.
3. **한글 처리**: 아이 이름에 따른 조사 변환(`(이)가`, `(은)는` 등)은 `src/lib/utils/korean-name.ts`를 사용합니다.
4. **보안**: 클라이언트 측에서 `SUPABASE_SERVICE_ROLE_KEY`나 AI API 키를 노출하지 않도록 주의합니다.

---
*이 문서는 프로젝트의 이해를 돕기 위해 Gemini CLI에 의해 자동 또는 수동으로 업데이트됩니다.*
