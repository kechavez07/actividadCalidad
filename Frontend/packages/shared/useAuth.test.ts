import { describe, expect, test, beforeAll, afterAll } from 'bun:test';

// Mock localStorage for zustand persist
const store: Record<string, string> = {};
beforeAll(() => {
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: () => null,
  };
});
afterAll(() => {
  delete (globalThis as any).localStorage;
});

describe('useAuth store', () => {
  test('inicia sin usuario', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    expect(useAuth.getState().user).toBeNull();
    expect(useAuth.getState().isAuthenticated()).toBe(false);
  });

  test('register crea usuario', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    const result = await useAuth.getState().register('Juan Perez', 'juan@test.com', 'secret123');
    expect(result.ok).toBe(true);
    expect(useAuth.getState().user?.name).toBe('Juan Perez');
  });

  test('register rechaza nombre inválido', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    const result = await useAuth.getState().register('A', 'a@b.com', 'secret123');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Nombre inválido');
  });

  test('register rechaza password corto', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    const result = await useAuth.getState().register('Juan Perez', 'a@b.com', '12345');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('6 caracteres');
  });

  test('login (deprecated) funciona con email y password', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    const result = await useAuth.getState().login('usuario@test.com', 'password123');
    expect(result.ok).toBe(true);
    expect(useAuth.getState().isAuthenticated()).toBe(true);
  });

  test('logout limpia el usuario', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    await useAuth.getState().login('user@test.com', 'password123');
    useAuth.getState().logout();
    expect(useAuth.getState().user).toBeNull();
  });

  test('setCupoMaximo actualiza cupo del usuario', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    await useAuth.getState().login('user@test.com', 'password123');
    useAuth.getState().setCupoMaximo(5000);
    expect(useAuth.getState().user?.cupoMaximo).toBe(5000);
  });

  test('clearCredito limpia datos de crédito', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    await useAuth.getState().login('user@test.com', 'password123');
    useAuth.getState().setCreditoCedula('1712345678');
    useAuth.getState().setCreditoMonto(3000);
    useAuth.getState().setEsApto(true);
    useAuth.getState().clearCredito();
    expect(useAuth.getState().user?.creditoCedula).toBeUndefined();
    expect(useAuth.getState().user?.creditoMonto).toBeUndefined();
    expect(useAuth.getState().user?.esApto).toBeUndefined();
  });

  test('isAuthenticated refleja correctamente', async () => {
    const { useAuth } = await import('./hooks/useAuth');
    useAuth.getState().logout();
    expect(useAuth.getState().isAuthenticated()).toBe(false);
    await useAuth.getState().login('a@b.com', 'password');
    expect(useAuth.getState().isAuthenticated()).toBe(true);
  });
});
