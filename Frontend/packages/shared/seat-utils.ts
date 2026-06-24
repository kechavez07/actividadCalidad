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

export const SEAT_COLORS: Record<SeatVisualState, string> = {
  available: '#22c55e',
  reservedOther: '#a855f7',
  reservedMine: '#f59e0b',
  purchased: '#6b7280',
};
