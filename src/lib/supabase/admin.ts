import { createClient } from "@supabase/supabase-js";

// Service Role 키를 사용하는 관리자 클라이언트
// API Route에서 RLS 우회가 필요할 때 사용
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
