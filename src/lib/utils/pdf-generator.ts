import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { replaceChildName } from "./korean-name";

interface PdfGenerateInput {
  bookId: string;
  pages: {
    pageNumber: number;
    imageUrl: string;
    text: string;
  }[];
  childName: string;
  title: string;
}

/** 페이지 사이즈: 210x280mm (3:4 세로형) */
const PAGE_WIDTH = 210 * 2.8346; // mm → pt (1mm = 2.8346pt)
const PAGE_HEIGHT = 280 * 2.8346;
const IMAGE_HEIGHT_RATIO = 0.7;
const TEXT_HEIGHT_RATIO = 0.3;
const PADDING = 30;
const FONT_SIZE = 16;
const LINE_HEIGHT = FONT_SIZE * 1.6;

/**
 * 이미지 URL에서 바이트 데이터를 가져옴
 */
async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * 텍스트를 주어진 최대 너비에 맞게 줄바꿈
 */
function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let currentLine = "";

  for (const char of text) {
    const testLine = currentLine + char;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * 생성된 이미지들과 시나리오 텍스트를 조합하여 PDF를 생성함
 * @returns PDF 바이너리 (Uint8Array)
 */
export async function generatePdf(
  input: PdfGenerateInput
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Jua 폰트 로드
  const fontPath = path.join(
    process.cwd(),
    "src/lib/utils/fonts/Jua-Regular.ttf"
  );
  const fontBytes = fs.readFileSync(fontPath);
  const font = await pdfDoc.embedFont(fontBytes);

  // 표지 페이지
  const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const titleFontSize = 32;
  const titleText = input.title;
  const titleWidth = font.widthOfTextAtSize(titleText, titleFontSize);
  coverPage.drawText(titleText, {
    x: (PAGE_WIDTH - titleWidth) / 2,
    y: PAGE_HEIGHT * 0.55,
    size: titleFontSize,
    font,
    color: rgb(0.2, 0.15, 0.1),
  });

  const subtitleText = `${input.childName}의 이야기`;
  const subtitleFontSize = 20;
  const subtitleWidth = font.widthOfTextAtSize(subtitleText, subtitleFontSize);
  coverPage.drawText(subtitleText, {
    x: (PAGE_WIDTH - subtitleWidth) / 2,
    y: PAGE_HEIGHT * 0.45,
    size: subtitleFontSize,
    font,
    color: rgb(0.4, 0.35, 0.3),
  });

  // 본문 페이지들
  for (const pageData of input.pages) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    // 이미지 영역 (상단 70%)
    try {
      const imageBytes = await fetchImageBytes(pageData.imageUrl);
      let image;
      if (
        pageData.imageUrl.endsWith(".png") ||
        pageData.imageUrl.includes("png")
      ) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      const imageAreaHeight = PAGE_HEIGHT * IMAGE_HEIGHT_RATIO;
      const imageAreaWidth = PAGE_WIDTH - PADDING * 2;
      const imageAspect = image.width / image.height;
      const areaAspect = imageAreaWidth / imageAreaHeight;

      let drawWidth: number, drawHeight: number;
      if (imageAspect > areaAspect) {
        drawWidth = imageAreaWidth;
        drawHeight = imageAreaWidth / imageAspect;
      } else {
        drawHeight = imageAreaHeight;
        drawWidth = imageAreaHeight * imageAspect;
      }

      const imageX = (PAGE_WIDTH - drawWidth) / 2;
      const imageY =
        PAGE_HEIGHT * TEXT_HEIGHT_RATIO + (imageAreaHeight - drawHeight) / 2;

      page.drawImage(image, {
        x: imageX,
        y: imageY,
        width: drawWidth,
        height: drawHeight,
      });
    } catch (e) {
      console.error(
        `이미지 임베드 실패 (페이지 ${pageData.pageNumber}):`,
        e
      );
    }

    // 텍스트 영역 (하단 30%)
    const text = replaceChildName(pageData.text, input.childName);
    const textAreaWidth = PAGE_WIDTH - PADDING * 2;
    const lines = wrapText(text, font, FONT_SIZE, textAreaWidth);

    const textBlockHeight = lines.length * LINE_HEIGHT;
    const textAreaTop = PAGE_HEIGHT * TEXT_HEIGHT_RATIO - PADDING;
    const startY = textAreaTop - (textAreaTop - textBlockHeight) / 2;

    lines.forEach((line, i) => {
      const lineWidth = font.widthOfTextAtSize(line, FONT_SIZE);
      page.drawText(line, {
        x: (PAGE_WIDTH - lineWidth) / 2,
        y: startY - i * LINE_HEIGHT,
        size: FONT_SIZE,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
    });

    // 페이지 번호
    const pageNumText = `${pageData.pageNumber}`;
    const pageNumWidth = font.widthOfTextAtSize(pageNumText, 12);
    page.drawText(pageNumText, {
      x: (PAGE_WIDTH - pageNumWidth) / 2,
      y: 20,
      size: 12,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return await pdfDoc.save();
}
