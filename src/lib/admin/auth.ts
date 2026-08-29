import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * 어드민 인증 공용 모듈.
 *
 * 이전 구조는 (1) verifyAdmin 이 4개 라우트에 복붙되어 있고, (2) ADMIN_PASSWORD
 * 미설정 시 `undefined === undefined` 로 통과했으며, (3) 쿠키 값에 비밀번호 원문을
 * 그대로 저장했다. 여기서 모두 교정한다:
 *   - 단일 정의 + fail-closed(env 없으면 무조건 거부)
 *   - 쿠키에는 비밀번호 대신 ADMIN_PASSWORD 로부터 파생한 HMAC 토큰 저장
 *   - 상수 시간 비교(timingSafeEqual)
 */

export const ADMIN_COOKIE = "admin_auth";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24; // 24시간

/**
 * ADMIN_PASSWORD 로부터 결정론적 세션 토큰을 파생한다.
 * 쿠키에 비밀번호 원문이 노출되지 않도록 하기 위함. env 미설정 시 null.
 */
export function adminSessionToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("moobook-admin-session").digest("hex");
}

/** 길이 노출 없는 상수 시간 문자열 비교 */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** 입력 비밀번호가 ADMIN_PASSWORD 와 일치하는지 (상수 시간). env 미설정 시 false. */
export function checkAdminPassword(password: unknown): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  if (typeof password !== "string" || password.length === 0) return false;
  return safeEqual(password, pw);
}

/**
 * 쿠키 기반 어드민 인증 검사.
 * ADMIN_PASSWORD 미설정 시 항상 false (fail closed).
 */
export async function verifyAdmin(): Promise<boolean> {
  const token = adminSessionToken();
  if (!token) return false;
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, token);
}
