export type BookStatus =
  | "pending"
  | "generating"
  | "preview_ready"
  | "paid"
  | "printing"
  | "shipped"
  | "completed";

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
  created_at: string;
  updated_at: string;
}
