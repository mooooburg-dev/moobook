export type BookStatus =
  | "pending"
  | "generating"
  | "preview_ready"
  | "paid"
  | "printing"
  | "shipped"
  | "completed";

export type ThemeId = "forest-adventure" | "space-explorer";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type ShippingStatus = "printing" | "shipped" | "delivered";

export type OrderTier = "digital" | "softcover";

export interface Book {
  id: string;
  status: BookStatus;
  theme: ThemeId;
  child_name: string | null;
  child_age: number | null;
  photo_url: string;
  preview_pages: string[] | null;
  all_pages: string[] | null;
  pdf_url: string | null;
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

export interface ScenarioPage {
  pageNumber: number;
  text: string;
  prompt: string;
  emotion: string;
}

export interface Scenario {
  id: ThemeId;
  title: string;
  description: string;
  targetAge: string;
  pageCount: number;
  pages: ScenarioPage[];
}
