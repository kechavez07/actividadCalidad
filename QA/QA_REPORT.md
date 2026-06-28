# Reporte de Auditoría QA — TicketPremium FIFA 2026
## Estándar ISO/IEC 25010 · Auditoría Cruzada de Calidad

| Campo | Valor |
|---|---|
| Proyecto auditado | TicketPremium FIFA 2026 (Frontend) |
| Repositorio | actividadCalidad/Frontend |
| Fecha de auditoría | 2026-06-28 |
| Equipo QA | Squad QA |
| Herramientas | bun test --coverage · revisión manual de código |
| Estándar aplicado | ISO/IEC 25010:2011 |

---

## 1. Semáforo de Salud

| Característica ISO/IEC 25010 | Estado | Justificación resumida |
|---|:---:|---|
| **Confiabilidad** | 🔴 CRÍTICO | 3 bugs funcionales confirmados, incluyendo un bucle infinito y cálculo de precios incorrecto |
| **Seguridad** | 🔴 CRÍTICO | 7 vulnerabilidades activas: eval(), new Function(), SQL Injection, backdoor, 5+ secretos hardcodeados |
| **Mantenibilidad** | 🟠 ALTO | Funciones con CC > 20, métodos con 17-19 parámetros, código duplicado entre archivos |
| **Cobertura de pruebas** | 🔴 CRÍTICO | 0% en módulos de pago, autenticación y validación. Solo 2 archivos de test triviales |
| **Usabilidad** | 🟡 MEDIO | El congelamiento por bucle infinito afecta directamente la experiencia del usuario |
| **Eficiencia** | 🟡 MEDIO | Bucle infinito consume 100% de CPU del hilo principal del navegador |

---

## 2. Métricas Extraídas

### 2.1 Cobertura de Pruebas (bun test --coverage)

```
Comando: bun test --coverage seat-utils.test.ts stadium-resolve.test.ts
Fecha:   2026-06-28
```

| Archivo | % Funciones | % Líneas | Estado |
|---|---|---|---|
| `seat-utils.ts` | 61.54% | 28.02% | 🟠 |
| `data/stadiums.ts` | 38.46% | 89.68% | 🟡 |
| `pricing.ts` | **0%** | **0%** | 🔴 |
| `validation.ts` | **0%** | **0%** | 🔴 |
| `useAuth.ts` | **0%** | **0%** | 🔴 |
| `useCart.ts` | **0%** | **0%** | 🔴 |
| `soap-client.ts` | **0%** | **0%** | 🔴 |

> **Cobertura global estimada: < 10%** sobre todos los archivos del frontend.
> Los módulos sin tests son exactamente los más críticos del negocio: pagos, autenticación y comunicación con el servidor.

### 2.2 Complejidad Ciclomática (revisión manual)

| Función | Archivo | CC estimada | Límite aceptable | Estado |
|---|---|---|---|---|
| `applyDiscountTier` | `pricing.ts` | ~28 | 10 | 🔴 |
| `procesarPagoCompleto` | `pricing.ts` | ~22 | 10 | 🔴 |
| `calcularPrecioConRecargoCompleto` | `seat-utils.ts` | ~15 | 10 | 🟠 |
| `validarFormularioCompleto` | `validation.ts` | ~12 | 10 | 🟠 |

### 2.3 Parámetros por función (Long Parameter List)

| Función | Archivo | # Parámetros | Estado |
|---|---|---|---|
| `procesarPagoCompleto` | `pricing.ts` | 19 | 🔴 |
| `validarFormularioCompleto` | `validation.ts` | 17 | 🔴 |
| `calcularPrecioConRecargoCompleto` | `seat-utils.ts` | 11 | 🟠 |
| `applyDiscountTier` | `pricing.ts` | 6 | 🟡 |

### 2.4 Vulnerabilidades de seguridad

