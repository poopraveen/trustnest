import { Product, FilterState, SortOption } from "./types";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  // availability
  if (filters.inStock && !filters.outOfStock) result = result.filter(p => p.inStock);
  if (filters.outOfStock && !filters.inStock) result = result.filter(p => !p.inStock);

  // price range
  result = result.filter(p => p.salePrice >= filters.priceMin && p.salePrice <= filters.priceMax);

  // collections
  if (filters.collections.length > 0) {
    result = result.filter(p => filters.collections.includes(p.collection));
  }

  // tags
  if (filters.tags.length > 0) {
    result = result.filter(p => filters.tags.some(t => p.tags.includes(t)));
  }

  // search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.collection.toLowerCase().includes(q)
    );
  }

  // sort
  result = sortProducts(result, filters.sort);
  return result;
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const arr = [...products];
  switch (sort) {
    case "price-asc":    return arr.sort((a, b) => a.salePrice - b.salePrice);
    case "price-desc":   return arr.sort((a, b) => b.salePrice - a.salePrice);
    case "name-asc":     return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":    return arr.sort((a, b) => b.name.localeCompare(a.name));
    case "best-selling": return arr.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    case "newest":       return arr.reverse();
    default:             return arr;
  }
}

export const DEFAULT_FILTERS: FilterState = {
  inStock: false,
  outOfStock: false,
  priceMin: 0,
  priceMax: 10999,
  collections: [],
  tags: [],
  sort: "featured",
  search: "",
};
