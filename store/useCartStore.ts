import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  incrementQty: (menuItemId: string) => void;
  decrementQty: (menuItemId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
  quantityOf: (menuItemId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItemId === item.menuItemId
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      incrementQty: (menuItemId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        })),

      decrementQty: (menuItemId) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItemId === menuItemId
          );
          if (!existing) return state;

          if (existing.quantity <= 1) {
            return {
              items: state.items.filter((i) => i.menuItemId !== menuItemId),
            };
          }

          return {
            items: state.items.map((i) =>
              i.menuItemId === menuItemId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),

      quantityOf: (menuItemId) =>
        get().items.find((i) => i.menuItemId === menuItemId)?.quantity ?? 0,
    }),
    {
      name: "andra-mess-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