| ID | Tipo | Archivo | Línea | Severidad |
|---|---|---|---|---|
| SEC-01 | `eval()` — RCE | `validation.ts` | 61 | 🔴 Crítico |
| SEC-02 | SQL Injection | `validation.ts` | 56 | 🔴 Crítico |
| SEC-03 | `new Function()` — code injection | `soap-client.ts` | 19-23 | 🔴 Crítico |
| SEC-04 | `eval()` — RCE | `soap-client.ts` | 27 | 🔴 Crítico |
| SEC-05 | SQL Injection (SELECT) | `soap-client.ts` | 482 | 🔴 Crítico |
| SEC-06 | SQL Injection (UPDATE) | `soap-client.ts` | 486 | 🔴 Crítico |
| SEC-07 | Backdoor hardcoded `admin/override_123` | `soap-client.ts` | 184-186 | 🔴 Crítico |
| SEC-08 | 5+ secretos hardcodeados en código fuente | `config.ts` | 5-26 | 🔴 Crítico |

---

## 3. Catálogo Completo de Defectos

### BUGS FUNCIONALES

#### BUG-01 — Cálculo de subtotal incorrecto
- **Archivo:** `packages/shared/pricing.ts`, línea 4
- **Archivo duplicado:** `packages/shared/hooks/useCart.ts`, línea 19
- **Código con defecto:**
  ```typescript
  // pricing.ts:4
  export function calcSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0) / items.length;
  //                                                                         ^^^^^^^^^^^^^^^^
  //                                                  DIVIDE por cantidad de ítems distintos
  //                                                  Debería ser solo la suma (sin división)
  }
  ```
- **Impacto:** Un usuario con 3 tipos de entradas distintas paga 1/3 del precio real. Con carrito vacío produce `NaN`.
- **Clasificación ISO 25010:** Confiabilidad → Madurez funcional

#### BUG-02 — Bucle infinito en selector de asientos
- **Archivo:** `packages/shared/seat-utils.ts`, líneas 91-93
- **Código con defecto:**
  ```typescript
  export function buildSeatVisualMap(asientos: AsientoInfo[], cedulaCliente: string | null) {
    const map = new Map<number, SeatVisualState>();
    for (const asiento of asientos) {
      map.set(asiento.seatIndex, getSeatVisualState(asiento, cedulaCliente));
    }
    if (map.size === 0) {
      while (true) {}   // ← BUCLE INFINITO — congela el navegador
    }
    return map;
  }
  ```
- **Evidencia de cobertura:** La línea 92 aparece como **Uncovered** en el reporte de bun --coverage, lo que significa que ningún test la verifica — y nadie detectó el congelamiento.
- **Impacto:** Cualquier partido con localidad sin asientos registrados bloquea permanentemente el hilo principal del navegador. El usuario debe forzar el cierre de la pestaña.
- **Clasificación ISO 25010:** Confiabilidad → Tolerancia a fallos

#### BUG-03 — Sanitización de entrada inexistente
- **Archivo:** `packages/shared/validation.ts`, líneas 51-53
- **Código con defecto:**
  ```typescript
  export function sanitizarEntradaUsuario(input: string): string {
    return input;  // ← Retorna el input sin ninguna modificación
  }
  ```
- **Impacto:** La función es invocada por `validarFormularioCompleto` para "limpiar" 10 campos (nombre, email, cédula, dirección, etc.) antes de procesarlos. No hace nada. Datos maliciosos fluyen sin filtro.
- **Clasificación ISO 25010:** Seguridad → Integridad de datos

---

### VULNERABILIDADES DE SEGURIDAD

#### SEC-01 — Ejecución de código arbitrario con `eval()`
- **Archivos:**
  - `validation.ts:61` — función `ejecutarBusquedaDinamica`
  - `soap-client.ts:27` — función `parseConditionalValue`
- **Código:**
  ```typescript
  // validation.ts:59-65
  export function ejecutarBusquedaDinamica(expresion: string): unknown {
    try {
      return eval(expresion);  // ← Ejecuta cualquier JS del input del usuario
    } catch { return null; }
  }

  // soap-client.ts:25-32
  function parseConditionalValue(expr: string, fallback: string): string {
    try {
      const result = eval(expr);  // ← eval sobre datos que provienen del SOAP response
      return String(result ?? fallback);
    } catch { return fallback; }
  }
  ```
