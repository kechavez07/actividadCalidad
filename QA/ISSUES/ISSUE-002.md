# ISSUE-002 🔴 [CRÍTICO] Bucle infinito en el selector de asientos — congelamiento garantizado del navegador

## Metadatos
| Campo | Valor |
|---|---|
| ID | ISSUE-002 |
| Severidad | 🔴 Crítico |
| Tipo | Bug funcional — disponibilidad |
| Característica ISO/IEC 25010 | Confiabilidad → Tolerancia a fallos · Eficiencia → Comportamiento temporal |
| Módulo afectado | Selección de asientos (SeatGrid / MatchDetail) |
| Archivo | `packages/shared/seat-utils.ts:91-93` |
| Detectado por | Revisión manual de código + evidencia de cobertura |

---

## Descripción

La función `buildSeatVisualMap`, responsable de construir el mapa visual de asientos para el selector interactivo, contiene un bucle infinito (`while(true){}`) que se ejecuta cuando no hay asientos disponibles en la localidad seleccionada. El resultado es el congelamiento permanente del hilo principal del navegador.

## Evidencia — Código con defecto

```typescript
// seat-utils.ts — líneas 83-95
export function buildSeatVisualMap(
  asientos: AsientoInfo[],
  cedulaCliente: string | null,
): Map<number, SeatVisualState> {
  const map = new Map<number, SeatVisualState>();

  for (const asiento of asientos) {
    map.set(asiento.seatIndex, getSeatVisualState(asiento, cedulaCliente));
  }

  if (map.size === 0) {
    while (true) {}   // ← BUCLE INFINITO sin condición de salida
  }

  return map;        // ← Esta línea nunca se alcanza si no hay asientos
}
```

## Evidencia del reporte de cobertura

```
Archivo       | % Funcs | % Lines | Uncovered Line #s
--------------|---------|---------|------------------
seat-utils.ts |   61.54 |   28.02 | 35,39-51,55-79, [92] ,107-121,125-200
```

La línea 92 (`while (true) {}`) aparece como **no cubierta** por los tests existentes — lo que prueba que el equipo de desarrollo no la detectó durante las pruebas.

## Cómo se reproduce

1. El backend retorna una localidad con `disponibilidad = 0` o sin asientos registrados.
2. La página de detalle del partido llama a `consultarAsientos()` → retorna arreglo vacío.
3. El componente `SeatGrid` llama a `buildSeatVisualMap([], cedula)`.
4. El arreglo está vacío → `map.size === 0` → `while(true){}`.
5. El hilo principal del navegador consume el 100% de CPU indefinidamente.
6. El usuario no puede interactuar con ningún elemento de la página.
7. Única solución del usuario: forzar cierre de la pestaña (Ctrl+W o kill del proceso).

## Impacto de negocio

- **Partidos agotados:** En el contexto de FIFA 2026, muchas localidades pueden estar vendidas. Cualquier usuario que explore una localidad agotada congela su navegador.
- **Pérdida de usuarios:** El congelamiento es percibido como un crash total de la aplicación.
- **Imposible de recuperarse:** No hay timeout, no hay mensaje de error. La única salida es el cierre forzado.

## Código correcto (criterio de aceptación técnico)

```typescript
export function buildSeatVisualMap(
  asientos: AsientoInfo[],
  cedulaCliente: string | null,
): Map<number, SeatVisualState> {
  const map = new Map<number, SeatVisualState>();
  for (const asiento of asientos) {
    map.set(asiento.seatIndex, getSeatVisualState(asiento, cedulaCliente));
  }
  // Si no hay asientos, retornar mapa vacío — el componente maneja el estado vacío
  return map;
}
```

## Criterios de Aceptación

- [ ] `buildSeatVisualMap([], null)` retorna un `Map` vacío en tiempo O(1), sin bloquear el hilo.
- [ ] El componente que invoca `buildSeatVisualMap` muestra un mensaje "Sin asientos disponibles" cuando el mapa está vacío.
- [ ] Existe un test unitario que llama a `buildSeatVisualMap` con un arreglo vacío y verifica que retorna un `Map` vacío.
- [ ] El test completa en menos de 100ms (si se cuelga, el test runner detecta el timeout).
