import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "./types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, qty = 1) => {
        set(state => {
          const existing = state.items.find(i => i.product.slug === product.slug);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.slug === product.slug
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { product, quantity: qty }], isOpen: true };
        });
      },

      removeItem: (slug) => {
        set(state => ({ items: state.items.filter(i => i.product.slug !== slug) }));
      },

      updateQty: (slug, qty) => {
        if (qty < 1) { get().removeItem(slug); return; }
        set(state => ({
          items: state.items.map(i =>
            i.product.slug === slug ? { ...i, quantity: qty } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.product.salePrice * i.quantity, 0),
    }),
    { name: "majestor-cart" }
  )
);

interface SearchStore {
  query: string;
  isOpen: boolean;
  setQuery: (q: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useSearchStore = create<SearchStore>()(set => ({
  query: "",
  isOpen: false,
  setQuery: (query) => set({ query }),
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: "" }),
}));
