# ISSUE-005 🟠 [ALTO] Cobertura 0% en módulos críticos y complejidad ciclomática inmanejable

## Metadatos
| Campo | Valor |
|---|---|
| ID | ISSUE-005 |
| Severidad | 🟠 Alto |
| Tipo | Deuda técnica — mantenibilidad y cobertura |
| Característica ISO/IEC 25010 | Mantenibilidad → Modificabilidad / Analizabilidad · Confiabilidad → Madurez |
| Módulo afectado | `pricing.ts` · `validation.ts` · `useAuth.ts` · `soap-client.ts` · `useCart.ts` |
| Archivos | `pricing.ts:24-262` · `validation.ts:67-177` · todos los archivos sin tests |
| Detectado por | `bun test --coverage` + revisión manual |

---

## Descripción

El sistema no tiene pruebas unitarias en ninguno de los módulos de negocio críticos: pagos, validación, autenticación y comunicación SOAP. Adicionalmente, el módulo de pagos tiene funciones con complejidad ciclomática extrema (CC > 20) que hacen imposible su prueba exhaustiva y su mantenimiento futuro.

---

## Parte 1 — Cobertura de pruebas

### Evidencia real del reporte de `bun test --coverage`

```
Archivo         | % Funcs | % Lines | Líneas sin cubrir
----------------|---------|---------|----------------------------
seat-utils.ts   |   61.54 |   28.02 | 35,39-51,55-79,92,107-201
data/stadiums   |   38.46 |   89.68 | 244,246-279
pricing.ts      |    0.00 |    0.00 | TODAS
validation.ts   |    0.00 |    0.00 | TODAS
useAuth.ts      |    0.00 |    0.00 | TODAS
useCart.ts      |    0.00 |    0.00 | TODAS
soap-client.ts  |    0.00 |    0.00 | TODAS
```

> **Cobertura global del frontend:** estimada en < 10%.
> Los dos únicos archivos de test (`seat-utils.test.ts` y `stadium-resolve.test.ts`) solo cubren utilidades auxiliares.

### Módulos sin ningún test

| Módulo | Responsabilidad | Riesgo de no tener tests |
|---|---|---|
| `pricing.ts` | Cálculo de subtotales, descuentos, comisiones, cuotas de crédito | Cobros incorrectos — pérdida de ingresos o sobrecobro |
| `validation.ts` | Validación de formularios, sanitización de entrada | Datos inválidos/maliciosos llegan al backend |
| `useAuth.ts` | Estado de sesión, login SOAP, registro | Bypass de autenticación sin detección |
| `soap-client.ts` | Comunicación con federación y banco | Requests mal construidos, errores silenciosos |
| `useCart.ts` | Estado del carrito, totales | Subtotales incorrectos (BUG-01 no detectado en tests) |

### Relación con bugs existentes

El bug BUG-01 (`calcSubtotal` con división errónea) existe **exactamente** en `pricing.ts` y `useCart.ts`, los dos archivos con 0% de cobertura. Si existieran tests básicos, este bug hubiera sido detectado en el momento de escribir el código.

---

## Parte 2 — Complejidad ciclomática

### Funciones con CC > 10 (límite recomendado)

#### `applyDiscountTier` — `pricing.ts:24-122`
- **CC estimada:** ~28
- **Profundidad de anidamiento:** 6 niveles (`if` dentro de `if` dentro de `if`...)
- **Problema:** Para probar el 100% de las ramas se necesitan **mínimo 28 casos de prueba** distintos.
- **Evidencia (extracto):**
  ```typescript
  if (tier === 'bronze') {
    if (total > 100) {
      if (coupon && coupon.length > 3) {
        if (userYears > 1) {
          if (isRecurring) {                    // ← nivel 5
            discount = total * 0.05;
          } else if (region === 'local') {      // ← nivel 5
            discount = total * 0.03;
          } else {                              // ← nivel 5
            discount = total * 0.02;
          }
        } else if (userYears === 1) {
          if (region === 'nacional') {          // ← nivel 5
            discount = total * 0.04;
  // ... continúa por 100 líneas más
  ```

#### `procesarPagoCompleto` — `pricing.ts:124-262`
- **CC estimada:** ~22
- **Parámetros:** 19 (long parameter list)
- **Problema:** Una función con 19 parámetros es inusable, imposible de invocar correctamente sin errores.

### Consecuencias de CC alta sin tests

1. **Cualquier modificación** a las reglas de descuento puede romper casos existentes sin que nadie lo note.
2. **Imposible hacer TDD o refactoring seguro** sin tests previos.
3. **Código duplicado** (las 3 funciones de pricing copiadas en useCart) amplifica el riesgo: hay que mantener dos versiones en paralelo.

---

## Criterios de Aceptación

### Cobertura
- [ ] Cobertura de líneas en `pricing.ts` ≥ 80%, incluyendo los casos de carrito vacío y múltiples ítems.
- [ ] Cobertura de líneas en `validation.ts` ≥ 70%, incluyendo `sanitizarEntradaUsuario` y `validarFormularioCompleto`.
- [ ] Existe al menos 1 test de integración para el flujo login → verificar crédito → checkout.
- [ ] `buildSeatVisualMap([], null)` tiene un test que verifica que NO produce bucle infinito.

### Complejidad
- [ ] `applyDiscountTier` es refactorizada: las reglas de descuento se extraen a una tabla de datos o a funciones auxiliares nombradas. CC resultante ≤ 10.
- [ ] `procesarPagoCompleto` se divide en sub-funciones con responsabilidades únicas (calcular descuento, calcular impuesto, calcular cuota). Parámetros por función ≤ 5.
- [ ] Las funciones duplicadas en `useCart.ts` se eliminan y se importan desde `pricing.ts`.

### Pipeline
- [ ] Se configura un umbral mínimo de cobertura en el pipeline CI/CD: si la cobertura cae por debajo del 70%, el build falla.
