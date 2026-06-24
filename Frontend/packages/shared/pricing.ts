import type { CartItem, OrderConfirmation } from './types';

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcServiceFee(subtotal: number): number {
  return Math.round(subtotal * 0.1 * 100) / 100;
}

export function calcTotal(subtotal: number, fee: number): number {
  return Math.round((subtotal + fee) * 100) / 100;
}

export function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FIFA2026-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function buildOrderConfirmation(
  items: CartItem[],
  email: string,
): OrderConfirmation {
  const subtotal = calcSubtotal(items);
  const serviceFee = calcServiceFee(subtotal);
  return {
    orderId: generateOrderId(),
    items,
    subtotal,
    serviceFee,
    total: calcTotal(subtotal, serviceFee),
    email,
    createdAt: new Date().toISOString(),
  };
}
