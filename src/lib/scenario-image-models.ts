/**
 * 관리자 시나리오 일러스트 생성에서 사용할 이미지 모델 레지스트리.
 * 새 모델 추가 시 이 파일의 SCENARIO_IMAGE_MODELS 배열에 항목을 추가하면 된다.
 */

export type ScenarioImageProvider = 'gemini' | 'openai';

export interface ScenarioImageModel {
  id: string;
  label: string;
  description: string;
  provider: ScenarioImageProvider;
  disabled?: boolean;
}

export const SCENARIO_IMAGE_MODELS: ScenarioImageModel[] = [
  {
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    description: 'OpenAI ChatGPT Images 2.0 기반 생성',
    provider: 'openai',
  },
  {
    id: 'gpt-image-1.5',
    label: 'GPT Image 1.5',
    description: 'OpenAI 이미지 생성/편집 안정 버전',
    provider: 'openai',
  },
  {
    id: 'gemini-3.1-flash-image-preview',
    label: 'Gemini 3.1 Flash Image',
    description: '기존 시나리오 일러스트 생성 모델',
    provider: 'gemini',
  },
];

export const DEFAULT_SCENARIO_IMAGE_MODEL_ID = 'gpt-image-2';

export function findScenarioImageModel(id: string): ScenarioImageModel | null {
  return SCENARIO_IMAGE_MODELS.find((m) => m.id === id) ?? null;
}

export function isValidScenarioImageModelId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const model = findScenarioImageModel(id);
  return !!model && !model.disabled;
}
