/**
 * 한국어 동화책 본문에 어울리는 줄바꿈.
 *
 * 알고리즘:
 *   1) 종결 부호(마침표/쉼표/물음표/느낌표/줄임표) 뒤는 폭과 무관하게 항상
 *      줄을 끊는다. 동화책 호흡에 맞고 가독성을 높인다.
 *   2) 그 외 좋은 끊기 지점(공백, 닫힘 괄호/따옴표 등)은 폭이 넘칠 때 사용.
 *   3) 끊기 지점이 없는 비정상적으로 긴 토큰은 마지막 안전장치로 글자 단위로
 *      자른다.
 *
 * 브라우저 전용 — `document` 가 없으면 입력을 그대로 한 줄씩 반환.
 */

/** 등장 시 즉시 줄을 끊는 종결 부호 (강제 break). */
const FORCE_BREAK_AFTER = new Set([",", ".", "!", "?", "…"]);

/** 폭 초과 시에만 끊을 수 있는 일반 break 후보. */
const SOFT_BREAK_AFTER = new Set([
  " ",
  "\t",
  "·",
  ";",
  ":",
  ")",
  "]",
  "}",
  '"',
  "'",
  "”",
  "’",
  "》",
  "」",
  "』",
]);

interface Break {
  endExclusive: number;
  /** 강제 break 인지 여부 — 폭에 상관없이 항상 줄을 끊는다. */
  hard: boolean;
}

/**
 * 종결 부호 뒤에 묶일 수 있는 닫힘 부호류 (따옴표/괄호 등).
 * 공백은 의도적으로 제외 — 공백을 묶으면 직후의 다음 문장 시작이 직전 줄로
 * 끌려 들어와 \"...뛰어왔어요. \" 처럼 어색한 조합이 생긴다.
 */
const TRAILING_CLOSERS = new Set([
  '"',
  "'",
  ")",
  "]",
  "}",
  "”",
  "’",
  "》",
  "」",
  "』",
]);

function findCandidateBreaks(text: string): Break[] {
  const breaks: Break[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    // "어요." 처럼 종결 부호 뒤에 닫힘 따옴표/괄호가 직접 이어지면 함께 묶는다.
    // 공백 등은 묶지 않는다 — 그 다음은 새 문장이거나 여는 따옴표일 가능성이 큼.
    if (FORCE_BREAK_AFTER.has(ch)) {
      let end = i + 1;
      while (
        end < text.length &&
        (FORCE_BREAK_AFTER.has(text[end]) || TRAILING_CLOSERS.has(text[end]))
      ) {
        end++;
      }
      breaks.push({ endExclusive: end, hard: true });
      i = end - 1;
      continue;
    }
    if (SOFT_BREAK_AFTER.has(ch)) {
      breaks.push({ endExclusive: i + 1, hard: false });
    }
  }
  if (
    breaks.length === 0 ||
    breaks[breaks.length - 1].endExclusive !== text.length
  ) {
    breaks.push({ endExclusive: text.length, hard: false });
  }
  return breaks;
}

export function wrapTextWithCanvas(
  text: string,
  font: string,
  maxWidth: number
): string[] {
  if (typeof document === "undefined" || maxWidth <= 0) {
    return text.split("\n");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.split("\n");
  ctx.font = font;

  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }

    const breaks = findCandidateBreaks(paragraph);
    let lineStart = 0;
    let lastSoftBreak = -1;

    for (let bi = 0; bi < breaks.length; bi++) {
      const candidateEnd = breaks[bi].endExclusive;
      const isHard = breaks[bi].hard;
      const candidate = paragraph.slice(lineStart, candidateEnd);
      const width = ctx.measureText(candidate).width;
      const fitsWidth = width <= maxWidth;

      if (isHard && fitsWidth) {
        // 종결 부호 — 강제 줄바꿈
        lines.push(candidate.replace(/\s+$/, ""));
        lineStart = candidateEnd;
        // 다음 라인의 시작이 공백이면 건너뛴다 (선두 공백 방지)
        while (
          lineStart < paragraph.length &&
          (paragraph[lineStart] === " " || paragraph[lineStart] === "\t")
        ) {
          lineStart++;
        }
        lastSoftBreak = -1;
        continue;
      }

      if (fitsWidth) {
        // soft break 후보 — 마지막 안전 break 위치만 갱신하고 계속
        lastSoftBreak = candidateEnd;
        continue;
      }

      // 폭 초과
      if (lastSoftBreak > lineStart) {
        lines.push(paragraph.slice(lineStart, lastSoftBreak).replace(/\s+$/, ""));
        lineStart = lastSoftBreak;
        lastSoftBreak = -1;
        bi--; // 같은 candidate 재평가
        continue;
      }

      // 끊을 곳이 없는 긴 토큰 — 글자 단위 fallback
      let cur = "";
      for (let i = lineStart; i < candidateEnd; i++) {
        const ch = paragraph[i];
        const next = cur + ch;
        if (ctx.measureText(next).width > maxWidth && cur.length > 0) {
          lines.push(cur);
          cur = ch;
        } else {
          cur = next;
        }
      }
      if (cur.length > 0) {
        lineStart = candidateEnd - cur.length;
        lastSoftBreak = -1;
      } else {
        lineStart = candidateEnd;
        lastSoftBreak = -1;
      }
    }

    if (lineStart < paragraph.length) {
      lines.push(paragraph.slice(lineStart).replace(/\s+$/, ""));
    }
  }

  return lines;
}
