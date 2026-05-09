/**
 * 텍스트를 글자 단위로 측정해 maxWidth(px)에 맞게 줄을 끊는다.
 * PDF 생성 코드(`pdf-generator.ts`의 `wrapText`)와 동일한 알고리즘이라
 * 미리보기 화면과 PDF 출력의 줄바꿈 위치가 같게 보인다.
 *
 * 브라우저 전용 — `document` 가 없는 환경(SSR)에서 호출하면 단순히 입력을
 * 한 줄로 반환한다.
 */
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
  // 사용자가 명시적으로 \n 으로 줄을 끊은 경우는 그대로 유지하고,
  // 각 단락 안에서만 길이 기준으로 추가 줄바꿈을 한다.
  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }
    let currentLine = "";
    for (const char of paragraph) {
      const testLine = currentLine + char;
      const width = ctx.measureText(testLine).width;
      if (width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}
