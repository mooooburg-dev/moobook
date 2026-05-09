/**
 * 한국어 동화책 본문에 어울리는 줄바꿈.
 *
 * 알고리즘:
 *   1) 좋은 줄바꿈 지점(공백, 마침표/쉼표/물음표/느낌표/줄임표 같은 종결 부호)
 *      뒤에서 끊는 것을 우선한다.
 *   2) 한 줄 길이가 maxWidth 를 넘으면, 직전까지의 끊기 지점에서 줄을 자른다.
 *   3) 끊기 지점이 없는 비정상적으로 긴 토큰은 마지막 안전장치로 글자 단위로
 *      자른다 (PDF wrapText 와 같은 동작).
 *
 * 브라우저 전용 — `document` 가 없으면 입력을 그대로 한 줄씩 반환.
 */

const BREAK_AFTER_CHARS = new Set([
  " ",
  "\t",
  ".",
  ",",
  "!",
  "?",
  "·",
  "…",
  "·",
  ";",
  ":",
  ")",
  "]",
  "}",
  "”",
  "’",
  "》",
  "」",
  "』",
]);

interface Break {
  /** 끊는 위치(이 인덱스의 글자까지 포함해 한 줄을 만든다). */
  endExclusive: number;
}

function findCandidateBreaks(text: string): Break[] {
  const breaks: Break[] = [];
  for (let i = 0; i < text.length; i++) {
    if (BREAK_AFTER_CHARS.has(text[i])) {
      breaks.push({ endExclusive: i + 1 });
    }
  }
  if (
    breaks.length === 0 ||
    breaks[breaks.length - 1].endExclusive !== text.length
  ) {
    breaks.push({ endExclusive: text.length });
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
    let lastBreak = -1; // 현재 라인에 들어갈 수 있던 마지막 break index (paragraph 기준)

    for (let bi = 0; bi < breaks.length; bi++) {
      const candidateEnd = breaks[bi].endExclusive;
      const candidate = paragraph.slice(lineStart, candidateEnd);
      const width = ctx.measureText(candidate).width;

      if (width <= maxWidth) {
        // 아직 들어감 — 다음 후보 시도
        lastBreak = candidateEnd;
        continue;
      }

      // 폭 초과. 직전 후보가 있으면 거기서 끊는다.
      if (lastBreak > lineStart) {
        lines.push(paragraph.slice(lineStart, lastBreak).replace(/\s+$/, ""));
        lineStart = lastBreak;
        lastBreak = -1;
        // 같은 candidate 를 다음 라인 후보로 다시 평가
        bi--;
        continue;
      }

      // 끊을 곳이 없는 비정상적으로 긴 단일 토큰 — 글자 단위 fallback
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
        // 남은 부분이 maxWidth 이내면 다음 라인의 시작으로 둔다
        lineStart = candidateEnd - cur.length;
        lastBreak = -1;
      } else {
        lineStart = candidateEnd;
        lastBreak = -1;
      }
    }

    if (lineStart < paragraph.length) {
      lines.push(paragraph.slice(lineStart).replace(/\s+$/, ""));
    }
  }

  return lines;
}
