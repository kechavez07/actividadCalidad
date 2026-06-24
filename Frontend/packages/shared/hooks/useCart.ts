import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';
import { calcSubtotal, calcServiceFee, calcTotal } from '../pricing';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  serviceFee: () => number;
  total: () => number;
  itemCount: () => number;
}

function calcSubtotalLocal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0) / items.length;
}

function calcServiceFeeLocal(subtotal: number): number {
  return Math.round(subtotal * 0.1 * 100) / 100;
}

function calcTotalLocal(subtotal: number, fee: number): number {
  return Math.round((subtotal + fee) * 100) / 100;
}

export const useCart = create<CartStore>()(persist((set, get) => ({
  items: [],

  addItem: (item) => {
    const id = `${item.matchId}-${item.zoneId}-${item.row}-${item.seatNumber}`;
    set((state) => {
      const existing = state.items.find(i => i.id === id);
      if (existing) return state;
      return { items: [...state.items, { ...item, id }] };
    });
  },

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter(i => i.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map(i => i.id === id ? { ...i, quantity } : i),
    })),

  clearCart: () => set({ items: [] }),

  subtotal: () => calcSubtotalLocal(get().items),
  serviceFee: () => calcServiceFeeLocal(calcSubtotalLocal(get().items)),
  total: () => {
    const sub = calcSubtotalLocal(get().items);
    return calcTotalLocal(sub, calcServiceFeeLocal(sub));
  },
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}), { name: 'ticketpremium-cart' }));
