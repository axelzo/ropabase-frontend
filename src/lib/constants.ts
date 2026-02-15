export const CLOTHING_CATEGORIES = [
  "SHIRT",
  "PANTS",
  "SHOES",
  "JACKET",
  "ACCESSORY",
  "OTHER",
] as const;

export const COMMON_COLORS = [
  "Black",
  "White",
  "Blue",
  "Red",
  "Green",
  "Gray",
  "Brown",
  "Navy",
  "Beige",
  "Pink",
  "Yellow",
  "Orange",
  "Purple",
] as const;

export const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Blue: "#3B82F6",
  Red: "#EF4444",
  Green: "#22C55E",
  Gray: "#6B7280",
  Brown: "#92400E",
  Navy: "#1E3A5F",
  Beige: "#D2B48C",
  Pink: "#EC4899",
  Yellow: "#EAB308",
  Orange: "#F97316",
  Purple: "#A855F7",
};

export function formatCategory(cat: string) {
  return cat.charAt(0) + cat.slice(1).toLowerCase();
}
