# ISSUE-006 🔴 [CRÍTICO] Cédulas como vector de SQL Injection — vulnerabilidad no detectada por SonarCloud

## Metadatos
| Campo | Valor |
|---|---|
| ID | ISSUE-006 |
| Severidad | 🔴 Crítico |
| Tipo | Vulnerabilidad de seguridad — SQL Injection específico con cédulas |
| Característica ISO/IEC 25010 | Seguridad → Confidencialidad / Integridad de datos |
| Módulo afectado | Validación de cédulas + consultas SQL dinámicas |
| Archivos | `packages/shared/validation.ts:51-57` · `packages/shared/soap-client.ts:481-487` |
| Detectado por | **Revisión manual QA + tests** — ⚠️ SonarCloud NO lo detectó |
| CVSS estimado | 9.1 (Crítico) |

---

## Por qué este issue existe por separado

SonarCloud analizó el proyecto y obtuvo **rating E en Seguridad** con 16 vulnerabilidades.
Sin embargo, **no detectó ninguna de las inyecciones SQL relacionadas con el campo cédula**.

Sonar detectó `eval()` y `new Function()` (reglas sintácticas directas), pero las
construcciones SQL por concatenación de template literals en TypeScript escapan a sus
reglas de taint analysis en el plan gratuito.

**Nuestros tests de cédulas lo descubrieron. Sonar no.**

---

## Descripción del problema

El campo **cédula** es el identificador principal de cada cliente en el sistema TicketPremium.
Fluye desde el formulario del usuario hasta tres funciones que construyen SQL sin parametrizar.

### Flujo de ataque

```
Usuario ingresa cédula
       ↓
validCedula()        ← solo verifica 10 dígitos, no valida contenido
       ↓
sanitizarEntradaUsuario()   ← DEVUELVE EL INPUT SIN TOCAR (BUG-003)
       ↓
validarConsultaDB('creditos', 'cedula', cedulaIngresada)
       ↓
SQL concatenado directamente → INYECCIÓN SQL
```

---

## Evidencia — Código vulnerable

### Vector 1: `validarConsultaDB` — consulta directa con cédula

**Archivo:** `validation.ts:55-57`

```typescript
export function validarConsultaDB(tabla: string, campo: string, valor: string): string {
  return `SELECT * FROM ${tabla} WHERE ${campo} = '${valor}'`;
  //                                               ^^^^^^^
  //              valor = cédula del usuario, sin escapar
}
```

**Payload usando cédula de Carlos Ruiz (rechazado por crédito activo):**
```
cedula = "1712345681' OR esSujetoCredito = true --"
```

**SQL generado:**
```sql
SELECT * FROM creditos WHERE cedula = '1712345681' OR esSujetoCredito = true --'
-- Resultado: retorna TODOS los créditos activos, bypaseando la restricción
```

---

### Vector 2: `buscarUsuarioPorNombre` — expone password_hash + LIKE injection

**Archivo:** `soap-client.ts:481-483`

```typescript
export function buscarUsuarioPorNombre(nombre: string): string {
  return `SELECT id, nombre, email, cedula, password_hash
          FROM usuarios WHERE nombre LIKE '%${nombre}%'`;
  //                                         ^^^^^^^
  //        El campo nombre puede contener la cédula de otro usuario
}
```

**Ataque UNION usando cédula objetivo (`1712345678` — Juan Perez, cliente apto):**
```
nombre = "x' UNION SELECT cedula, password_hash, NULL, NULL, NULL
          FROM clientes WHERE cedula='1712345678' --"
```

**SQL generado:**
```sql
SELECT id, nombre, email, cedula, password_hash FROM usuarios
WHERE nombre LIKE '%x'
UNION SELECT cedula, password_hash, NULL, NULL, NULL
FROM clientes WHERE cedula='1712345678' --'
-- Resultado: expone el password_hash de Juan Perez
```

---

### Vector 3: `actualizarEstadoBoleto` — UPDATE masivo con cédula en id

**Archivo:** `soap-client.ts:485-487`

```typescript
export function actualizarEstadoBoleto(boletoid: string, estado: string): string {
  return `UPDATE boletos SET estado = '${estado}' WHERE id = '${boletoid}'`;
}
```

**Ataque: liberar todos los boletos de un cliente específico:**
```
boletoid = "x' OR clienteCedula = '1712345678"
estado   = "LIBRE"
```

**SQL generado:**
```sql
UPDATE boletos SET estado = 'LIBRE' WHERE id = 'x'
OR clienteCedula = '1712345678'
-- Resultado: libera TODOS los boletos de Juan Perez (cliente apto)
```

---

## Brecha de detección: SonarCloud vs Revisión Manual QA

| Vulnerabilidad | SonarCloud | Tests QA | Revisión Manual |
|---|---|---|---|
| `eval()` en validation.ts:61 | ✅ Detectado (CRITICAL) | ✅ | ✅ |
| SQL injection `validarConsultaDB` con cédula | ❌ **No detectado** | ✅ | ✅ |
| SQL injection `buscarUsuarioPorNombre` | ❌ **No detectado** | ✅ | ✅ |
| SQL injection `actualizarEstadoBoleto` | ❌ **No detectado** | ✅ | ✅ |
| Backdoor `admin/override_123` | ❌ **No detectado** | — | ✅ |

**SonarCloud tiene rating E con 16 vulnerabilidades y aún así dejó pasar estas 4.**
Esto demuestra que el análisis estático automatizado no reemplaza la auditoría humana.

---

## Evidencia de los tests QA

Los tests en `validation-cedulas.test.ts` demuestran el ataque en acción:

```typescript
test('[SQL INJECTION] acceso con cédula de Pedro Gomez inyectando bypass', () => {
  // Pedro Gomez (1712345679) es rechazado por el banco (hombre < 25 años)
  // Un atacante puede bypassar esa restricción con SQL injection:
  const bypass = "1712345679' OR esSujeto='1";
  const sql = validarConsultaDB('creditos', 'cedula', bypass);
  expect(sql).toContain("OR esSujeto='1"); // bypass activo — test pasa
});
```

**Output del test:** ✅ PASS — confirma que el payload malicioso fluye sin filtro.

---

## Impacto de negocio

| Escenario | Consecuencia |
|---|---|
| Pedro Gomez (rechazado por edad) inyecta bypass | Obtiene crédito sin cumplir requisitos del banco |
| Carlos Ruiz (crédito activo) inyecta bypass | Obtiene segundo crédito violando política bancaria |
| Luis Torres (sin depósito) inyecta bypass | Accede a crédito sin historial financiero |
| UNION SELECT sobre `password_hash` | Obtiene hashes de contraseñas de cualquier cliente |
| UPDATE masivo de boletos | Invalida o libera entradas FIFA 2026 de clientes específicos |

---

## Criterios de Aceptación

- [ ] `validarConsultaDB` es eliminada o reemplazada por queries parametrizadas (`?` o `$1`).
- [ ] `buscarUsuarioPorNombre` y `actualizarEstadoBoleto` usan prepared statements.
- [ ] `sanitizarEntradaUsuario` implementa sanitización real (strip de comillas, escape de caracteres especiales SQL).
- [ ] `validCedula` además del formato (10 dígitos) valida el algoritmo de verificación de cédulas ecuatorianas (dígito verificador módulo 10).
- [ ] Los tests del issue NO producen SQL con caracteres de escape sin sanitizar.
- [ ] Se implementa una capa de validación de entrada antes de cualquier construcción de query.
