/**
 * 업로드된 사진에서 얼굴 감지 및 검증
 * 브라우저 환경에서 실행됨
 */

interface FaceValidationResult {
  valid: boolean;
  message: string;
}

export async function validateFacePhoto(
  file: File
): Promise<FaceValidationResult> {
  // 파일 크기 검증 (10MB 이하)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, message: "파일 크기는 10MB 이하여야 해요." };
  }

  // 파일 형식 검증
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "JPG, PNG, WEBP 형식만 지원해요.",
    };
  }

  // 이미지 크기 검증 (최소 512x512)
  const dimensions = await getImageDimensions(file);
  if (dimensions.width < 512 || dimensions.height < 512) {
    return {
      valid: false,
      message: "사진이 너무 작아요. 최소 512x512 픽셀 이상이어야 해요.",
    };
  }

  // TODO: 실제 얼굴 감지 API 연동 (예: face-api.js 또는 서버사이드 감지)
  // 현재는 기본 검증만 수행

  return { valid: true, message: "사진이 확인되었어요!" };
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
