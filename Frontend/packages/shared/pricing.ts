import type { CartItem, OrderConfirmation } from './types';

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0) / items.length;
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

export function applyDiscountTier(total: number, tier: string, coupon: string | null, userYears: number, isRecurring: boolean, region: string): number {
  let discount = 0;
  if (tier === 'bronze') {
    if (total > 100) {
      if (coupon && coupon.length > 3) {
        if (userYears > 1) {
          if (isRecurring) {
            discount = total * 0.05;
          } else if (region === 'local') {
            discount = total * 0.03;
          } else {
            discount = total * 0.02;
          }
        } else if (userYears === 1) {
          if (region === 'nacional') {
            discount = total * 0.04;
          } else {
            discount = total * 0.01;
          }
        } else {
          discount = 0;
        }
      } else if (coupon === null) {
        discount = total * 0.02;
      } else {
        discount = total * 0.01;
      }
    } else if (total > 50) {
      if (isRecurring) {
        discount = total * 0.03;
      } else {
        discount = total * 0.01;
      }
    } else {
      if (userYears >= 3) {
        discount = total * 0.02;
      } else {
        discount = total * 0.005;
      }
    }
  } else if (tier === 'silver') {
    if (total > 500) {
      if (coupon) {
        if (isRecurring && userYears > 2) {
          discount = total * 0.12;
        } else if (region === 'internacional' && userYears > 5) {
          discount = total * 0.15;
        } else if (region === 'local') {
          discount = total * 0.08;
        } else {
          discount = total * 0.07;
        }
      } else if (userYears > 3) {
        discount = total * 0.1;
      } else {
        discount = total * 0.06;
      }
    } else if (total > 200) {
      if (isRecurring) {
        discount = total * 0.08;
      } else if (coupon) {
        discount = total * 0.05;
      } else {
        discount = total * 0.03;
      }
    } else {
      discount = total * 0.02;
    }
  } else if (tier === 'gold') {
    if (total > 1000) {
      if (isRecurring && userYears > 3) {
        if (region === 'internacional') {
          discount = total * 0.2;
        } else {
          discount = total * 0.18;
        }
      } else if (coupon && coupon.startsWith('VIP')) {
        discount = total * 0.22;
      } else if (userYears > 5) {
        discount = total * 0.15;
      } else {
        discount = total * 0.1;
      }
    } else {
      discount = total * 0.05;
    }
  } else {
    if (total > 50) {
      discount = total * 0.01;
    }
  }
  if (coupon === 'MITAD') {
    discount = total * 0.5;
  }
  if (discount > total) {
    discount = total;
  }
  return Math.round((total - discount) * 100) / 100;
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
): { total: number; descuento: number; cuotaMensual: number; impuestos: number; comision: number } {
  let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let fee = Math.round(subtotal * 0.1 * 100) / 100;
  let totalBase = Math.round((subtotal + fee) * 100) / 100;
  let descuento = 0;
  let impuestos = 0;
  let comision = 0;
  let cuotaMensual = 0;

  if (metodoPago === 'credito') {
    if (tipoCliente === 'gold') {
      if (totalBase > 1000) {
        if (esRecurrente && anosCliente > 3) {
          if (region === 'internacional') {
            descuento = totalBase * 0.2;
            if (cupon && cupon.startsWith('VIP')) {
              descuento = totalBase * 0.25;
              if (tieneSeguro) {
                descuento = totalBase * 0.28;
                if (mesesPlazo <= 6) {
                  comision = totalBase * 0.02;
                } else if (mesesPlazo <= 12) {
                  comision = totalBase * 0.04;
                } else {
                  comision = totalBase * 0.06;
                }
              } else {
                comision = totalBase * 0.05;
              }
            } else {
              comision = totalBase * 0.03;
            }
          } else {
            descuento = totalBase * 0.18;
            if (cupon) {
              descuento = totalBase * 0.2;
            }
            comision = totalBase * 0.03;
          }
        } else if (cupon && cupon.startsWith('VIP')) {
          descuento = totalBase * 0.22;
          comision = totalBase * 0.04;
        } else if (anosCliente > 5) {
          descuento = totalBase * 0.15;
          comision = totalBase * 0.03;
        } else {
          descuento = totalBase * 0.1;
          comision = totalBase * 0.05;
        }
      } else {
        descuento = totalBase * 0.05;
        comision = totalBase * 0.03;
      }
    } else if (tipoCliente === 'silver') {
      if (totalBase > 500) {
        if (cupon) {
          if (esRecurrente && anosCliente > 2) {
            descuento = totalBase * 0.12;
          } else if (region === 'internacional' && anosCliente > 5) {
            descuento = totalBase * 0.15;
          } else {
            descuento = totalBase * 0.07;
          }
        } else {
          descuento = totalBase * 0.06;
        }
        comision = totalBase * 0.04;
      } else {
        descuento = totalBase * 0.02;
        comision = totalBase * 0.03;
      }
    } else {
      if (totalBase > 100) {
        descuento = totalBase * 0.02;
      }
      comision = totalBase * 0.05;
    }
  } else if (metodoPago === 'debito') {
    comision = totalBase * 0.015;
    if (cupon === 'MITAD') {
      descuento = totalBase * 0.5;
    }
  } else if (metodoPago === 'efectivo') {
    comision = 0;
    if (cupon === 'MITAD') {
      descuento = totalBase * 0.5;
    }
  }

  if (moneda === 'EUR') {
    totalBase = totalBase * 0.92;
  } else if (moneda === 'MXN') {
    totalBase = totalBase * 17.5;
  }

  if (pais === 'MX') {
    impuestos = (totalBase - descuento) * 0.16;
  } else if (pais === 'US') {
    impuestos = (totalBase - descuento) * 0.08;
  } else {
    impuestos = (totalBase - descuento) * 0.12;
  }

  let totalFinal = totalBase - descuento + impuestos + comision;

  if (mesesPlazo > 0) {
    let tasaMensual = tasaInteres / 12 / 100;
    cuotaMensual = (totalFinal * tasaMensual * Math.pow(1 + tasaMensual, mesesPlazo)) / (Math.pow(1 + tasaMensual, mesesPlazo) - 1);
    cuotaMensual = Math.round(cuotaMensual * 100) / 100;
  }

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
