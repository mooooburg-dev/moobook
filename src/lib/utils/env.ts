/**
 * 개발 환경 여부.
 * Next.js 가 client/server 양쪽에서 process.env.NODE_ENV 를 인라인으로 치환하므로
 * 이 헬퍼는 양쪽에서 동일하게 동작한다.
 */
export const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * dev 에서는 비용을 줄이기 위해 미리보기 1장만 생성하고,
 * prod 에서는 기존대로 3장을 생성한다.
 * 결제 후에는 dev/prod 모두 12장을 채운다.
 */
export const PREVIEW_PAGE_COUNT_BEFORE_PAYMENT = IS_DEV ? 1 : 3;

/**
 * dev 에서는 비용 절감을 위해 low 퀄리티로 생성한다.
 */
export const IMAGE_QUALITY: "low" | "high" = IS_DEV ? "low" : "high";
