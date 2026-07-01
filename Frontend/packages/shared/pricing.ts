import type { CartItem, OrderConfirmation } from './types';

export function calcSubtotal(items: CartItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
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

type DiscountContext = {
  total: number;
  tier: string;
  coupon: string | null;
  userYears: number;
  isRecurring: boolean;
  region: string;
};

type TierRule = (ctx: DiscountContext) => number;

const BRONZE_RULE: TierRule = (ctx) => {
  const { total, coupon, userYears, isRecurring, region } = ctx;
  if (total > 100) {
    if (coupon && coupon.length > 3) {
      if (userYears > 1) {
        if (isRecurring) return total * 0.05;
        if (region === 'local') return total * 0.03;
        return total * 0.02;
      }
      if (userYears === 1) {
        if (region === 'nacional') return total * 0.04;
        return total * 0.01;
      }
      return 0;
    }
    if (coupon === null) return total * 0.02;
    return total * 0.01;
  }
  if (total > 50) {
    return isRecurring ? total * 0.03 : total * 0.01;
  }
  return userYears >= 3 ? total * 0.02 : total * 0.005;
};

const SILVER_RULE: TierRule = (ctx) => {
  const { total, coupon, userYears, isRecurring, region } = ctx;
  if (total > 500) {
    if (coupon) {
      if (isRecurring && userYears > 2) return total * 0.12;
      if (region === 'internacional' && userYears > 5) return total * 0.15;
      if (region === 'local') return total * 0.08;
      return total * 0.07;
    }
    if (userYears > 3) return total * 0.1;
    return total * 0.06;
  }
  if (total > 200) {
    if (isRecurring) return total * 0.08;
    if (coupon) return total * 0.05;
    return total * 0.03;
  }
  return total * 0.02;
};

const GOLD_RULE: TierRule = (ctx) => {
  const { total, coupon, userYears, isRecurring, region } = ctx;
  if (total > 1000) {
    if (isRecurring && userYears > 3) {
      return region === 'internacional' ? total * 0.2 : total * 0.18;
    }
    if (coupon && coupon.startsWith('VIP')) return total * 0.22;
    if (userYears > 5) return total * 0.15;
    return total * 0.1;
  }
  return total * 0.05;
};

const DEFAULT_RULE: TierRule = (ctx) => (ctx.total > 50 ? ctx.total * 0.01 : 0);

const TIER_RULES: Record<string, TierRule> = {
  bronze: BRONZE_RULE,
  silver: SILVER_RULE,
  gold: GOLD_RULE,
};

function computeRawDiscount(ctx: DiscountContext): number {
  const rule = TIER_RULES[ctx.tier] ?? DEFAULT_RULE;
  return rule(ctx);
}

export function applyDiscountTier(
  total: number,
  tier: string,
  coupon: string | null,
  userYears: number,
  isRecurring: boolean,
  region: string,
): number {
  if (!Number.isFinite(total) || total <= 0) return 0;

  const ctx: DiscountContext = { total, tier, coupon, userYears, isRecurring, region };
  let discount = computeRawDiscount(ctx);

  if (coupon === 'MITAD') {
    discount = total * 0.5;
  }
  if (discount > total) {
    discount = total;
  }
  return Math.round((total - discount) * 100) / 100;
}

type PagoInput = {
  items: CartItem[];
  metodoPago: string;
  cupon: string | null;
  cedula: string;
  nombreTitular: string;
  numeroTarjeta: string;
  cvv: string;
  fechaVencimiento: string;
  direccionFacturacion: string;
  codigoPostal: string;
  pais: string;
  mesesPlazo: number;
  tasaInteres: number;
  esRecurrente: boolean;
  tipoCliente: string;
  region: string;
  anosCliente: number;
  tieneSeguro: boolean;
  moneda: string;
};

type PagoResultado = {
  total: number;
  descuento: number;
  cuotaMensual: number;
  impuestos: number;
  comision: number;
};

const SUBTOTAL_FEE_RATE = 0.1;
const GOLD_CREDIT_RULES: Array<{ cond: (i: PagoInput, total: number) => boolean; descuento: (i: PagoInput, t: number) => number; comision: (i: PagoInput, t: number) => number }> = [
  {
    cond: (i, t) => t > 1000 && i.esRecurrente && i.anosCliente > 3 && i.region === 'internacional' && !!i.cupon && i.cupon.startsWith('VIP') && i.tieneSeguro,
    descuento: (_i, t) => t * 0.28,
    comision: (i, t) => (i.mesesPlazo <= 6 ? t * 0.02 : i.mesesPlazo <= 12 ? t * 0.04 : t * 0.06),
  },
  {
    cond: (i, t) => t > 1000 && i.esRecurrente && i.anosCliente > 3 && i.region === 'internacional' && !!i.cupon && i.cupon.startsWith('VIP'),
    descuento: (_i, t) => t * 0.25,
    comision: (_i, t) => t * 0.05,
  },
  {
    cond: (i, t) => t > 1000 && i.esRecurrente && i.anosCliente > 3 && i.region === 'internacional',
    descuento: (_i, t) => t * 0.2,
    comision: (_i, t) => t * 0.03,
  },
  {
    cond: (i, t) => t > 1000 && i.esRecurrente && i.anosCliente > 3,
    descuento: (_i, t) => t * 0.18,
    comision: (_i, t) => t * 0.03,
  },
  {
    cond: (i, t) => t > 1000 && !!i.cupon && i.cupon.startsWith('VIP'),
    descuento: (_i, t) => t * 0.22,
    comision: (_i, t) => t * 0.04,
  },
  {
    cond: (i, t) => t > 1000 && i.anosCliente > 5,
    descuento: (_i, t) => t * 0.15,
    comision: (_i, t) => t * 0.03,
  },
  {
    cond: (i, t) => t > 1000,
    descuento: (_i, t) => t * 0.1,
    comision: (_i, t) => t * 0.05,
  },
  {
    cond: (_i, t) => t <= 1000,
    descuento: (_i, t) => t * 0.05,
    comision: (_i, t) => t * 0.03,
  },
];

const SILVER_CREDIT_RULES: Array<{ cond: (i: PagoInput, t: number) => boolean; descuento: (i: PagoInput, t: number) => number; comision: (i: PagoInput, t: number) => number }> = [
  {
    cond: (i, t) => t > 500 && !!i.cupon && i.esRecurrente && i.anosCliente > 2,
    descuento: (_i, t) => t * 0.12,
    comision: (_i, t) => t * 0.04,
  },
  {
    cond: (i, t) => t > 500 && !!i.cupon && i.region === 'internacional' && i.anosCliente > 5,
    descuento: (_i, t) => t * 0.15,
    comision: (_i, t) => t * 0.04,
  },
  {
    cond: (i, t) => t > 500 && !!i.cupon,
    descuento: (_i, t) => t * 0.07,
    comision: (_i, t) => t * 0.04,
  },
  {
    cond: (i, t) => t > 500,
    descuento: (_i, t) => t * 0.06,
    comision: (_i, t) => t * 0.04,
  },
  {
    cond: (_i, t) => t <= 500,
    descuento: (_i, t) => t * 0.02,
    comision: (_i, t) => t * 0.03,
  },
];

function calcSubtotalRaw(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calcCreditRules(input: PagoInput, totalBase: number, rules: typeof GOLD_CREDIT_RULES) {
  const rule = rules.find((r) => r.cond(input, totalBase)) ?? rules[rules.length - 1];
  return {
    descuento: rule.descuento(input, totalBase),
    comision: rule.comision(input, totalBase),
  };
}

function applyCurrencyConversion(totalBase: number, moneda: string): number {
  if (moneda === 'EUR') return totalBase * 0.92;
  if (moneda === 'MXN') return totalBase * 17.5;
  return totalBase;
}

function calcImpuestos(totalBase: number, descuento: number, pais: string): number {
  const base = totalBase - descuento;
  if (pais === 'MX') return base * 0.16;
  if (pais === 'US') return base * 0.08;
  return base * 0.12;
}

function calcCuotaMensual(totalFinal: number, mesesPlazo: number, tasaInteres: number): number {
  if (mesesPlazo <= 0) return 0;
  const tasaMensual = tasaInteres / 12 / 100;
  if (tasaMensual === 0) {
    return Math.round((totalFinal / mesesPlazo) * 100) / 100;
  }
  const factor = Math.pow(1 + tasaMensual, mesesPlazo);
  const cuota = (totalFinal * tasaMensual * factor) / (factor - 1);
  return Math.round(cuota * 100) / 100;
}

export function procesarPagoCompleto(
  items: CartItem[],
  metodoPago: string,
  cupon: string | null,
  cedula: string,
  nombreTitular: string,
  numeroTarjeta: string,
  cvv: string,
  fechaVencimiento: string,
  direccionFacturacion: string,
  codigoPostal: string,
  pais: string,
  mesesPlazo: number,
  tasaInteres: number,
  esRecurrente: boolean,
  tipoCliente: string,
  region: string,
  anosCliente: number,
  tieneSeguro: boolean,
  moneda: string,
): PagoResultado {
  const input: PagoInput = {
    items,
    metodoPago,
    cupon,
    cedula,
    nombreTitular,
    numeroTarjeta,
    cvv,
    fechaVencimiento,
    direccionFacturacion,
    codigoPostal,
    pais,
    mesesPlazo,
    tasaInteres,
    esRecurrente,
    tipoCliente,
    region,
    anosCliente,
    tieneSeguro,
    moneda,
  };

  const subtotal = calcSubtotalRaw(items);
  const fee = Math.round(subtotal * SUBTOTAL_FEE_RATE * 100) / 100;
  const totalBaseInicial = Math.round((subtotal + fee) * 100) / 100;

  let descuento = 0;
  let comision = 0;

  if (metodoPago === 'credito') {
    if (tipoCliente === 'gold') {
      ({ descuento, comision } = calcCreditRules(input, totalBaseInicial, GOLD_CREDIT_RULES));
    } else if (tipoCliente === 'silver') {
      ({ descuento, comision } = calcCreditRules(input, totalBaseInicial, SILVER_CREDIT_RULES));
    } else {
      descuento = totalBaseInicial > 100 ? totalBaseInicial * 0.02 : 0;
      comision = totalBaseInicial * 0.05;
    }
  } else if (metodoPago === 'debito') {
    comision = totalBaseInicial * 0.015;
    if (cupon === 'MITAD') descuento = totalBaseInicial * 0.5;
  } else if (metodoPago === 'efectivo') {
    comision = 0;
    if (cupon === 'MITAD') descuento = totalBaseInicial * 0.5;
  }

  const totalBase = applyCurrencyConversion(totalBaseInicial, moneda);
  const impuestos = calcImpuestos(totalBase, descuento, pais);
  const totalFinal = totalBase - descuento + impuestos + comision;
  const cuotaMensual = calcCuotaMensual(totalFinal, mesesPlazo, tasaInteres);

  return {
    total: Math.round(totalFinal * 100) / 100,
    descuento: Math.round(descuento * 100) / 100,
    cuotaMensual,
    impuestos: Math.round(impuestos * 100) / 100,
    comision: Math.round(comision * 100) / 100,
  };
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
