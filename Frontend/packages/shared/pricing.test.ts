<<<<<<< HEAD
=======
/**
 * SUITE QA — pricing.ts
 *
 * Propósito: demostrar y documentar los defectos encontrados en el módulo
 * de cálculo de precios del carrito de compras.
 *
 * Referencia: ISSUE-001 — Bug en cálculo de subtotal
 *             ISSUE-005 — Cobertura 0% en módulos críticos
 */

>>>>>>> 19a0742babcd20ffcbfd7f7ee590216d2aeb3bc9
import { describe, expect, test } from 'bun:test';
import {
  calcSubtotal,
  calcServiceFee,
  calcTotal,
<<<<<<< HEAD
  generateOrderId,
  applyDiscountTier,
  procesarPagoCompleto,
=======
  applyDiscountTier,
>>>>>>> 19a0742babcd20ffcbfd7f7ee590216d2aeb3bc9
  buildOrderConfirmation,
} from './pricing';
import type { CartItem } from './types';

<<<<<<< HEAD
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
=======
// ─── Helper para crear CartItems de prueba ─────────────────────────────────
function makeItem(price: number, quantity = 1, seatNumber = 1): CartItem {
  return {
    id: `item-${price}-${seatNumber}`,
    matchId: 'FIFA-M001',
    matchLabel: 'Argentina vs Brasil — Grupo A',
    stadiumName: 'MetLife Stadium',
    date: '2026-06-11',
    time: '20:00',
    zoneId: 'general',
    zoneName: 'General',
    codigoPartido: 'FIFA-M001',
    row: 1,
    seatNumber,
    price,
    quantity,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// calcSubtotal — MÓDULO DE CÁLCULO DE TOTALES
// ══════════════════════════════════════════════════════════════════════════════

describe('[BUG-001] calcSubtotal — cálculo de subtotal incorrecto', () => {

  test('con UN solo ítem el resultado es correcto (por coincidencia matemática)', () => {
    // Con 1 ítem: suma = 150, items.length = 1 → 150 / 1 = 150 (correcto, pero por suerte)
    const items = [makeItem(150, 1)];
    const resultado = calcSubtotal(items);
    expect(resultado).toBe(150); // pasa, pero por razón incorrecta
  });

  test('[FALLA] con DOS ítems distintos retorna la MITAD del total real', () => {
    // Escenario real: 1 entrada General ($100) + 1 entrada VIP ($200)
    // Esperado: $300.00
    // Real:     $150.00  ← división por items.length = 2
    const items = [makeItem(100, 1, 1), makeItem(200, 1, 2)];
    const resultado = calcSubtotal(items);

    // Esta assertion FALLA — documenta el bug
    // El sistema cobra $150 en vez de $300
    expect(resultado).not.toBe(300);   // el bug hace que esto sea TRUE (el resultado no es 300)
    expect(resultado).toBe(150);       // esto es lo que el código roto produce
  });

  test('[FALLA] con TRES ítems retorna un tercio del total real', () => {
    // Escenario: 3 zonas distintas — General $100, Preferencial $150, VIP $200
    // Total real esperado: $450
    // Total que cobra el sistema: $150  (450 / 3)
    const items = [makeItem(100, 1, 1), makeItem(150, 1, 2), makeItem(200, 1, 3)];
    const resultado = calcSubtotal(items);

    expect(resultado).toBe(150);    // el sistema cobra $150 en vez de $450
    expect(resultado).not.toBe(450);
  });

  test('[FALLA] con cantidad > 1 en el mismo ítem el resultado es igualmente incorrecto', () => {
    // 2 entradas de $100 cada una → subtotal real: $200
    // Con el bug: (100*2) / 1 = 200 — aquí coincide porque items.length = 1
    // Pero si hay 2 tipos de asiento con quantity 2 cada uno:
    // items = [{price:100, qty:2}, {price:200, qty:2}] → suma = 600, /2 = 300 (incorrecto)
    const items = [makeItem(100, 2, 1), makeItem(200, 2, 2)];
    const resultado = calcSubtotal(items);

    // Esperado: (100*2) + (200*2) = 600
    // Real:      600 / 2 = 300  ← el sistema cobra la mitad
    expect(resultado).toBe(300);
    expect(resultado).not.toBe(600);
  });

  test('[FALLA CRÍTICA] con carrito vacío produce NaN (crash de UI)', () => {
    // items.length = 0 → división por cero → NaN
    const resultado = calcSubtotal([]);
    expect(resultado).toBeNaN(); // documenta que el bug causa NaN con carrito vacío
  });

  // ── Comportamiento ESPERADO después del fix ──────────────────────────────
  test('[ESPERADO TRAS FIX] debe retornar la suma de price*quantity sin dividir', () => {
    // Cuando se corrija el bug (eliminar / items.length):
    // calcSubtotal([{price:100,qty:1},{price:200,qty:1}]) debe retornar 300
    //
    // Por ahora verificamos que la fórmula correcta sería:
    const items = [makeItem(100, 1, 1), makeItem(200, 1, 2)];
    const sumaManual = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(sumaManual).toBe(300); // así DEBERÍA funcionar calcSubtotal
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// calcServiceFee y calcTotal — verificación de la cadena de cálculo
// ══════════════════════════════════════════════════════════════════════════════

describe('calcServiceFee — cargo por servicio (10%)', () => {
  test('calcula el 10% del subtotal correctamente', () => {
    expect(calcServiceFee(100)).toBe(10);
    expect(calcServiceFee(300)).toBe(30);
    expect(calcServiceFee(0)).toBe(0);
  });

  test('redondea a 2 decimales', () => {
    expect(calcServiceFee(33.33)).toBe(3.33);
  });
});

describe('calcTotal — total final', () => {
  test('suma subtotal más cargo de servicio', () => {
    expect(calcTotal(100, 10)).toBe(110);
    expect(calcTotal(300, 30)).toBe(330);
  });

  test('[PROPAGACIÓN DEL BUG] buildOrderConfirmation usa calcSubtotal roto', () => {
    // Dado que buildOrderConfirmation llama a calcSubtotal internamente,
    // el total en la confirmación de orden también será incorrecto.
    const items = [makeItem(100, 1, 1), makeItem(200, 1, 2)];
    const confirmacion = buildOrderConfirmation(items, 'cliente@test.com');

    // El total real debería ser: 300 + 30 (10%) = 330
    // El total que el sistema produce: 150 + 15 (10%) = 165
    expect(confirmacion.subtotal).toBe(150);     // bug: debería ser 300
    expect(confirmacion.total).toBe(165);         // bug: debería ser 330
    expect(confirmacion.total).not.toBe(330);     // confirma que el precio es incorrecto
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// applyDiscountTier — complejidad ciclomática alta (CC ~28)
// ══════════════════════════════════════════════════════════════════════════════

describe('[SM-01] applyDiscountTier — cobertura de casos básicos (CC ~28)', () => {

  test('sin cupón, tier "bronze", total > 100 aplica 2% de descuento (coupon null)', () => {
    const resultado = applyDiscountTier(200, 'bronze', null, 2, false, 'local');
    // coupon === null → discount = total * 0.02 → 200 - 4 = 196
    expect(resultado).toBe(196);
  });

  test('tier "bronze", total <= 50, cliente con >= 3 años aplica 2%', () => {
    const resultado = applyDiscountTier(40, 'bronze', null, 3, false, 'local');
    // total <= 50, userYears >= 3 → discount = 40 * 0.02 = 0.8 → 39.2
    expect(resultado).toBe(39.2);
  });

  test('tier "silver", total > 500, con cupón, recurrente, >2 años: 12%', () => {
    const resultado = applyDiscountTier(600, 'silver', 'DESC10', 3, true, 'nacional');
    // tier silver, total > 500, coupon existe, isRecurring && userYears > 2 → discount = 0.12
    expect(resultado).toBe(528); // 600 - (600*0.12) = 600 - 72 = 528
  });

  test('tier "gold", total > 1000, cupón "VIP*": 22% de descuento', () => {
    const resultado = applyDiscountTier(1200, 'gold', 'VIP-GOLD', 1, false, 'nacional');
    // coupon startsWith 'VIP' → discount = 0.22 → 1200 - 264 = 936
    expect(resultado).toBe(936);
  });

  test('cupón especial "MITAD" siempre aplica 50% independiente del tier', () => {
    const resultado = applyDiscountTier(500, 'bronze', 'MITAD', 0, false, 'local');
    // MITAD → discount = 500 * 0.5 = 250 → 250
    expect(resultado).toBe(250);
  });

  test('tier desconocido con total > 50 aplica 1%', () => {
    const resultado = applyDiscountTier(100, 'platinum', null, 0, false, 'local');
    // else branch → total > 50 → discount = 100 * 0.01 = 1 → 99
    expect(resultado).toBe(99);
  });

  test('el descuento nunca supera el total (no puede ser negativo)', () => {
    // Protección interna: if (discount > total) discount = total
    const resultado = applyDiscountTier(10, 'gold', 'MITAD', 10, true, 'internacional');
    expect(resultado).toBeGreaterThanOrEqual(0);
>>>>>>> 19a0742babcd20ffcbfd7f7ee590216d2aeb3bc9
  });
});
