import type { ChildGender } from "@/types";

export function isValidGender(g: unknown): g is ChildGender {
  return g === "boy" || g === "girl";
}

export function characterImageColumn(gender: ChildGender): string {
  return gender === "boy" ? "character_image_url_boy" : "character_image_url_girl";
}

export function characterStatusColumn(gender: ChildGender): string {
  return gender === "boy" ? "character_status_boy" : "character_status_girl";
}

export function referenceImageColumn(gender: ChildGender): string {
  return gender === "boy" ? "reference_image_url_boy" : "reference_image_url_girl";
}
