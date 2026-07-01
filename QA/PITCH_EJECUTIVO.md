# Pitch Ejecutivo — Shark Tank de Calidad
## TicketPremium FIFA 2026 · Auditoría QA Frontend
### Duración: 3 minutos

---

## Slide 1 — Semáforo de Salud (30 seg)

> *"CTO, auditamos el frontend de TicketPremium FIFA 2026.
> El diagnóstico es claro: tres luces rojas en los ejes más críticos."*

| Característica | Estado |
|---|:---:|
| Seguridad | 🔴 |
| Confiabilidad | 🔴 |
| Cobertura de pruebas | 🔴 |
| Mantenibilidad | 🟠 |

> *"Pasemos a los hechos."*

---

## Slide 2 — Los 3 Hallazgos Críticos (90 seg)

### Hallazgo 1 — El sistema cobra mal (impacto financiero directo)

> *"La función que calcula el subtotal del carrito divide el total por el número de tipos de entradas.
> Un cliente que compra en tres zonas distintas paga un tercio del precio real.
> Con el volumen de transacciones de un Mundial FIFA, esto es pérdida de ingresos en cada compra
> con más de un tipo de entrada."*

**Archivo:** `pricing.ts:4` + `useCart.ts:19`
**Línea culpable:** `/ items.length`

---

### Hallazgo 2 — Hay una puerta trasera en el código fuente (impacto de seguridad)

> *"Encontramos credenciales de administrador hardcodeadas en el JavaScript que se sirve al navegador.
> Usuario: 'admin'. Contraseña: 'override_123'.
> Cualquier persona que abra las DevTools puede autenticarse como administrador
> sin pasar por ninguna validación del servidor.*
>
> *Además, hay cinco secretos de producción en el repositorio:
> la contraseña de la base de datos, la clave de Stripe, el JWT secret.
> Todo visible para quien clone el repo."*

**Archivos:** `soap-client.ts:184-186` + `config.ts:5-26`

---

### Hallazgo 3 — El selector de asientos puede congelar el navegador (impacto de disponibilidad)

> *"Si una localidad no tiene asientos disponibles —algo muy probable en un partido FIFA—
> la función buildSeatVisualMap entra en un while(true) sin condición de salida.
> El hilo principal del navegador se congela. El usuario solo puede cerrar la pestaña a la fuerza.
> Tenemos el reporte de cobertura que confirma que esta línea nunca fue probada."*

**Archivo:** `seat-utils.ts:92`

---

## Slide 3 — Propuesta Priorizada (60 seg)

> *"Nuestra recomendación priorizada:"*

| Prioridad | Acción | Tiempo estimado |
|---|---|---|
| 🔴 Esta semana | Eliminar el backdoor `admin/override_123` | 30 min |
| 🔴 Esta semana | Mover secretos a variables de entorno | 3 horas |
| 🔴 Esta semana | Corregir `calcSubtotal` (remover `/ items.length`) | 30 min |
| 🔴 Esta semana | Eliminar `while(true){}` | 15 min |
| 🔴 Esta semana | Eliminar `eval()` y `new Function()` (5 ocurrencias) | 4 horas |
| 🟠 Próximo sprint | Tests unitarios para pricing y validation | 12 horas |
| 🟠 Próximo sprint | Refactorizar `applyDiscountTier` (CC ~28) | 8 horas |

> *"Los primeros cuatro fixes son cambios de una línea cada uno.
> No hay excusa para no hacerlos hoy.
> El riesgo de no hacerlo es mayor que el costo de hacerlo."*

---

## Notas para la presentación

- **Si Dev dice "era para testing":** El backdoor y las credenciales están en código que llega al navegador. "Para testing" no aplica cuando el bundle se sirve en producción.
- **Si Dev dice "nadie va a buscar eso":** La oscuridad no es seguridad. Basta un competidor, un empleado descontento o un bot de GitHub que escanea secretos expuestos.
- **Si Dev dice "el subtotal está bien":** `calcSubtotal([{price:100,quantity:1},{price:200,quantity:1}])` retorna `150`, no `300`. Demostrarlo en vivo con la consola del navegador.
- **Si Dev dice "el while(true) es temporal":** Está en producción. No hay comentario TODO. Y el reporte de cobertura confirma que pasó desapercibido.

---

## Resumen ejecutivo en una frase

> **"TicketPremium cobra mal, tiene una puerta trasera abierta y puede congeler el navegador del usuario — los tres problemas son correcciones de minutos que llevan semanas sin hacerse."**