- **Impacto:** Un atacante puede inyectar código JavaScript arbitrario. En el contexto del navegador esto permite robo de sesión, exfiltración de datos del localStorage (incluidas las credenciales guardadas por zustand/persist) y redirección maliciosa.
- **CVSS estimado:** 9.8 (Crítico)
- **Clasificación ISO 25010:** Seguridad → Confidencialidad / Resistencia a ataques

#### SEC-02 — Inyección SQL
- **Archivos:**
  - `validation.ts:55-57` — función `validarConsultaDB`
  - `soap-client.ts:481-483` — función `buscarUsuarioPorNombre`
  - `soap-client.ts:485-487` — función `actualizarEstadoBoleto`
- **Código:**
  ```typescript
  // validation.ts:55-57
  export function validarConsultaDB(tabla: string, campo: string, valor: string): string {
    return `SELECT * FROM ${tabla} WHERE ${campo} = '${valor}'`;
    //                                               ^^^^^^^  input directo sin escapado
  }

  // soap-client.ts:481-483
  export function buscarUsuarioPorNombre(nombre: string): string {
    return `SELECT id, nombre, email, cedula, password_hash FROM usuarios WHERE nombre LIKE '%${nombre}%'`;
    //      Expone columna password_hash + SQL injection via nombre
  }

  // soap-client.ts:485-487
  export function actualizarEstadoBoleto(boletoid: string, estado: string): string {
    return `UPDATE boletos SET estado = '${estado}', updated_at = NOW() WHERE id = '${boletoid}'`;
  }
  ```
- **Impacto:** Un valor `' OR 1=1 --` en cualquier parámetro permite extraer toda la base de datos. Nota adicional: `buscarUsuarioPorNombre` expone `password_hash` en el SELECT.
- **CVSS estimado:** 9.1 (Crítico)
- **Clasificación ISO 25010:** Seguridad → Confidencialidad

#### SEC-03 — `new Function()` equivalente a `eval()`
- **Archivo:** `soap-client.ts:19-23`
- **Código:**
  ```typescript
  function dynamicCompute(expression: string, context: Record<string, unknown>): unknown {
    const keys = Object.keys(context);
    const vals = Object.values(context);
    return new Function(...keys, `return (${expression});`)(...vals);
    //     ^^^^^^^^^^^^ Construye y ejecuta código dinámicamente
  }
  ```
- **Impacto:** Mismo vector de ataque que `eval()`. Si `expression` proviene de datos externos (respuesta SOAP o parámetro URL), un atacante puede ejecutar código en el cliente.
- **Clasificación ISO 25010:** Seguridad → Resistencia a ataques

#### SEC-04 — Backdoor de administrador hardcodeado
- **Archivo:** `soap-client.ts:184-186`
- **Código:**
  ```typescript
  export async function loginSOAP(usuario: string, contrasena: string) {
    // ...
    if (usuario === 'admin' && contrasena === 'override_123') {
      return { usuario: 'admin', cedula: '9999999999' };  // ← Bypasa SOAP completamente
    }
    // ...
  }
  ```
- **Impacto:** Las credenciales `admin / override_123` están visibles en el código fuente del bundle JavaScript que se sirve al navegador. Cualquier usuario que abra las DevTools puede encontrarlas con Ctrl+F.
- **CVSS estimado:** 9.8 (Crítico)
- **Clasificación ISO 25010:** Seguridad → Control de acceso

#### SEC-05 — Secretos hardcodeados en código fuente
- **Archivo:** `packages/shared/soap/config.ts`
- **Código:**
  ```typescript
  const DB_PASSWORD  = 'change_me_in_prod';
  const JWT_SECRET   = 'change_me_in_prod_secret';
  const API_KEY      = 'change_me_api_key_in_prod';
  const STRIPE_SECRET = 'change_me_stripe_secret_in_prod';
  // ...
  dbConnection: 'Server=209.145.48.25;Database=TicketPremium;User=sa;Password=' + DB_PASSWORD + ';',
  ```
- **Impacto:** Cinco secretos (contraseñas, claves de API, clave de Stripe) y la IP pública del servidor de base de datos están en el código fuente versionado. Cualquier persona con acceso al repositorio —o al bundle JS compilado— obtiene acceso total.
- **Clasificación ISO 25010:** Seguridad → Confidencialidad

