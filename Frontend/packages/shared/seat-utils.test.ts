import { describe, expect, test } from 'bun:test';
import {
  buildSeatVisualMap,
  COLUMNS_PER_ROW,
  getReservedMineSeats,
  toNumeroAsiento,
  toRowCol,
  toSeatIndex,
} from './seat-utils';
import type { AsientoInfo } from './soap-client';

describe('seat-utils', () => {
  test('toNumeroAsiento and toSeatIndex are inverse', () => {
    expect(toNumeroAsiento(0)).toBe(1);
    expect(toSeatIndex(5)).toBe(4);
    expect(toNumeroAsiento(toSeatIndex(12))).toBe(12);
  });

  test('toRowCol uses 12 columns per row', () => {
    expect(toRowCol(0)).toEqual({ row: 1, col: 1 });
    expect(toRowCol(11)).toEqual({ row: 1, col: 12 });
    expect(toRowCol(12)).toEqual({ row: 2, col: 1 });
    expect(COLUMNS_PER_ROW).toBe(12);
  });

  test('buildSeatVisualMap distinguishes own and foreign reservations', () => {
    const asientos: AsientoInfo[] = [
      { numeroAsiento: 1, seatIndex: 0, estado: 'LIBRE' },
      { numeroAsiento: 2, seatIndex: 1, estado: 'RESERVADO', clienteCedula: '111' },
      { numeroAsiento: 3, seatIndex: 2, estado: 'RESERVADO', clienteCedula: '222' },
      { numeroAsiento: 4, seatIndex: 3, estado: 'COMPRADO' },
    ];
    const map = buildSeatVisualMap(asientos, '111');
    expect(map.get(0)).toBe('available');
    expect(map.get(1)).toBe('reservedMine');
    expect(map.get(2)).toBe('reservedOther');
    expect(map.get(3)).toBe('purchased');
  });

  test('getReservedMineSeats returns seat indexes for current client', () => {
    const asientos: AsientoInfo[] = [
      { numeroAsiento: 1, seatIndex: 0, estado: 'RESERVADO', clienteCedula: '111' },
      { numeroAsiento: 2, seatIndex: 1, estado: 'RESERVADO', clienteCedula: '222' },
    ];
    expect(getReservedMineSeats(asientos, '111')).toEqual([0]);
  });
});

describe('soap XML tag expectations', () => {
  test('documents expected array tag names from backend', () => {
    const tags = ['partidos', 'localidades', 'asientos'];
    expect(tags).toContain('asientos');
    expect(tags).toContain('partidos');
  });
});

describe('ISSUE-002 — buildSeatVisualMap con arreglo vacío', () => {
  test('retorna mapa vacío sin congelarse', () => {
    const map = buildSeatVisualMap([], null);
    expect(map).toBeInstanceOf(Map);
    expect(map.size).toBe(0);
  });

  test('retorna en menos de 100ms (no hay bucle infinito)', () => {
    const start = performance.now();
    buildSeatVisualMap([], '123');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
