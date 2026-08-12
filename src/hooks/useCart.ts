// Zustand Cart Hook with LocalStorage Persistence & Hydration Guardrails
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Generated as productId-size-color-ratio to isolate variations
  productId: string;
  title: string;
  price: number; // Base price per set
  discount: number; // Percentage discount
  image: string;
  size: string;
  color: string;
  quantity: number; // Number of 4-pc sets
  setRatio?: string; // Standard (M,L,XL,XXL), Heavy L/XL, Plus Size
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number; // Subtotal after volume tier & product discount, before tax
  getTotalSavings: () => number; // Total wholesale savings amount
  getGSTAmount: () => number; // 5% GST
  getGrandTotal: () => number; // Subtotal + GST
  getItemCount: () => number;
}

export function getVolumeDiscountTier(totalSets: number): { pct: number; label: string } {
  if (totalSets >= 21) return { pct: 16, label: 'Master Wholesaler (16% OFF)' };
  if (totalSets >= 6) return { pct: 8, label: 'Bulk Wholesale (8% OFF)' };
  return { pct: 0, label: 'Standard Wholesale' };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const ratioKey = newItem.setRatio || 'Standard (M,L,XL,XXL)';
        const id = `${newItem.productId}-${newItem.size}-${newItem.color}-${ratioKey}`;
        const items = [...get().items];
        const existingItemIndex = items.findIndex((item) => item.id === id);

        const qtyToAdd = newItem.quantity || 1;
        if (existingItemIndex > -1) {
          items[existingItemIndex].quantity += qtyToAdd;
        } else {
          items.push({ ...newItem, id, quantity: qtyToAdd, setRatio: ratioKey });
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
        const totalSets = get().items.reduce((sum, item) => sum + item.quantity, 0);
        const volumeTier = getVolumeDiscountTier(totalSets);

        return get().items.reduce((total, item) => {
          const productDiscount = item.price * (item.discount / 100);
          const baseSalePrice = item.price - productDiscount;
          const volumeDiscount = baseSalePrice * (volumeTier.pct / 100);
          const finalSetPrice = baseSalePrice - volumeDiscount;
          return total + finalSetPrice * item.quantity;
        }, 0);
      },
      getTotalSavings: () => {
        const totalSets = get().items.reduce((sum, item) => sum + item.quantity, 0);
        const volumeTier = getVolumeDiscountTier(totalSets);

        return get().items.reduce((sum, item) => {
          const productDiscount = item.price * (item.discount / 100);
          const baseSalePrice = item.price - productDiscount;
          const volumeDiscount = baseSalePrice * (volumeTier.pct / 100);
          return sum + (productDiscount + volumeDiscount) * item.quantity;
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
    totalSavings: isHydrated ? store.getTotalSavings() : 0,
    gstAmount: isHydrated ? store.getGSTAmount() : 0,
    grandTotal: isHydrated ? store.getGrandTotal() : 0,
    itemCount: isHydrated ? store.getItemCount() : 0,
    isHydrated,
  };
}
