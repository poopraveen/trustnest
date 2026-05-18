import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatPriceShort(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureYears: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  const n = tenureYears * 12;
  if (monthlyRate === 0) return principal / n;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
    (Math.pow(1 + monthlyRate, n) - 1);
  return Math.round(emi);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getPropertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    APARTMENT: "Apartment",
    VILLA: "Villa",
    INDEPENDENT_HOUSE: "Independent House",
    PLOT: "Plot",
    COMMERCIAL: "Commercial",
    PG: "PG/Co-living",
    STUDIO: "Studio",
  };
  return map[type] ?? type;
}

export function getFurnishingLabel(f: string): string {
  return f
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
  "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
  "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Noida",
];

export const AMENITIES_LIST = [
  "Swimming Pool", "Gym", "Club House", "Children's Play Area",
  "24/7 Security", "CCTV Surveillance", "Power Backup", "Lift",
  "Covered Parking", "Visitor Parking", "Garden", "Jogging Track",
  "Tennis Court", "Basketball Court", "Squash Court", "Indoor Games",
  "Community Hall", "Library", "Amphitheater", "Yoga/Meditation",
  "Wi-Fi Connectivity", "Fire Safety", "Intercom", "Rainwater Harvesting",
  "Solar Panels", "EV Charging", "Pet Friendly", "Senior Citizen Area",
];

export const PRICE_RANGES = [
  { label: "Under ₹25L", min: 0, max: 2500000 },
  { label: "₹25L - ₹50L", min: 2500000, max: 5000000 },
  { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr - ₹2Cr", min: 10000000, max: 20000000 },
  { label: "₹2Cr - ₹5Cr", min: 20000000, max: 50000000 },
  { label: "Above ₹5Cr", min: 50000000, max: Infinity },
];

// ─── MARKETPLACE ─────────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  { value: "GARDEN_DECOR", label: "Garden Decor" },
  { value: "PLANTS", label: "Plants" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "LIGHTING", label: "Lighting" },
  { value: "TOOLS", label: "Tools & Equipment" },
  { value: "STORAGE", label: "Storage" },
  { value: "TEXTILES", label: "Textiles" },
  { value: "KITCHENWARE", label: "Kitchenware" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "SPORTS", label: "Sports & Outdoors" },
  { value: "TOYS", label: "Toys & Games" },
  { value: "BOOKS", label: "Books" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "OTHER", label: "Other" },
] as const;

export function getProductCategoryLabel(v: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.value === v)?.label ?? v;
}

export function getConditionLabel(v: string): string {
  const map: Record<string, string> = {
    NEW: "New",
    USED: "Used",
    REFURBISHED: "Refurbished",
  };
  return map[v] ?? v;
}

export const PRODUCT_PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹2,000", min: 500, max: 2000 },
  { label: "₹2,000 – ₹10,000", min: 2000, max: 10000 },
  { label: "₹10,000 – ₹50,000", min: 10000, max: 50000 },
  { label: "Above ₹50,000", min: 50000, max: Infinity },
];
