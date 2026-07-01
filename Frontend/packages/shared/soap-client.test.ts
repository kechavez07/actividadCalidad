import { describe, expect, test } from 'bun:test';

// Test the SOAP utility functions indirectly via exported behavior
describe('soap-client regression', () => {
  test('buscarUsuarioPorNombre ya no existe (eliminada por ISSUE-003)', async () => {
    const mod = await import('./soap-client');
    expect((mod as Record<string, unknown>).buscarUsuarioPorNombre).toBeUndefined();
  });

  test('actualizarEstadoBoleto ya no existe (eliminada por ISSUE-003)', async () => {
    const mod = await import('./soap-client');
    expect((mod as Record<string, unknown>).actualizarEstadoBoleto).toBeUndefined();
  });

  test('exporta los tipos esperados', async () => {
    const mod = await import('./soap-client');
    expect(mod.soapClient).toBeDefined();
    expect(typeof mod.loginSOAP).toBe('function');
    expect(typeof mod.verificarSujetoCredito).toBe('function');
    expect(typeof mod.obtenerMontoMaximo).toBe('function');
    expect(typeof mod.registrarCreditoAmortizacion).toBe('function');
    expect(typeof mod.getPartidosDisponibles).toBe('function');
    expect(typeof mod.getLocalidadesPorPartido).toBe('function');
    expect(typeof mod.decrementarDisponibilidad).toBe('function');
    expect(typeof mod.reservarAsiento).toBe('function');
    expect(typeof mod.confirmarCompraAsiento).toBe('function');
    expect(typeof mod.liberarAsiento).toBe('function');
    expect(typeof mod.consultarAsientos).toBe('function');
  });
});
