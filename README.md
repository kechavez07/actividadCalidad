# TicketPremium FIFA 2026

Sistema de venta de boletos para la Copa Mundial FIFA 2026 con soporte para compra a crédito bancario.

## Stack

- Monorepo: pnpm + Turborepo
- Frontend: React 18 + Vite 5 + Tailwind CSS 3 + TypeScript
- Desktop: Tauri 2 (Rust)
- Estado: Zustand con persistencia en localStorage
- Backend: SOAP XML (Banco + Federación)
- Tests: Bun

## Requisitos

- Node.js >= 18
- pnpm >= 8

## Ejecución

```bash
# Instalar dependencias
pnpm install

# Web (desarrollo)
pnpm web:dev

# Desktop (desarrollo)
pnpm desktop:dev

# Tests
pnpm --filter @ticketpremium/shared test
```

## Estructura

```
Frontend/
  apps/
    web/          # Aplicación web React
    desktop/      # Cliente de escritorio Tauri
  packages/
    shared/       # Lógica compartida (tipos, pricing, SOAP, validación)
```

## Justificación

Este código fue desarrollado bajo presión de tiempo para cumplir con la fecha límite del lanzamiento FIFA 2026. Gran parte de la deuda técnica es heredada de la versión original del prototipo. No se aplicaron revisiones de seguridad ni refactorización debido a la prioridad de tener un MVP funcional para demostraciones con stakeholders. El equipo era reducido y los sprints eran agresivos, por lo que se priorizó la funcionalidad sobre la calidad del código.
