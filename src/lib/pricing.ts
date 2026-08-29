/** 소프트커버 실물 동화책 가격 (원). 현재 단일 tier. */
export const SOFTCOVER_PRICE = 29900;

/** ₩ 포맷 (예: 29900 → "29,900원") */
export function formatKrw(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
