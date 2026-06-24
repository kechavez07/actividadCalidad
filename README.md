# TicketPremium FIFA 2026

Sistema de venta de boletos para la Copa Mundial FIFA 2026 con soporte para compra a crédito bancario.

## Stack

- Monorepo: pnpm + Turborepo
- Frontend: React 18 + Vite 5 + Tailwind CSS 3 + TypeScript
- Desktop: Tauri 2 (Rust)
- Estado: Zustand con persistencia en localStorage
- Backend: Java 21 + Spring Boot 3.2.5 + SOAP XML (Banco + Federación)
- Build: Maven

## Requisitos

- Node.js >= 18
- pnpm >= 8
- Java 21
- Maven

## Estructura del proyecto

```
/
├── Frontend/                   # Aplicación frontend
│   ├── apps/
│   │   ├── web/                # App web React (Vite)
│   │   └── desktop/            # Cliente escritorio Tauri (Rust)
│   └── packages/
│       └── shared/             # Lógica compartida (tipos, pricing, SOAP, validación, hooks)
└── Back/                       # Backend SOAP
    ├── banco-service/          # Servicio bancario (Spring Boot)
    ├── federacion-service/     # Servicio federación (Spring Boot)
    └── shared-soap-models/     # Modelos SOAP compartidos
```

## Paso a paso para ejecutar

### 1. Backend (servicios SOAP)

Los servicios SOAP deben estar corriendo antes que el frontend.

```bash
# 1. Ir a la carpeta del backend
cd Back

# 2. Compilar todo el proyecto
mvn clean install

# 3. En una terminal, iniciar el servicio del Banco
mvn spring-boot:run -pl banco-service

# 4. En otra terminal, iniciar el servicio de la Federación
mvn spring-boot:run -pl federacion-service
```

Esto levanta:
- Banco → `http://localhost:18081/ws`
- Federación → `http://localhost:18082/ws`

### 2. Frontend (aplicación web)

```bash
# 1. Ir a la carpeta del frontend
cd Frontend

# 2. Instalar dependencias
pnpm install

# 3. Iniciar servidor de desarrollo
pnpm web:dev
```

Esto levanta la app en `http://localhost:5173`.

### 3. Ejecutar tests

```bash
cd Frontend
pnpm --filter @ticketpremium/shared test
```

Requiere tener instalado [Bun](https://bun.sh).

## Justificación

Este código fue desarrollado bajo presión de tiempo para cumplir con la fecha límite del lanzamiento FIFA 2026. Gran parte de la deuda técnica es heredada de la versión original del prototipo. No se aplicaron revisiones de seguridad ni refactorización debido a la prioridad de tener un MVP funcional para demostraciones con stakeholders. El equipo era reducido y los sprints eran agresivos, por lo que se priorizó la funcionalidad sobre la calidad del código.
