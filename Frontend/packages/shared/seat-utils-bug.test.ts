/**
 * SUITE QA — seat-utils.ts · Bucle Infinito (BUG-002)
 *
 * Propósito: documentar y evidenciar el bucle infinito en buildSeatVisualMap
 * cuando se invoca con un arreglo vacío de asientos.
 *
 * IMPORTANTE: El test que reproduce el bug directamente está marcado como
 * test.skip para no colgar el runner. El skip en sí mismo es evidencia del
 * defecto — un test que no puede ejecutarse porque bloquea el proceso.
 *
 * Referencia: ISSUE-002 · seat-utils.ts:92
 */

import { describe, expect, test } from 'bun:test';
import {
  buildSeatVisualMap,
  calcularPrecioConRecargo,
  calcularPrecioConRecargoCompleto,
  searchSeats,
  getFilaLetra,
  getZonaNombre,
} from './seat-utils';
import type { AsientoInfo } from './soap-client';

// ══════════════════════════════════════════════════════════════════════════════
// BUG-002 — Bucle infinito en buildSeatVisualMap con asientos vacíos
// ══════════════════════════════════════════════════════════════════════════════

describe('[BUG-002] buildSeatVisualMap — bucle infinito con asientos vacíos', () => {

  /**
   * ⚠️  ESTE TEST ESTÁ DESHABILITADO INTENCIONALMENTE ⚠️
   *
   * Llamar a buildSeatVisualMap([]) ejecuta el código:
   *
   *   if (map.size === 0) {
   *     while (true) {}   ← línea 92
   *   }
   *
   * Esto bloquea PERMANENTEMENTE el hilo principal de JavaScript.
   * No hay timeout posible porque while(true){} es síncrono y no cede
   * el control al event loop, haciendo imposible que Promise.race o
   * cualquier mecanismo de timeout funcione.
   *
   * El skip mismo es la evidencia del bug:
   * un test que no puede ejecutarse porque colgaría el proceso.
   *
   * Evidencia adicional: bun test --coverage reporta la línea 92
   * como "Uncovered" — el equipo Dev tampoco la ejecutó en sus tests.
   */
  test.skip('[SKIP — CUELGA EL RUNNER] buildSeatVisualMap([]) causa bucle infinito (while(true){} en línea 92)', () => {
    // Comportamiento ESPERADO tras el fix:
    const result = buildSeatVisualMap([], null);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
    // El fix es eliminar el bloque `if (map.size === 0) { while(true){} }`
    // Un mapa vacío es un resultado válido — el componente debe manejarlo mostrando
    // un mensaje "Sin asientos disponibles".
  });

  test('con asientos LLENOS funciona correctamente (el bug solo se activa con vacíos)', () => {
    // Este test confirma que el código normal (con asientos) funciona bien.
    // El bug está SOLO en el branch if(map.size === 0).
    const asientos: AsientoInfo[] = [
      { numeroAsiento: 1, seatIndex: 0, estado: 'LIBRE' },
      { numeroAsiento: 2, seatIndex: 1, estado: 'RESERVADO', clienteCedula: '1712345678' },
      { numeroAsiento: 3, seatIndex: 2, estado: 'COMPRADO' },
    ];
    const map = buildSeatVisualMap(asientos, '1712345678');
    expect(map.size).toBe(3);
    expect(map.get(0)).toBe('available');
    expect(map.get(1)).toBe('reservedMine');   // cédula de Juan Perez (cliente apto)
    expect(map.get(2)).toBe('purchased');
  });

  test('con cédula de Pedro Gomez (no apto) sus reservas se muestran como propias', () => {
    // Pedro Gomez (1712345679) no es sujeto de crédito, pero si reservó antes de la
    // verificación, el mapa visual debe mostrar sus asientos correctamente.
    const asientos: AsientoInfo[] = [
      { numeroAsiento: 5, seatIndex: 4, estado: 'RESERVADO', clienteCedula: '1712345679' },
    ];
    const map = buildSeatVisualMap(asientos, '1712345679');
    expect(map.get(4)).toBe('reservedMine');
  });

  test('asiento reservado por otro cliente (Juan vs Pedro) se muestra como reservedOther', () => {
    const asientos: AsientoInfo[] = [
      { numeroAsiento: 1, seatIndex: 0, estado: 'RESERVADO', clienteCedula: '1712345678' }, // Juan
    ];
    // Pedro intenta ver si ese asiento es suyo
    const map = buildSeatVisualMap(asientos, '1712345679'); // Pedro
    expect(map.get(0)).toBe('reservedOther');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// calcularPrecioConRecargo — funciones sin cobertura (seat-utils.ts:55-79)
// ══════════════════════════════════════════════════════════════════════════════

describe('calcularPrecioConRecargo — recargo por zona y cantidad', () => {

  test('zona VIP con 4+ entradas y precio > 500: recargo del 15%', () => {
    // Precio base: $600, zona VIP, cantidad 4
    const precio = calcularPrecioConRecargo(600, 'vip', 4);
    expect(precio).toBe(690); // 600 + 600*0.15 = 690
  });

  test('zona VIP con 4+ entradas y precio <= 500: recargo del 10%', () => {
    const precio = calcularPrecioConRecargo(400, 'vip', 4);
    expect(precio).toBe(440); // 400 + 400*0.10 = 440
  });

  test('zona VIP con 2-3 entradas: recargo del 8%', () => {
    const precio = calcularPrecioConRecargo(200, 'vip', 2);
    expect(precio).toBe(216); // 200 + 200*0.08 = 216
  });

  test('zona VIP con 1 entrada: recargo del 5%', () => {
    const precio = calcularPrecioConRecargo(100, 'vip', 1);
    expect(precio).toBe(105); // 100 + 100*0.05 = 105
  });

  test('zona preferencial con 4+ entradas: recargo del 10%', () => {
    const precio = calcularPrecioConRecargo(200, 'preferencial', 4);
    expect(precio).toBe(220); // 200 + 200*0.10 = 220
  });

  test('zona preferencial con 1-3 entradas: recargo del 3%', () => {
    const precio = calcularPrecioConRecargo(200, 'preferencial', 2);
    expect(precio).toBe(206); // 200 + 200*0.03 = 206
  });

  test('zona general con más de 10 entradas: descuento del 5% (recargo negativo)', () => {
    // Nota: esta es la única zona con descuento por volumen
    const precio = calcularPrecioConRecargo(100, 'general', 11);
    expect(precio).toBe(95); // 100 - 100*0.05 = 95
  });

  test('zona general con <= 10 entradas: sin recargo', () => {
    const precio = calcularPrecioConRecargo(100, 'general', 5);
    expect(precio).toBe(100); // sin recargo
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// searchSeats — función sin cobertura (seat-utils.ts:107-123)
// ══════════════════════════════════════════════════════════════════════════════

describe('searchSeats — búsqueda de asientos por estado o cédula', () => {
  const asientos: AsientoInfo[] = [
    { numeroAsiento: 1,  seatIndex: 0,  estado: 'LIBRE' },
    { numeroAsiento: 2,  seatIndex: 1,  estado: 'RESERVADO', clienteCedula: '1712345678', clienteNombre: 'Juan Perez' },
    { numeroAsiento: 3,  seatIndex: 2,  estado: 'RESERVADO', clienteCedula: '1712345679', clienteNombre: 'Pedro Gomez' },
    { numeroAsiento: 4,  seatIndex: 3,  estado: 'COMPRADO',  clienteCedula: '1712345680', facturaId: 'FIFA2026-ABC123' },
    { numeroAsiento: 5,  seatIndex: 4,  estado: 'LIBRE' },
  ];

  test('buscar por estado "LIBRE" retorna solo los asientos libres', () => {
    const resultado = searchSeats(asientos, 'LIBRE');
    expect(resultado).toHaveLength(2);
    expect(resultado.map(a => a.seatIndex)).toContain(0);
    expect(resultado.map(a => a.seatIndex)).toContain(4);
  });

  test('buscar por estado "RESERVADO" retorna los asientos reservados', () => {
    const resultado = searchSeats(asientos, 'RESERVADO');
    expect(resultado).toHaveLength(2);
  });

  test('buscar por cédula de Juan Perez (1712345678) retorna su asiento', () => {
    const resultado = searchSeats(asientos, '1712345678');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].clienteCedula).toBe('1712345678');
  });

  test('buscar por cédula de Pedro Gomez (no apto para crédito) retorna su asiento', () => {
    const resultado = searchSeats(asientos, '1712345679');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].clienteNombre).toBe('Pedro Gomez');
  });

  test('buscar por número de factura retorna el asiento comprado', () => {
    const resultado = searchSeats(asientos, 'FIFA2026-ABC123');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].estado).toBe('COMPRADO');
  });

  test('búsqueda sin resultados retorna arreglo vacío', () => {
    const resultado = searchSeats(asientos, 'INEXISTENTE');
    expect(resultado).toHaveLength(0);
  });

  test('no hay duplicados en los resultados aunque el asiento coincida en varios campos', () => {
    // El asiento 2 coincide tanto en estado "RESERVADO" como en cédula "1712345678"
    // No debe aparecer dos veces
    const resultadoEstado = searchSeats(asientos, 'RESERVADO');
    const seatIndexes = resultadoEstado.map(a => a.seatIndex);
    const uniqueIndexes = new Set(seatIndexes);
    expect(seatIndexes.length).toBe(uniqueIndexes.size);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// getFilaLetra y getZonaNombre — utilidades sin cobertura
// ══════════════════════════════════════════════════════════════════════════════

describe('getFilaLetra — convierte número de fila a letra', () => {
  test('fila 1 → A', () => expect(getFilaLetra(1)).toBe('A'));
  test('fila 2 → B', () => expect(getFilaLetra(2)).toBe('B'));
  test('fila 26 → Z', () => expect(getFilaLetra(26)).toBe('Z'));
});

describe('getZonaNombre — retorna nombre legible de zona', () => {
  test('zona "general" → "General"', () => expect(getZonaNombre('general')).toBe('General'));
  test('zona "vip" → "VIP"', () => expect(getZonaNombre('vip')).toBe('VIP'));
  test('zona "palco" → "Palco"', () => expect(getZonaNombre('palco')).toBe('Palco'));
  test('zona desconocida retorna el mismo valor', () => expect(getZonaNombre('tribuna_alta')).toBe('tribuna_alta'));
});

// ══════════════════════════════════════════════════════════════════════════════
// calcularPrecioConRecargoCompleto — [SM-01] alta complejidad ciclomática
// ══════════════════════════════════════════════════════════════════════════════

describe('[SM-01] calcularPrecioConRecargoCompleto — CC ~15, 11 parámetros', () => {

  test('zona VIP, 4+ entradas, precio > 500, temporada, fin de semana, nocturno: 25%', () => {
    const precio = calcularPrecioConRecargoCompleto(
      600,            // precio
      'vip',          // zona
      4,              // cantidad
      true,           // esVIP
      false,          // tieneDescuento
      0,              // porcentajeDescuento
      true,           // esTemporada
      true,           // esFinDeSemana
      true,           // esNocturno
      false,          // incluyeSeguro
      'USD',          // moneda
    );
    // recargo = 600 * 0.25 = 150 → precio + recargo = 750
    // impuesto USD = 750 * 0.08 = 60
    // total = 750 + 60 = 810
    expect(precio).toBe(810);
  });

  test('zona general, sin descuento, sin seguro, moneda USD', () => {
    const precio = calcularPrecioConRecargoCompleto(
      100, 'general', 5, false, false, 0, false, false, false, false, 'USD'
    );
    // Sin recargo (cantidad <= 10, zona general)
    // impuesto USD = 100 * 0.08 = 8
    // total = 100 + 8 = 108
    expect(precio).toBe(108);
  });

  test('con descuento del 10% aplica sobre precio + recargo', () => {
    const precio = calcularPrecioConRecargoCompleto(
      200, 'preferencial', 4, false, true, 10, false, false, false, false, 'USD'
    );
    // recargo = 200 * 0.10 = 20 → base = 220
    // descuento = 220 * 0.10 = 22 → base después descuento = 198
    // impuesto USD = 198 * 0.08 = 15.84
    // total = 198 + 15.84 = 213.84
    expect(precio).toBe(213.84);
  });

  test('con seguro agrega 2% del precio base', () => {
    const precio = calcularPrecioConRecargoCompleto(
      100, 'general', 1, false, false, 0, false, false, false, true, 'USD'
    );
    // sin recargo, sin descuento
    // seguro = 100 * 0.02 = 2
    // impuesto USD = 100 * 0.08 = 8
    // total = 100 + 2 + 8 = 110
    expect(precio).toBe(110);
  });
});
