/**
 * 개발 환경 여부.
 * Next.js 가 client/server 양쪽에서 process.env.NODE_ENV 를 인라인으로 치환하므로
 * 이 헬퍼는 양쪽에서 동일하게 동작한다.
 */
export const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * dev 에서 미리 만들어 보여줄 페이지 수.
 * `.env.local` 의 NEXT_PUBLIC_DEV_PAGE_LIMIT 으로 1~12 사이 값으로 override 가능.
 * NEXT_PUBLIC_ prefix 가 있어야 클라이언트 번들에도 동일 값이 들어가 서버/클라이언트
 * 가 같은 미리보기 limit 을 본다. 미설정 시 dev=1 (비용 절감).
 *
 * prod 에서는 이 값을 무시하고 3 으로 고정한다.
 */
function resolveDevPageLimit(): number {
  const raw = process.env.NEXT_PUBLIC_DEV_PAGE_LIMIT;
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(n, 12);
}

/**
 * 결제 전 미리보기 페이지 수.
 * - dev: NEXT_PUBLIC_DEV_PAGE_LIMIT (미설정 시 1)
 * - prod: 3 고정
 * 결제 후에는 dev/prod 모두 12장을 채운다.
 */
export const PREVIEW_PAGE_COUNT_BEFORE_PAYMENT = IS_DEV
  ? resolveDevPageLimit()
  : 3;

/**
 * dev 에서는 비용 절감을 위해 low 퀄리티로 생성한다.
 */
export const IMAGE_QUALITY: "low" | "high" = IS_DEV ? "low" : "high";
