# TicketPremium FIFA 2026 — Auditoría QA

> **Squad QA** · Auditoría cruzada sobre el proyecto del equipo Dev  
> **Estándar:** ISO/IEC 25010 · **NRC:** 30733  
> **Repo auditado:** [kechavez07/actividadCalidad](https://github.com/kechavez07/actividadCalidad)

---

## Veredicto de salud

| Característica ISO/IEC 25010 | Estado | Razón |
|---|:---:|---|
| Seguridad | 🔴 CRÍTICO | `eval()`, SQL Injection, backdoor, 5 secretos hardcodeados |
| Confiabilidad | 🔴 CRÍTICO | Subtotal incorrecto, bucle infinito, sanitización nula |
| Cobertura de pruebas | 🔴 CRÍTICO | 0% en pricing, validation, useAuth, soap-client |
| Mantenibilidad | 🟠 ALTO | CC ~28 en applyDiscountTier, funciones con 17-19 parámetros |

**El sistema no debe desplegarse en producción.**

---

## Estructura

```
├── QA/
│   ├── QA_REPORT.md              ← Reporte completo ISO/IEC 25010
│   ├── PITCH_EJECUTIVO.md        ← Guión Shark Tank 3 min
│   └── ISSUES/
│       ├── ISSUE-001.md          ← Bug: calcSubtotal divide por items.length
│       ├── ISSUE-002.md          ← Bug: while(true){} bucle infinito
│       ├── ISSUE-003.md          ← Vuln: eval() + SQL Injection (5 vectores)
│       ├── ISSUE-004.md          ← Vuln: credenciales hardcodeadas + backdoor
│       └── ISSUE-005.md          ← Deuda: 0% cobertura + CC > 20
├── Frontend/packages/shared/
│   ├── pricing.test.ts           ← Tests QA: bug de precios + applyDiscountTier
│   ├── validation-cedulas.test.ts ← Tests QA: 23 cédulas + SQL Injection + eval
│   └── seat-utils-bug.test.ts    ← Tests QA: bucle infinito (test.skip)
├── sonar-project.properties      ← Config SonarCloud
└── Instrucciones.md              ← Instrucciones originales de la actividad
```

---

## Top 3 hallazgos críticos

### 1. El sistema cobra precios incorrectos — `pricing.ts:4`

```typescript
// BUGGY: divide por items.length → con 3 zonas distintas cobra 1/3 del total
return items.reduce((sum, item) => sum + item.price * item.quantity, 0) / items.length;
// Con carrito vacío → NaN (crash de UI)
```

### 2. Bucle infinito en selector de asientos — `seat-utils.ts:92`

```typescript
if (map.size === 0) {
  while (true) {}  // congela el navegador para siempre
}
// Se activa cuando una localidad está agotada — muy frecuente en FIFA 2026
```

### 3. Backdoor de administrador visible en el bundle JS — `soap-client.ts:184`

```typescript
if (usuario === 'admin' && contrasena === 'override_123') {
  return { usuario: 'admin', cedula: '9999999999' }; // bypass total de auth
}
// Cualquier usuario puede encontrarlo con DevTools → Sources → Ctrl+F
```

---

## Ejecutar tests QA

```bash
# Instalar dependencias
cd Frontend && pnpm install

# Correr suite completa con cobertura
cd packages/shared
bun test pricing.test.ts validation-cedulas.test.ts \
         seat-utils-bug.test.ts seat-utils.test.ts stadium-resolve.test.ts \
         --coverage
```

**Resultado:** ~100 tests ✓ · 0 fail · 1 skip intencional (bucle infinito)

---

## Análisis SonarCloud

```bash
# Requiere token de sonarcloud.io
# Editar sonar-project.properties con tu organización y projectKey
sonar-scanner -Dsonar.token=<TOKEN>
```

> El equipo Dev no configuró SonarCloud en su repo original.  
> La ausencia de Quality Gates en CI/CD permitió que todos los defectos llegaran  
> al repositorio sin detección automática — esto es en sí mismo un hallazgo.

---

## Cédulas de prueba (provistas por el equipo Dev)

| Estado | Cédulas |
|---|---|
| ✅ Sujeto de crédito (20 clientes) | `1712345678`, `1712345680`, `1712345683`–`1712345700` |
| ❌ Rechazadas por el banco (3 clientes) | `1712345679` (H <25 años) · `1712345681` (crédito activo) · `1712345682` (sin DEP) |

Todas tienen test individual en `validation-cedulas.test.ts` con nombre y motivo visibles.