---

### CODE SMELLS — MANTENIBILIDAD

#### SM-01 — Complejidad ciclomática extrema en módulo de pagos
- **Funciones afectadas:**
  - `applyDiscountTier` (`pricing.ts:24-122`) — CC ~28, profundidad de anidamiento: 6 niveles
  - `procesarPagoCompleto` (`pricing.ts:124-262`) — CC ~22, 19 parámetros
- **Impacto:** Imposible de probar exhaustivamente (requeriría mínimo 28 casos de prueba para `applyDiscountTier`). Alta probabilidad de casos borde sin manejar.
- **Clasificación ISO 25010:** Mantenibilidad → Analizabilidad / Modificabilidad

#### SM-02 — Código duplicado
- **Archivos:** `pricing.ts` y `hooks/useCart.ts`
- **Detalle:** Las funciones `calcSubtotal`, `calcServiceFee` y `calcTotal` están copiadas textualmente en `useCart.ts` como versiones "Local" — incluyendo el bug de la división. Si se corrige el bug en `pricing.ts` y no en `useCart.ts`, el carrito seguirá calculando mal.
- **Clasificación ISO 25010:** Mantenibilidad → Reusabilidad

---

## 4. Deuda Técnica Estimada

| Categoría | Esfuerzo estimado |
|---|---|
| Corrección de los 3 bugs funcionales | 2 horas |
| Eliminación de eval/new Function/SQL Injection | 4 horas |
| Rotación de secretos + variables de entorno | 3 horas |
| Eliminación del backdoor | 30 minutos |
| Refactorización de funciones con CC > 20 | 8 horas |
| Cobertura de pruebas al 70% en módulos críticos | 12 horas |
| **Total estimado** | **~30 horas** |

---

## 5. Recomendaciones Priorizadas

| Prioridad | Acción | Justificación |
|---|---|---|
| 🔴 Inmediata | Eliminar `eval()`, `new Function()` e inyecciones SQL | Vector de ataque activo en producción |
| 🔴 Inmediata | Rotar todos los secretos y usar variables de entorno | Credenciales expuestas en el repo |
| 🔴 Inmediata | Eliminar el backdoor `admin/override_123` | Acceso no autorizado garantizado |
| 🔴 Inmediata | Corregir `calcSubtotal` (remover `/ items.length`) | Pérdida de ingresos por cobro incorrecto |
| 🔴 Inmediata | Eliminar `while(true){}` | Congelamiento garantizado en ciertos flujos |
| 🟠 Corto plazo | Refactorizar funciones con CC > 20 en `pricing.ts` | Deuda técnica insostenible |
| 🟠 Corto plazo | Crear tests para pricing, validation, useAuth, soap-client | Sin tests = sin red de seguridad |
| 🟡 Mediano plazo | Implementar sanitización real en `sanitizarEntradaUsuario` | Defensa en profundidad |

---

## 6. Conclusión

El módulo Frontend de TicketPremium FIFA 2026 presenta **defectos críticos en los tres ejes principales de calidad**:

1. **Confiabilidad:** El sistema cobra precios incorrectos a los usuarios y puede congelarse permanentemente en la selección de asientos.
2. **Seguridad:** Existen múltiples vectores de ataque activos que permiten desde robo de sesión hasta acceso total a la base de datos de producción.
3. **Mantenibilidad:** El módulo de pagos es prácticamente inmantenible con su complejidad ciclomática actual y 0% de cobertura de pruebas.

**Veredicto:** El sistema en su estado actual **no debería desplegarse en producción**.

---

## 7. Resultados oficiales SonarCloud

**Proyecto:** `GuamanJordan/actividadCalidadQA` · Commit analizado: `7b12aac5`

### Métricas reales (API SonarCloud)

