/**
 * 생성된 이미지들을 PDF로 조합
 * 서버사이드에서 실행됨
 */

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

export async function generatePdf(
  input: PdfGenerateInput
): Promise<string> {
  // TODO: PDF 생성 라이브러리 연동 (예: puppeteer, pdf-lib, jspdf)
  // 1. 각 페이지 이미지를 다운로드
  // 2. 텍스트와 이미지를 조합하여 PDF 페이지 구성
  // 3. 표지 페이지 추가
  // 4. PDF를 Supabase Storage에 업로드
  // 5. 다운로드 URL 반환

  console.log(`PDF 생성 시작: ${input.bookId}, ${input.pages.length}페이지`);

  // TODO: 실제 구현 후 Supabase Storage URL 반환
  const pdfUrl = `https://placeholder.supabase.co/storage/v1/object/public/pdfs/${input.bookId}.pdf`;

  return pdfUrl;
}
