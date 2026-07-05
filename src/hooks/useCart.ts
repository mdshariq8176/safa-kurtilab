// Zustand Cart Hook with LocalStorage Persistence & Hydration Guardrails
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Generated as productId-size-color to isolate variations
  productId: string;
  title: string;
  price: number; // Base price
  discount: number; // Percentage discount
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number; // Subtotal after discount, before tax
  getGSTAmount: () => number; // 5% GST
  getGrandTotal: () => number; // Subtotal + GST
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const id = `${newItem.productId}-${newItem.size}-${newItem.color}`;
        const items = [...get().items];
        const existingItemIndex = items.findIndex((item) => item.id === id);

        if (existingItemIndex > -1) {
          items[existingItemIndex].quantity += 1;
        } else {
          items.push({ ...newItem, id, quantity: 1 });
        }

        set({ items });
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          const discountAmt = item.price * (item.discount / 100);
          const finalItemPrice = item.price - discountAmt;
          return total + finalItemPrice * item.quantity;
        }, 0);
      },
      getGSTAmount: () => {
        return get().getCartTotal() * 0.05; // Strict 5% GST on Kurtis
      },
      getGrandTotal: () => {
        return get().getCartTotal() + get().getGSTAmount();
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'safa-kurtilab-cart-storage',
    }
  )
);

// High-fidelity react hook wrapper that handles Next.js hydration safety.
// Returns state values only after the client component has successfully hydrated.
import { useState, useEffect } from 'react';

export function useCart() {
  const store = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    items: isHydrated ? store.items : [],
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    cartTotal: isHydrated ? store.getCartTotal() : 0,
    gstAmount: isHydrated ? store.getGSTAmount() : 0,
    grandTotal: isHydrated ? store.getGrandTotal() : 0,
    itemCount: isHydrated ? store.getItemCount() : 0,
    isHydrated,
  };
}
