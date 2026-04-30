/**
 * 얼굴 합성 테스트에서 사용 가능한 이미지 모델 레지스트리.
 * 새 모델 추가 시 이 파일의 FACE_TEST_MODELS 배열에만 항목을 추가하면 된다.
 *
 * provider 는 API 호출 어댑터(현재 openai 만) 분기를 위해 사용된다.
 * API 공개 전이거나 비용이 높은 모델은 disabled 로 노출만 하고 선택은 막을 수 있다.
 */

export type FaceTestProvider = "openai";

export interface FaceTestModel {
  id: string;
  label: string;
  description: string;
  provider: FaceTestProvider;
  disabled?: boolean;
}

export const FACE_TEST_MODELS: FaceTestModel[] = [
  {
    id: "gpt-image-1.5",
    label: "GPT Image 1.5",
    description: "OpenAI 이미지 편집 (현행 안정 버전)",
    provider: "openai",
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    description: "OpenAI ChatGPT Images 2.0",
    provider: "openai",
  },
];

export const DEFAULT_FACE_TEST_MODEL_ID: string = "gpt-image-2";

export function findFaceTestModel(id: string): FaceTestModel | null {
  return FACE_TEST_MODELS.find((m) => m.id === id) ?? null;
}

export function isValidFaceTestModelId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const model = findFaceTestModel(id);
  return !!model && !model.disabled;
}
