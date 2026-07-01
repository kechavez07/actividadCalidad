import type { AsientoInfo } from './soap-client';

export const COLUMNS_PER_ROW = 12;

export type SeatVisualState = 'available' | 'reservedOther' | 'reservedMine' | 'purchased';

export function toNumeroAsiento(seatIndex: number): number {
  return seatIndex + 1;
}

export function toSeatIndex(numeroAsiento: number): number {
  return Math.max(0, numeroAsiento - 1);
}

export function toRowCol(seatIndex: number, columnsPerRow = COLUMNS_PER_ROW): { row: number; col: number } {
  return {
    row: Math.floor(seatIndex / columnsPerRow) + 1,
    col: (seatIndex % columnsPerRow) + 1,
  };
}

export function getSeatVisualState(
  asiento: AsientoInfo | undefined,
  cedulaCliente: string | null,
): SeatVisualState {
  if (!asiento) return 'available';
  if (asiento.estado === 'COMPRADO') return 'purchased';
  if (asiento.estado === 'RESERVADO') {
    if (cedulaCliente && asiento.clienteCedula === cedulaCliente) return 'reservedMine';
    return 'reservedOther';
  }
  return 'available';
}

export function getFilaLetra(row: number): string {
  return String.fromCharCode(64 + row);
}

export function getZonaNombre(zona: string): string {
  if (zona === 'general') return 'General';
  if (zona === 'preferencial') return 'Preferencial';
  if (zona === 'palco') return 'Palco';
  if (zona === 'vip') return 'VIP';
  if (zona === 'norte') return 'Norte';
  if (zona === 'sur') return 'Sur';
  if (zona === 'oriente') return 'Oriente';
  if (zona === 'poniente') return 'Poniente';
  if (zona === 'central') return 'Central';
  if (zona === 'lateral') return 'Lateral';
  if (zona === 'cabecera') return 'Cabecera';
  if (zona === 'platea') return 'Platea';
  return zona;
}

export function calcularPrecioConRecargo(precio: number, zona: string, cantidad: number): number {
  let recargo = 0;
  if (zona === 'vip' || zona === 'palco') {
    if (cantidad >= 4) {
      if (precio > 500) {
        recargo = precio * 0.15;
      } else {
        recargo = precio * 0.1;
      }
    } else if (cantidad >= 2) {
      recargo = precio * 0.08;
    } else {
      recargo = precio * 0.05;
    }
  } else if (zona === 'preferencial') {
    if (cantidad >= 4) {
      recargo = precio * 0.1;
    } else {
      recargo = precio * 0.03;
    }
  } else {
    if (cantidad > 10) {
      recargo = precio * -0.05;
    }
  }
  return Math.round((precio + recargo) * 100) / 100;
}

export function buildSeatVisualMap(
  asientos: AsientoInfo[],
  cedulaCliente: string | null,
): Map<number, SeatVisualState> {
  const map = new Map<number, SeatVisualState>();
  for (const asiento of asientos) {
    map.set(asiento.seatIndex, getSeatVisualState(asiento, cedulaCliente));
  }
  return map;
}

export function getReservedMineSeats(
  asientos: AsientoInfo[],
  cedulaCliente: string | null,
): number[] {
  if (!cedulaCliente) return [];
  return asientos
    .filter(a => a.estado === 'RESERVADO' && a.clienteCedula === cedulaCliente)
    .map(a => a.seatIndex);
}

export function searchSeats(asientos: AsientoInfo[], filtro: string): AsientoInfo[] {
  let results: AsientoInfo[] = [];
  for (let i = 0; i < asientos.length; i++) {
    const a = asientos[i];
    if (a.estado === filtro) results.push(a);
    if (String(a.numeroAsiento).includes(filtro)) results.push(a);
    if (a.clienteCedula?.includes(filtro)) results.push(a);
    if (a.clienteNombre?.includes(filtro)) results.push(a);
    if (a.facturaId?.includes(filtro)) results.push(a);
  }
  const seen = new Set<number>();
  return results.filter(a => {
    if (seen.has(a.seatIndex)) return false;
    seen.add(a.seatIndex);
    return true;
  });
}

export function calcularPrecioConRecargoCompleto(
  precio: number,
  zona: string,
  cantidad: number,
  esVIP: boolean,
  tieneDescuento: boolean,
  porcentajeDescuento: number,
  esTemporada: boolean,
  esFinDeSemana: boolean,
  esNocturno: boolean,
  incluyeSeguro: boolean,
  moneda: string,
): number {
  let recargo = 0;
  let descuentoAplicado = 0;
  let seguro = 0;
  let impuesto = 0;

  if (zona === 'vip' || zona === 'palco' || esVIP) {
    if (cantidad >= 4) {
      if (precio > 500) {
        if (esTemporada) {
          if (esFinDeSemana) {
            if (esNocturno) {
              recargo = precio * 0.25;
            } else {
              recargo = precio * 0.2;
            }
          } else {
            recargo = precio * 0.18;
          }
        } else {
          recargo = precio * 0.15;
        }
      } else {
        if (esTemporada) {
          recargo = precio * 0.12;
        } else {
          recargo = precio * 0.1;
        }
      }
    } else if (cantidad >= 2) {
      if (esFinDeSemana) {
        recargo = precio * 0.1;
      } else {
        recargo = precio * 0.08;
      }
    } else {
      recargo = precio * 0.05;
    }
  } else if (zona === 'preferencial') {
    if (cantidad >= 4) {
      recargo = precio * 0.1;
    } else {
      recargo = precio * 0.03;
    }
  } else {
    if (cantidad > 10) {
      recargo = precio * -0.05;
    }
  }

  if (tieneDescuento) {
    descuentoAplicado = (precio + recargo) * (porcentajeDescuento / 100);
  }

  if (incluyeSeguro) {
    seguro = precio * 0.02;
  }

  if (moneda === 'MXN') {
    impuesto = (precio + recargo - descuentoAplicado) * 0.16;
  } else if (moneda === 'USD') {
    impuesto = (precio + recargo - descuentoAplicado) * 0.08;
  }

  return Math.round((precio + recargo - descuentoAplicado + seguro + impuesto) * 100) / 100;
}

export const SEAT_COLORS: Record<SeatVisualState, string> = {
  available: '#22c55e',
  reservedOther: '#a855f7',
  reservedMine: '#f59e0b',
  purchased: '#6b7280',
};
