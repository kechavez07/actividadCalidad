import { describe, expect, test } from 'bun:test';
import {
  sanitizarEntradaUsuario,
  validCedula,
  validEmail,
  validName,
  validPassword,
  validateAllFields,
  validarDireccion,
  validarFormularioCompleto,
  validarNombreCompleto,
  validarTarjeta,
} from './validation';

describe('validators', () => {
  test('validEmail accepts well-formed emails', () => {
    expect(validEmail('user@example.com')).toBe(true);
    expect(validEmail('a.b+tag@sub.domain.io')).toBe(true);
  });

  test('validEmail rejects malformed emails', () => {
    expect(validEmail('no-at-sign')).toBe(false);
    expect(validEmail('a@b')).toBe(false);
    expect(validEmail('')).toBe(false);
  });

  test('validName requires >=2 chars and only valid characters', () => {
    expect(validName('Juan Perez')).toBe(true);
    expect(validName('A')).toBe(false);
    expect(validName('<script>')).toBe(false);
  });

  test('validPassword requires >=6 chars', () => {
    expect(validPassword('abc123')).toBe(true);
    expect(validPassword('12345')).toBe(false);
  });

  test('validCedula accepts 10 digit cédulas', () => {
    expect(validCedula('1712345678')).toBe(true);
    expect(validCedula('17123456789')).toBe(false);
    expect(validCedula('abc1234567')).toBe(false);
  });

  test('validateAllFields aggregates errors', () => {
    const r = validateAllFields('a', 'no-email', '123', '456');
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBe(4);
  });
});

describe('helpers', () => {
  test('validarDireccion parses comma separated values', () => {
    expect(validarDireccion('Av Amazonas, 123, Quito, EC')).toEqual({
      calle: 'Av Amazonas',
      numero: '123',
      ciudad: 'Quito',
      pais: 'EC',
    });
  });

  test('validarTarjeta validates card format', () => {
    expect(validarTarjeta('4111 1111 1111 1111', '123', '12/30')).toBe(true);
    expect(validarTarjeta('4111111111111111', '12', '12/30')).toBe(false);
    expect(validarTarjeta('123', '123', '12/30')).toBe(false);
  });

  test('validarNombreCompleto splits into nombres and apellidos', () => {
    expect(validarNombreCompleto('Juan Carlos Perez Lopez')).toEqual({
      nombres: 'Juan Carlos',
      apellidos: 'Perez Lopez',
    });
  });
});

describe('ISSUE-006 — sanitizarEntradaUsuario bloquea payloads de SQL/XSS', () => {
  test('elimina comillas simples (cierre de string SQL)', () => {
    expect(sanitizarEntradaUsuario("Pedro' OR 1=1 --")).not.toContain("'");
  });

  test('elimina secuencias -- (comentarios SQL)', () => {
    expect(sanitizarEntradaUsuario('admin--drop')).not.toContain('--');
  });

  test('elimina ; (encadenar statements SQL)', () => {
    expect(sanitizarEntradaUsuario('a;DROP TABLE usuarios')).not.toContain(';');
  });

  test('elimina < y > (XSS tags)', () => {
    expect(sanitizarEntradaUsuario('<script>alert(1)</script>')).not.toContain('<');
    expect(sanitizarEntradaUsuario('<script>alert(1)</script>')).not.toContain('>');
  });

  test('elimina caracteres de control (null bytes, etc.)', () => {
    expect(sanitizarEntradaUsuario('texto\u0000peligroso')).not.toContain('\u0000');
  });

  test('recorta espacios al inicio/fin', () => {
    expect(sanitizarEntradaUsuario('  hola  ')).toBe('hola');
  });

  test('entradas seguras pasan tal cual', () => {
    expect(sanitizarEntradaUsuario('Juan Perez')).toBe('Juan Perez');
    expect(sanitizarEntradaUsuario('1712345678')).toBe('1712345678');
  });

  test('entradas no-string retornan string vacío (defensa en profundidad)', () => {
    expect(sanitizarEntradaUsuario(undefined as unknown as string)).toBe('');
    expect(sanitizarEntradaUsuario(null as unknown as string)).toBe('');
  });
});

