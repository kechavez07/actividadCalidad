import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import type { CartItem } from './types';

// Mock localStorage for zustand persist
const store: Record<string, string> = {};
beforeAll(() => {
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: () => null,
  };
});
afterAll(() => {
  delete (globalThis as any).localStorage;
});

const baseItem: Omit<CartItem, 'id'> = {
  matchId: 'M1',
  matchLabel: 'Uruguay vs Brasil',
  stadiumName: 'Estadio Centenario',
  date: '2026-07-15',
  time: '20:00',
  zoneId: 'Z1',
  zoneName: 'General',
  codigoPartido: 'M1',
  row: 1,
  seatNumber: 10,
  price: 100,
  quantity: 1,
};

describe('useCart store', () => {
  test('store comienza vacía', async () => {
    const { useCart } = await import('./hooks/useCart');
    useCart.getState().clearCart();
    expect(useCart.getState().items).toEqual([]);
    expect(useCart.getState().itemCount()).toBe(0);
  });

  test('addItem agrega un ítem', async () => {
    const { useCart } = await import('./hooks/useCart');
    useCart.getState().clearCart();
    useCart.getState().addItem(baseItem);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().itemCount()).toBe(1);
  });

  test('addItem no duplica mismo asiento', async () => {
    const { useCart } = await import('./hooks/useCart');
    useCart.getState().clearCart();
    useCart.getState().addItem(baseItem);
    useCart.getState().addItem(baseItem);
    expect(useCart.getState().items).toHaveLength(1);
  });

  test('removeItem elimina ítem por id', async () => {
    const { useCart } = await import('./hooks/useCart');
    useCart.getState().clearCart();
    useCart.getState().addItem(baseItem);
    const id = useCart.getState().items[0].id;
    useCart.getState().removeItem(id);
    expect(useCart.getState().items).toHaveLength(0);
  });

  test('subtotal calcula correctamente (ISSUE-001 regresión)', async () => {
    const { useCart } = await import('./hooks/useCart');
    useCart.getState().clearCart();
    useCart.getState().addItem(baseItem);
    useCart.getState().addItem({ ...baseItem, zoneId: 'Z2', zoneName: 'VIP', seatNumber: 20, price: 200 });
    expect(useCart.getState().subtotal()).toBe(300);
  });

  test('clearCart vacía el carrito', async () => {
    const { useCart } = await import('./hooks/useCart');
    useCart.getState().addItem(baseItem);
    useCart.getState().clearCart();
    expect(useCart.getState().items).toHaveLength(0);
  });
});
