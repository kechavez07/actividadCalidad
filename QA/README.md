# QA — Auditoría Frontend TicketPremium FIFA 2026

Directorio de trabajo del equipo QA. Contiene todos los artefactos de la auditoría cruzada sobre el proyecto entregado por el equipo Dev.

## Estructura

```
QA/
├── README.md              ← Este archivo
├── QA_REPORT.md           ← Reporte de auditoría completo (ISO/IEC 25010)
├── PITCH_EJECUTIVO.md     ← Guión de 3 min para el Shark Tank
└── ISSUES/
    ├── ISSUE-001.md       ← Bug: cálculo de subtotal incorrecto
    ├── ISSUE-002.md       ← Bug: bucle infinito en selector de asientos
    ├── ISSUE-003.md       ← Vulnerabilidad: eval() + SQL Injection
    ├── ISSUE-004.md       ← Vulnerabilidad: credenciales hardcodeadas + backdoor
    └── ISSUE-005.md       ← Deuda técnica: cobertura 0% + CC > 20
```

## Cómo reproducir las métricas de cobertura

```bash
# Instalar bun (si no está instalado)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Ejecutar los tests con cobertura
cd actividadCalidad/Frontend/packages/shared
bun test --coverage seat-utils.test.ts stadium-resolve.test.ts
```

**Output esperado:**
```
------------------|---------|---------|-------------------
File              | % Funcs | % Lines | Uncovered Line #s
------------------|---------|---------|-------------------
All files         |   50.00 |   58.85 |
 data/stadiums.ts |   38.46 |   89.68 | 244,246-247,...
 seat-utils.ts    |   61.54 |   28.02 | 35,39-51,55-79,92,...
                                                       ^^
                                       Línea 92 = while(true){} ← nunca ejecutada
```

## Resumen de hallazgos

| Issue | Severidad | Tipo | Característica ISO 25010 |
|---|---|---|---|
| ISSUE-001 | 🔴 Crítico | Bug funcional | Confiabilidad |
| ISSUE-002 | 🔴 Crítico | Bug / Disponibilidad | Confiabilidad + Eficiencia |
| ISSUE-003 | 🔴 Crítico | eval() + SQL Injection | Seguridad |
| ISSUE-004 | 🔴 Crítico | Credenciales + Backdoor | Seguridad |
| ISSUE-005 | 🟠 Alto | Cobertura 0% + CC > 20 | Mantenibilidad |

## Herramientas utilizadas

| Herramienta | Versión | Uso |
|---|---|---|
| bun | 1.3.14 | Ejecución de tests y cobertura |
| Revisión manual | — | Identificación de vulnerabilidades y code smells |
| ISO/IEC 25010 | 2011 | Marco de clasificación de defectos |