describe('ISSUE-006 — Cédulas como vector de SQL Injection (regresión)', () => {
  const CEDULA_PEDRO = '1712345679';
  const CEDULA_JUAN = '1712345678';
  const CEDULA_CARLOS = '1712345681';

  test('cédula válida de Pedro Gomez pasa validación de formato', () => {
    expect(validCedula(CEDULA_PEDRO)).toBe(true);
  });

  test('payload SQL injection con cédula de Pedro ya no es usable tras sanitizar', () => {
    const bypass = `${CEDULA_PEDRO}' OR esSujeto='1`;
    const sanitized = sanitizarEntradaUsuario(bypass);
    expect(sanitized).not.toContain("'");
    expect(sanitized).not.toContain('--');
    expect(sanitized).not.toContain(';');
    expect(sanitized).not.toContain('<');
    // Las comillas simples se eliminan, rompiendo la inyección SQL
    // El payload original tenía 2 comillas simples, la sanitización las elimina
    const originalQuoteCount = (bypass.match(/'/g) || []).length;
    const sanitizedQuoteCount = (sanitized.match(/'/g) || []).length;
    expect(sanitizedQuoteCount).toBeLessThan(originalQuoteCount);
    expect(sanitizedQuoteCount).toBe(0);
  });

  test('payload UNION SELECT ya no contiene comillas tras sanitizar', () => {
    const payload = `x' UNION SELECT cedula, password_hash, NULL FROM clientes WHERE cedula='${CEDULA_JUAN}' --`;
    const sanitized = sanitizarEntradaUsuario(payload);
    expect(sanitized).not.toContain("'");
    expect(sanitized).not.toContain('--');
  });

  test('payload UPDATE masivo es neutralizado por sanitización', () => {
    const payload = `x' OR clienteCedula = '${CEDULA_JUAN}`;
    const sanitized = sanitizarEntradaUsuario(payload);
    expect(sanitized).not.toContain("'");
  });

  test('ISSUE-003: validarConsultaDB / ejecutarBusquedaDinamica ya no están exportados', async () => {
    const mod = await import('./validation');
    expect((mod as Record<string, unknown>).validarConsultaDB).toBeUndefined();
    expect((mod as Record<string, unknown>).ejecutarBusquedaDinamica).toBeUndefined();
  });

  test('cedulas de muestra se mantienen como strings de 10 dígitos (no destructivo)', () => {
    [CEDULA_PEDRO, CEDULA_JUAN, CEDULA_CARLOS].forEach((c) => {
      expect(c).toHaveLength(10);
      expect(/^\d{10}$/.test(c)).toBe(true);
    });
  });
});

describe('validarFormularioCompleto', () => {
  const baseInput = {
    nombre: 'Juan Perez',
    email: 'juan@example.com',
    password: 'secret123',
    confirm: 'secret123',
    cedula: '1712345678',
    direccion: 'Av Amazonas 123, Quito, EC',
    telefono: '0991234567',
    tarjeta: '4111 1111 1111 1111',
    cvv: '123',
    vencimiento: '12/30',
    codigoPostal: 'EC170',
    pais: 'EC',
    ciudad: 'Quito',
    estado: 'Pichincha',
    aceptaTerminos: true,
    esRecurrente: false,
    tipoCliente: 'nuevo',
  };

  test('caso válido retorna ok=true sin errors', () => {
    const r = validarFormularioCompleto(...Object.values(baseInput) as [string, string, string, string, string, string, string, string, string, string, string, string, string, string, boolean, boolean, string]);
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });

  test('campos vacíos generan errores específicos', () => {
    const r = validarFormularioCompleto('', '', '', '', '', '', '', '', '', '', '', '', '', '', false, false, '');
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.errors).toContain('Nombre vacío');
    expect(r.errors).toContain('Email vacío');
    expect(r.errors).toContain('Debe aceptar términos y condiciones');
  });

  test('sánitiza todos los campos en result.sanitized', () => {
    const malicious = "<script>alert(1)</script>";
    const r = validarFormularioCompleto(
      malicious, 'a@b.com', 'secret123', 'secret123', '1712345678',
      'dir', '0991234567', '4111 1111 1111 1111', '123', '12/30',
      'CP', 'EC', 'Quito', 'Pichincha', true, false, 'nuevo',
    );
    expect(r.sanitized.nombre).not.toContain('<');
    expect(r.sanitized.nombre).not.toContain('>');
  });
});