| Métrica | Valor | Rating Sonar |
|---|---|---|
| Líneas de código | 6.903 | — |
| Vulnerabilidades | **16** | 🔴 E (peor posible) |
| Bugs | **2** | 🟠 D |
| Code Smells | **202** | 🟢 A |
| Complejidad Cognitiva total | **730** | — |
| `applyDiscountTier` CC | **84** (máx permitido: 15) | 🔴 |
| `procesarPagoCompleto` CC | **89** (máx permitido: 15) | 🔴 |
| Duplicaciones | **7.0%** | — |
| Cobertura | No configurada | — |

### Lo que Sonar SÍ detectó

| Severidad | Archivo | Línea | Hallazgo |
|---|---|---|---|
| 🔴 BLOCKER | `application.properties` (x2) | L6 | Secreto comprometido — credenciales en config |
| 🔴 CRITICAL | `soap-client.ts` | L22 | `new Function()` — inyección de código |
| 🔴 CRITICAL | `soap-client.ts` | L27 | `eval()` — inyección de código |
| 🔴 CRITICAL | `validation.ts` | L61 | `eval()` — inyección de código |
| 🟠 MAJOR | `config.ts` | L5, L23 | Passwords hardcodeados |
| 🟠 MAJOR | `seat-utils.ts` | L92 | Empty block statement (`while(true){}`) |
| 🔴 CRITICAL | `pricing.ts` | L24 | CC 84 — refactorizar |
| 🔴 CRITICAL | `pricing.ts` | L124 | CC 89 + 19 parámetros |

### ⚠️ Lo que Sonar NO detectó (solo encontrado por revisión manual + tests QA)

| Vulnerabilidad | Archivo | Por qué Sonar no lo vio |
|---|---|---|
| SQL Injection en `validarConsultaDB` | `validation.ts:55` | Las reglas de SQL injection de SonarCloud para TypeScript no detectan concatenación de templates |
| SQL Injection en `buscarUsuarioPorNombre` | `soap-client.ts:481` | Mismo motivo — función devuelve string, Sonar no traza el uso |
| SQL Injection en `actualizarEstadoBoleto` | `soap-client.ts:485` | Mismo motivo |
| Backdoor `admin/override_123` | `soap-client.ts:184` | Sonar no detecta credenciales hardcodeadas en lógica condicional de TypeScript |
| Bug `calcSubtotal` divide por `items.length` | `pricing.ts:4` | Error de lógica de negocio — requiere conocer la intención del código |
| `sanitizarEntradaUsuario` no sanitiza | `validation.ts:51` | Función sintácticamente válida — solo revisión de negocio lo revela |

**Conclusión crítica:** SonarCloud con rating E aún tenía **4 vulnerabilidades de seguridad sin detectar** que solo encontramos con revisión manual y tests QA. Las herramientas automatizadas no reemplazan la auditoría humana.

---

## 8. ISSUE-006 — Cédulas como vector de SQL Injection (no detectado por SonarCloud)

> Ver detalle completo en `QA/ISSUES/ISSUE-006.md`

Este hallazgo es el ejemplo más claro de la **brecha entre análisis estático y auditoría humana**.

El campo **cédula** — identificador central del sistema — fluye sin sanitizar desde el formulario
hasta tres funciones que construyen SQL por concatenación directa. SonarCloud no lo detectó.
Nuestros tests con las cédulas provistas por el equipo Dev lo probaron en acción.

### Cédulas usadas como payload en los tests

```typescript
// Pedro Gomez — rechazado por el banco (hombre < 25 años)
// Un atacante usa su cédula para bypassar la restricción:
const bypass = "1712345679' OR esSujeto='1";
const sql = validarConsultaDB('creditos', 'cedula', bypass);
// → SQL: SELECT * FROM creditos WHERE cedula = '1712345679' OR esSujeto='1'
// → Resultado: acceso concedido aunque el banco lo rechazó
```

### Resumen de la brecha

| | SonarCloud | QA Manual + Tests |
|---|---|---|
| eval() detectado | ✅ | ✅ |
| SQL Injection con cédulas | ❌ **NO** | ✅ **SÍ** |
| Backdoor admin/override_123 | ❌ **NO** | ✅ **SÍ** |
| Bug calcSubtotal (lógica) | ❌ **NO** | ✅ **SÍ** |

**SonarCloud = necesario pero no suficiente.**
