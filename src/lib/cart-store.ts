import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateLuckyNumbers, type Product } from "./products";

export type CartItem = {
  product: Product;
  numbers: number[];
  addedAt: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product) => CartItem;
  remove: (id: string, addedAt: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        const item: CartItem = {
          product,
          numbers: generateLuckyNumbers(),
          addedAt: Date.now(),
        };
        set((s) => ({ items: [...s.items, item] }));
        return item;
      },
      remove: (id, addedAt) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.product.id === id && i.addedAt === addedAt),
          ),
        })),
      clear: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.product.ticketPrice, 0),
    }),
    { name: "luckydrop-cart" },
  ),
);
