export type Role = "BUYER" | "SELLER" | "ADMIN" | "CITIZEN" | "OFFICER" | "AUDITOR";
export type PropertyType =
  | "APARTMENT"
  | "VILLA"
  | "INDEPENDENT_HOUSE"
  | "PLOT"
  | "COMMERCIAL"
  | "PG"
  | "STUDIO";
export type ListingType = "BUY" | "RENT";
export type PropertyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SOLD" | "RENTED";
export type Furnishing = "FULLY_FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";

export interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: Role;
  isVerified: boolean;
  bio: string | null;
  createdAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceNegotiable: boolean;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  bhk: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  floor: number | null;
  totalFloors: number | null;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  furnishing: Furnishing;
  parking: boolean;
  images: string[];
  amenities: string[];
  facing: string | null;
  ageOfProperty: number | null;
  availableFrom: Date | null;
  verified: boolean;
  views: number;
  featured: boolean;
  sellerId: string;
  seller: Pick<User, "id" | "name" | "email" | "phone" | "avatar" | "isVerified">;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFilters {
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  bhk?: number[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  furnishing?: Furnishing;
  amenities?: string[];
  verified?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "area_asc" | "area_desc";
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  chatRoomId: string;
  read: boolean;
  sender: Pick<User, "id" | "name" | "avatar">;
  createdAt: Date;
}

export interface ChatRoom {
  id: string;
  propertyId: string;
  buyerId: string;
  property: Pick<Property, "id" | "title" | "images" | "price">;
  buyer: Pick<User, "id" | "name" | "avatar">;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── MARKETPLACE ─────────────────────────────────────────────────────────────

export type ProductStatus = "PENDING" | "APPROVED" | "REJECTED" | "SOLD_OUT";
export type ProductCondition = "NEW" | "USED" | "REFURBISHED";
export type ProductCategory =
  | "GARDEN_DECOR"
  | "PLANTS"
  | "FURNITURE"
  | "LIGHTING"
  | "TOOLS"
  | "STORAGE"
  | "TEXTILES"
  | "KITCHENWARE"
  | "ELECTRONICS"
  | "SPORTS"
  | "TOYS"
  | "BOOKS"
  | "CLOTHING"
  | "OTHER";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  priceNegotiable: boolean;
  images: string[];
  category: ProductCategory;
  condition: ProductCondition;
  stock: number;
  brand: string | null;
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  shippingInfo: string | null;
  status: ProductStatus;
  featured: boolean;
  views: number;
  sellerId: string;
  seller: Pick<User, "id" | "name" | "email" | "phone" | "avatar" | "isVerified">;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: ProductCategory;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
