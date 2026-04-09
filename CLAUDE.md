# moobook

AI 기반 맞춤형 아동 동화책 제작 서비스.
사진 1장으로 아이가 주인공인 동화책을 만들어 실물로 배송한다.

## 기술 스택
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (DB + Storage + 추후 Auth)
- Replicate API (FLUX IP-Adapter)
- 토스페이먼츠 결제
- Vercel 배포

## 핵심 규칙
- 모든 커밋 메시지는 한국어 음슴체로 작성 (예: "랜딩 페이지 레이아웃 추가함")
- 컴포넌트는 함수형 + TypeScript strict mode
- API Route에서 에러 처리 시 반드시 try-catch + 적절한 HTTP 상태 코드 반환
- 사용자 업로드 사진은 24시간 TTL로 관리, 이후 자동 삭제 (제로 리텐션 정책)
- AI 생성 관련 API 호출은 모두 lib/replicate.ts를 통해 수행
- 시나리오(프롬프트 세트)는 lib/scenarios/ 디렉토리에서 관리

## 주요 플로우
1. 랜딩(/) → 사진 업로드(/create) → 테마 선택
2. AI 생성 트리거 → 진행 상태 폴링 → 미리보기(/create/[bookId])
3. 결제(/create/[bookId]/checkout) → PDF 생성 → 다운로드 or 인쇄 발주

## 시나리오 구조
각 시나리오 파일은 아래 형태:
- id, title, description, targetAge, pageCount
- pages[]: { pageNumber, text(동화 본문), prompt(AI 이미지 생성 프롬프트), emotion }

## 현재 Phase
Phase 0 (MVP) - 핵심 플로우만 구현, 회원가입 없음, 최소 기능
