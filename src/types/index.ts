export type BookStatus =
  | "pending"
  | "faces_generating"
  | "faces_ready"
  | "faces_failed"
  | "generating"
  | "photo_unsuitable"
  | "preview_ready"
  | "paid"
  | "printing"
  | "shipped"
  | "completed";

export interface PhotoAsset {
  url: string;
  order: number;
  isPrimary: boolean;
  uploadedAt: string;
  faceValidation?: { valid: boolean; reason?: string };
}

export interface FaceCandidateError {
  /** OpenAI APIError.status 또는 fetch 응답 코드 */
  status?: number;
  /** OpenAI 에러 코드 (e.g. "model_not_found") */
  code?: string | null;
  /** OpenAI 에러 param (e.g. "image", "n") */
  param?: string | null;
  /** OpenAI 응답에 포함된 request id (예: "req_75fa…") */
  requestId?: string | null;
  /** 사람 읽는 메시지 */
  message: string;
  /** 어떤 reference index에서 실패했는지 (있으면) */
  referenceIndex?: number;
}

export interface FaceCandidateMetadata {
  model: string;
  prompt: string;
  variantHints: string[];
  sourcePhotoUrls: string[];
  attempts: number;
  createdAt: string;
  attemptId?: string;
  error?: FaceCandidateError;
}

export interface FaceGenerationLease {
  startedAt: string;
  leaseUntil: string;
  attemptId: string;
  attempt: number;
}

export interface AnchorMetadata {
  selectedAt: string;
  candidateIndex: number;
  model: string;
  quality: "low" | "medium" | "high";
}

export type ThemeId =
  | "forest-adventure"
  | "space-explorer"
  | "ocean-friends"
  | "dinosaur-world"
  | "animal-school"
  | "cooking-magic"
  | "brushing-hero"
  | "bath-mission"
  | "first-day-school"
  | "birthday-adventure"
  | "custom";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type ShippingStatus = "printing" | "shipped" | "delivered";

export type OrderTier = "softcover";

export type ChildGender = "boy" | "girl";

export interface Book {
  id: string;
  status: BookStatus;
  theme: ThemeId;
  child_name: string | null;
  child_age: number | null;
  child_gender: ChildGender;
  photo_url: string;
  photos: PhotoAsset[] | null;
  face_candidate_urls: string[] | null;
  face_candidate_metadata: FaceCandidateMetadata | null;
  face_generation_lease: FaceGenerationLease | null;
  anchor_face_url: string | null;
  anchor_metadata: AnchorMetadata | null;
  image_model: string | null;
  preview_pages: string[] | null;
  all_pages: string[] | null;
  pdf_url: string | null;
  custom_scenario: Omit<Scenario, "id"> | null;
  created_at: string;
  expires_at: string;
}

export interface Order {
  id: string;
  book_id: string;
  tier: OrderTier;
  amount: number;
  payment_key: string | null;
  payment_status: PaymentStatus;
  shipping_status: ShippingStatus | null;
  tracking_number: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_address: string | null;
  created_at: string;
}

export type ScenarioCategory =
  | "adventure"
  | "daily-life"
  | "emotion"
  | "celebration"
  | "science";

export interface ScenarioPage {
  pageNumber: number;
  text: string;
  sceneDescription: string;
  emotion: string;
}

export interface Scenario {
  id: ThemeId;
  title: string;
  description: string;
  category: ScenarioCategory;
  educationMessage: string;
  targetAge: string;
  pageCount: number;
  pages: ScenarioPage[];
}

export type IllustrationStatus =
  | "pending"
  | "generating"
  | "completed"
  | "approved"
  | "rejected";

export interface ScenarioIllustration {
  id: string;
  scenario_id: string;
  page_number: number;
  gender: ChildGender;
  image_url: string | null;
  status: IllustrationStatus;
  prompt_used: string | null;
  session_id: string | null;
  image_model: string | null;
  created_at: string;
  updated_at: string;
}
