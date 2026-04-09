-- 생성된 동화책
create table moobook_books (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  -- status: pending → generating → preview_ready → paid → printing → shipped → completed
  theme text not null,
  -- theme: 'forest-adventure' | 'space-explorer'
  child_name text,
  child_age int,
  photo_url text not null,
  -- Supabase Storage 경로 (임시, 24h TTL)
  preview_pages jsonb,
  -- 미리보기용 이미지 URL 배열 (3~4장)
  all_pages jsonb,
  -- 전체 페이지 이미지 URL 배열 (12장, 결제 후 접근 가능)
  pdf_url text,
  -- 최종 조합된 PDF URL
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

-- 주문/결제
create table moobook_orders (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references moobook_books(id) not null,
  tier text not null,
  -- tier: 'digital' | 'softcover'
  amount int not null,
  -- 금액 (원)
  payment_key text,
  -- 토스페이먼츠 paymentKey
  payment_status text not null default 'pending',
  -- pending → paid → refunded
  shipping_status text,
  -- null(디지털) | printing → shipped → delivered
  tracking_number text,
  buyer_name text,
  buyer_phone text,
  buyer_address text,
  created_at timestamptz default now()
);

-- RLS 정책은 Phase 1에서 Auth 도입 시 추가
