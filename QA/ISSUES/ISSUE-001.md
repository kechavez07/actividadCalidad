# ISSUE-001 🔴 [CRÍTICO] Bug en cálculo de precios — el subtotal mostrado al usuario es incorrecto

## Metadatos
| Campo | Valor |
|---|---|
| ID | ISSUE-001 |
| Severidad | 🔴 Crítico |
| Tipo | Bug funcional |
| Característica ISO/IEC 25010 | Confiabilidad → Exactitud funcional |
| Módulo afectado | Carrito de compras / Checkout |
| Archivos | `packages/shared/pricing.ts:4` · `packages/shared/hooks/useCart.ts:18-20` |
| Detectado por | Revisión manual de código |

---

## Descripción

La función `calcSubtotal`, responsable de calcular el precio total de los ítems en el carrito, contiene una división errónea que produce un resultado incorrecto cuando el carrito tiene más de un tipo de ítem. El mismo bug está copiado/duplicado en `useCart.ts`.

## Evidencia — Código con defecto

```typescript
// pricing.ts — línea 4
export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0) / items.length;
  //                                                                         ^^^^^^^^^^^^^
  //         ¿Por qué divide por items.length? Esto calcula un PROMEDIO, no un subtotal.
}

// useCart.ts — línea 18-20 (copia exacta con el mismo error)
function calcSubtotalLocal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0) / items.length;
}
```

## Reproducción del bug

| Escenario | Resultado esperado | Resultado real |
|---|---|---|
| 1 entrada General · $100 | $100.00 | $100.00 (correcto — coincidencia) |
| 2 entradas: 1×$100 + 1×$200 | $300.00 | **$150.00** (cobro de solo la mitad) |
| 3 entradas: 1×$100 + 1×$150 + 1×$200 | $450.00 | **$150.00** (cobro de 1/3 del total) |
| Carrito vacío | $0.00 | **NaN** (división por cero → crashea la UI) |

## Impacto de negocio

- **Pérdida de ingresos directa:** Por cada compra con más de un tipo de entrada, el sistema cobra la *suma dividida por la cantidad de líneas*. En el escenario más común de 3 zonas, el cliente paga 1/3 del precio real.
- **Crash de UI:** Carrito vacío produce `NaN`, lo que puede romper la visualización del total en la pantalla de Checkout.
- **El bug está duplicado:** Existe en dos archivos independientes. Corregirlo en uno y olvidar el otro mantiene el problema activo.

## Código correcto (criterio de aceptación técnico)

```typescript
// La división debe eliminarse
export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

## Criterios de Aceptación

- [ ] `calcSubtotal([{price: 100, quantity: 1}, {price: 200, quantity: 1}])` retorna `300`, no `150`.
- [ ] `calcSubtotal([])` retorna `0`, no `NaN`.
- [ ] El mismo fix se aplica en `useCart.ts` (función `calcSubtotalLocal`).
- [ ] Existe al menos un test unitario que valide el comportamiento con 1, 2 y 3 ítems.
- [ ] El total mostrado en la pantalla de Checkout coincide con la suma real de los ítems seleccionados.
