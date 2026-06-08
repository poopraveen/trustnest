export type ProductCollection =
  | "ESP Modules" | "Arduino" | "Soldering" | "Sensors"
  | "Displays & Screens" | "Relay Modules" | "Motors & Actuators"
  | "Passive Components" | "Wires & Connectors" | "Power Supply";

export interface Product {
  id: string;
  slug: string;
  name: string;
  regularPrice: number;
  salePrice: number;
  discount: number;
  inStock: boolean;
  collection: ProductCollection;
  image: string;
  images?: string[];
  tags: string[];
  description?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Collection {
  slug: string;
  name: ProductCollection;
  description: string;
  image: string;
  productCount: number;
  icon: string;
}

export type SortOption =
  | "featured" | "best-selling" | "price-asc"
  | "price-desc" | "name-asc" | "name-desc" | "newest";

export interface FilterState {
  inStock: boolean;
  outOfStock: boolean;
  priceMin: number;
  priceMax: number;
  collections: string[];
  tags: string[];
  sort: SortOption;
  search: string;
}
