import { describe, expect, test } from 'bun:test';
import {
  calcSubtotal,
  calcServiceFee,
  calcTotal,
  generateOrderId,
  applyDiscountTier,
  procesarPagoCompleto,
  buildOrderConfirmation,
} from './pricing';
import type { CartItem } from './types';

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: '1',
  matchId: 'M1',
  matchLabel: 'Match 1',
  stadiumName: 'Estadio',
  date: '2026-07-15',
  time: '20:00',
  zoneId: 'Z1',
  zoneName: 'General',
  codigoPartido: 'M1',
  row: 1,
  seatNumber: 10,
  price: 100,
  quantity: 1,
  ...overrides,
});

describe('ISSUE-001 — calcSubtotal', () => {
  test('carrito vacío retorna 0', () => {
    expect(calcSubtotal([])).toBe(0);
  });

  test('1 ítem retorna price * quantity', () => {
    expect(calcSubtotal([makeItem({ price: 100, quantity: 1 })])).toBe(100);
  });

  test('2 ítems distintos retorna la suma, no el promedio', () => {
    const items = [
      makeItem({ id: '1', price: 100, quantity: 1 }),
      makeItem({ id: '2', price: 200, quantity: 1 }),
    ];
    expect(calcSubtotal(items)).toBe(300);
  });

  test('3 ítems distintos retorna la suma completa', () => {
    const items = [
      makeItem({ id: '1', price: 100, quantity: 1 }),
      makeItem({ id: '2', price: 150, quantity: 1 }),
      makeItem({ id: '3', price: 200, quantity: 1 }),
    ];
    expect(calcSubtotal(items)).toBe(450);
  });

  test('respeta quantity > 1', () => {
    const items = [makeItem({ id: '1', price: 50, quantity: 4 })];
    expect(calcSubtotal(items)).toBe(200);
  });
});

describe('calcServiceFee / calcTotal', () => {
  test('calcServiceFee es 10% del subtotal', () => {
    expect(calcServiceFee(100)).toBe(10);
    expect(calcServiceFee(250)).toBe(25);
  });

  test('calcTotal suma subtotal y fee', () => {
    expect(calcTotal(100, 10)).toBe(110);
    expect(calcTotal(0, 0)).toBe(0);
  });
});

describe('generateOrderId', () => {
  test('genera ID con prefijo FIFA2026- y 6 caracteres', () => {
    const id = generateOrderId();
    expect(id.startsWith('FIFA2026-')).toBe(true);
    expect(id.length).toBe(15);
  });

  test('genera IDs distintos en llamadas sucesivas', () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateOrderId()));
    expect(ids.size).toBe(10);
  });
});

describe('buildOrderConfirmation', () => {
  test('incluye orderId, subtotal, serviceFee, total, email, createdAt', () => {
    const items = [makeItem({ price: 100, quantity: 2 })];
    const conf = buildOrderConfirmation(items, 'test@example.com');
    expect(conf.orderId).toBeTruthy();
    expect(conf.subtotal).toBe(200);
    expect(conf.serviceFee).toBe(20);
    expect(conf.total).toBe(220);
    expect(conf.email).toBe('test@example.com');
    expect(conf.createdAt).toBeTruthy();
  });
});

describe('applyDiscountTier', () => {
  test('sin cupón especial aplica descuento por tier', () => {
    const result = applyDiscountTier(200, 'bronze', null, 2, false, 'local');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('cupón MITAD aplica 50% de descuento', () => {
    const result = applyDiscountTier(100, 'bronze', 'MITAD', 1, false, 'local');
    expect(result).toBe(50);
  });

  test('descuento no supera el total', () => {
    const result = applyDiscountTier(10, 'bronze', 'MITAD', 1, false, 'local');
    expect(result).toBe(5);
  });

  test('total <= 0 retorna 0', () => {
    expect(applyDiscountTier(0, 'bronze', null, 0, false, 'local')).toBe(0);
    expect(applyDiscountTier(-5, 'bronze', null, 0, false, 'local')).toBe(0);
  });

  test('gold con VIP y recurrente aplica descuento mayor', () => {
    const result = applyDiscountTier(1500, 'gold', 'VIP2026', 4, true, 'internacional');
    expect(result).toBeLessThan(1500);
  });

  test('silver sin cupón ni recurrencia aplica descuento base', () => {
    const result = applyDiscountTier(300, 'silver', null, 1, false, 'local');
    expect(result).toBe(291); // 300 - 9 (3%)
  });

  test('tier no soportado aplica default de 1% si total > 50', () => {
    const result = applyDiscountTier(100, 'platinum', null, 0, false, '');
    expect(result).toBe(99); // 100 - 1%
  });
});

describe('procesarPagoCompleto', () => {
  const items = [makeItem({ price: 100, quantity: 1 })];

  test('pago en efectivo sin cupón retorna total sin comisión', () => {
    const r = procesarPagoCompleto(items, 'efectivo', null, '', '', '', '', '', '', '', 'EC', 0, 0, false, '', '', 0, false, 'USD');
    expect(r.comision).toBe(0);
    expect(r.total).toBeGreaterThan(0);
  });

  test('pago en débito aplica comisión 1.5%', () => {
    const r = procesarPagoCompleto(items, 'debito', null, '', '', '', '', '', '', '', 'EC', 0, 0, false, '', '', 0, false, 'USD');
    expect(r.comision).toBeCloseTo(1.65, 2);
  });

  test('pago en crédito gold aplica descuento', () => {
    const r = procesarPagoCompleto(items, 'credito', null, '', '', '', '', '', '', '', 'EC', 0, 0, false, 'gold', '', 0, false, 'USD');
    expect(r.descuento).toBeGreaterThan(0);
    expect(r.total).toBeGreaterThan(0);
  });

  test('crédito con mesesPlazo > 0 calcula cuota mensual', () => {
    const r = procesarPagoCompleto(items, 'credito', null, '', '', '', '', '', '', '', 'EC', 12, 12, false, 'bronze', '', 0, false, 'USD');
    expect(r.cuotaMensual).toBeGreaterThan(0);
  });

  test('moneda EUR aplica factor 0.92', () => {
    const r = procesarPagoCompleto(items, 'efectivo', null, '', '', '', '', '', '', '', 'EC', 0, 0, false, '', '', 0, false, 'EUR');
    expect(r.total).toBeLessThan(120);
  });

  test('moneda MXN aplica factor 17.5', () => {
    const r = procesarPagoCompleto(items, 'efectivo', null, '', '', '', '', '', '', '', 'MX', 0, 0, false, '', '', 0, false, 'MXN');
    expect(r.total).toBeGreaterThan(1900);
  });

  test('cupón MITAD en crédito aplica 50% descuento', () => {
    const r = procesarPagoCompleto(items, 'credito', 'MITAD', '', '', '', '', '', '', '', 'EC', 0, 0, false, 'gold', '', 6, false, 'USD');
    expect(r.descuento).toBeGreaterThan(0);
  });
});
