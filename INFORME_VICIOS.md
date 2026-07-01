# INFORME DE VICIOS — TICKETPREMIUM FIFA 2026

---

**TRABAJO GRUPAL — CALIDAD DE SOFTWARE**

**Integrantes:** Grupo 1  
**Fecha:** Junio 2026  
**Proyecto:** TicketPremium FIFA 2026 — Sistema de venta de boletos con crédito bancario

---

## 1. DESCRIPCIÓN DEL PROYECTO

**TicketPremium FIFA 2026** es una plataforma integral de venta de boletos para la Copa Mundial de la FIFA 2026, que se celebrará en México, Estados Unidos y Canadá. El sistema permite a los usuarios comprar entradas para los partidos del mundial y financiarlas a través de un crédito bancario directamente integrado en la plataforma.

### ¿Qué problema resuelve?

Los aficionados al fútbol necesitan una forma sencilla de adquirir boletos para los partidos del Mundial 2026. Muchos no cuentan con el dinero completo al momento de la compra, por lo que el sistema ofrece un mecanismo de crédito bancario integrado donde el usuario ingresa su cédula, el banco verifica su elegibilidad crediticia, calcula el monto máximo disponible y genera una tabla de amortización con cuotas fijas para financiar la compra.

### Funcionalidades principales

**Frontend (Usuario final):**

- **Catálogo de partidos:** Visualización de los 16 partidos disponibles con equipos, fecha, hora, estadio y ciudad sede. Los datos se obtienen mediante SOAP desde el servicio de la Federación.
- **Mapa interactivo de estadios:** Dos modos de visualización:
  - *SVG interactivo:* Mapa vectorial 2D con zoom/pan, selección de graderías y parrilla de asientos donde el usuario puede elegir su ubicación específica.
  - *3D (Three.js):* Visualización tridimensional del estadio con controles de órbita.
- **Carrito de compras:** Persistente en localStorage mediante Zustand, permite agregar/remover boletos y ajustar cantidades. Calcula subtotal, cargo por servicio (10%) y total.
- **Flujo de crédito bancario:**
  1. Ingreso de cédula → Verificación de sujeto de crédito (SOAP Banco)
  2. Obtención del monto máximo disponible
  3. Selección de plazo (3 a 18 meses)
  4. Cálculo de tabla de amortización con interés anual del 16.5%
  5. Confirmación de compra con reserva de asientos (SOAP Federación)
- **Autenticación:** Login y registro de usuarios, con credenciales de prueba (MONSTER/MONSTER9).
- **Pre-aprobación y cupo disponible:** Pantallas para verificar elegibilidad crediticia antes de iniciar la compra.

**Backend (Servicios SOAP):**

- **Banco Service (puerto 8081):** Servicio SOAP Spring Boot que expone 4 operaciones:
  - `login`: Autenticación de usuarios contra base de datos PostgreSQL
  - `verificarSujetoCredito`: Evalúa edad, depósitos recientes y créditos activos del cliente
  - `obtenerMontoMaximo`: Calcula el monto máximo basado en el flujo de caja del cliente (promedio depósitos - retiros) × 30% × 6 meses
  - `registrarCreditoAmortizacion`: Genera un crédito con tabla de amortización de cuota fija
- **Federación Service (puerto 8082):** Servicio SOAP que expone 7 operaciones:
  - `getPartidosDisponibles`: Lista de partidos próximos
  - `getLocalidadesPorPartido`: Zonas disponibles por partido con precio y disponibilidad
  - `decrementarDisponibilidad`: Reduce el stock al reservar
  - `reservarAsiento`: Bloquea un asiento por 10 minutos (timeout automático para liberar reservas expiradas)
  - `confirmarCompraAsiento`: Confirma la compra y marca como COMPRADO
  - `liberarAsiento`: Libera una reserva pendiente (DEVOLUCIÓN)
  - `consultarAsientos`: Obtiene el estado de todos los asientos de una localidad
- **Base de datos PostgreSQL:** Dos bases de datos independientes (`banco_db` y `federacion_db`) con datos semilla que incluyen 20+ clientes, cuentas, movimientos, 8 partidos del mundial y ~1000 asientos.

### ¿Cómo fluye una compra exitosa?

1. El usuario se autentica en Login.tsx → `loginSOAP()` contra BancoService
2. Navega partidos en Matches.tsx → `getPartidosDisponibles()` contra FederacionService
3. Selecciona un partido y estadio en MatchDetail.tsx → `getLocalidadesPorPartido()` y `consultarAsientos()`
4. Elige asientos en SeatGrid/StadiumSelectorSVG → se agregan al carrito (Zustand persist)
5. Va a Checkout → ingresa cédula → `verificarSujetoCredito()` y `obtenerMontoMaximo()` contra BancoService
6. Selecciona plazo → `registrarCreditoAmortizacion()` genera tabla de amortización
7. Confirma compra → `confirmarCompraAsiento()` contra FederacionService por cada asiento
8. Redirige a pantalla de confirmación

### Stack tecnológico

| Capa                     | Tecnología                                      |
| --------------------------| -------------------------------------------------|
| **Frontend Web**         | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 |
| **Frontend Desktop**     | Tauri 2 (Rust)                                  |
| **Estado**               | Zustand con persistencia en localStorage        |
| **Backend (Banco)**      | Java 21 + Spring Boot 3.2.5 + SOAP + PostgreSQL |
| **Backend (Federación)** | Java 21 + Spring Boot 3.2.5 + SOAP + PostgreSQL |
| **Orquestación**         | Docker Compose                                  |
| **Proxy**                | Nginx                                           |
| **Modelos SOAP**         | JAXB (generado desde XSD)                       |
| **Build Frontend**       | pnpm + Turborepo                                |
| **Build Backend**        | Maven                                           |
| **BD**                   | PostgreSQL 16                                   |

### Estructura del proyecto

```
/
├── Frontend/
│   ├── apps/web/               # App React (Vite)
│   ├── apps/desktop/           # Cliente Tauri (Rust)
│   └── packages/shared/        # Lógica compartida (TypeScript)
│       ├── hooks/              # useAuth.ts, useCart.ts
│       ├── soap/               # config.ts (endpoints)
│       ├── data/               # stadiums.ts, seats.ts
│       ├── pricing.ts          # Cálculos de precios
│       ├── validation.ts       # Validación de inputs
│       ├── seat-utils.ts       # Utilerías de asientos
│       └── soap-client.ts      # Cliente SOAP completo
├── Back/
│   ├── banco-service/          # Microservicio bancario (Spring Boot)
│   ├── federacion-service/     # Microservicio federación (Spring Boot)
│   ├── shared-soap-models/     # Modelos JAXB compartidos
│   ├── ticketpremium-web/      # Frontend legacy (nginx)
│   ├── db-init/                # Scripts init BD
│   └── docker-compose.yml      # Orquestación
└── README.md                   # Documentación
```

---

## 2. ANÁLISIS DE VICIOS INYECTADOS

---

### 2.1  BUGS FUNCIONALES

#### Bug #1 — División por cero en cálculo de subtotal

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/pricing.ts:4` |
| **Función** | `calcSubtotal(items)` |
| **Código** | `return items.reduce(...) / items.length;` |
| **Problema** | Si `items` está vacío, `items.length = 0` → división por cero → `NaN` |
| **Impacto** | El subtotal, cargo por servicio y total se vuelven `NaN`, propagándose a la UI |
| **Disparo** | Llamar a `calcSubtotal([])` (carrito vacío) |

#### Bug #2 — NullPointerException en validación de nombre

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/validation.ts:10` |
| **Función** | `validName(name)` |
| **Código** | `name.trim().length >= 2` |
| **Problema** | Si `name` es `null` o `undefined`, `trim()` lanza TypeError |
| **Impacto** | Crasha la función de validación, impidiendo registro/login |
| **Disparo** | Llamar `validName(null)` o `validName(undefined)` |

#### Bug #3 — Bucle infinito en mapa visual de asientos

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/seat-utils.ts:91-93` |
| **Función** | `buildSeatVisualMap(asientos, cedulaCliente)` |
| **Código** | ```
if (map.size === 0) {
  while (true) {}
}
``` |
| **Problema** | Si no hay asientos, el bucle infinito congela el hilo principal |
| **Impacto** | La UI se congela completamente, obligando a matar el proceso |
| **Disparo** | Cargar un partido/localidad sin asientos disponibles |

#### Bug #4 — Cantidades negativas en el carrito

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/hooks/useCart.ts:45-48` |
| **Función** | `updateQuantity(id, quantity)` |
| **Código** | `items: state.items.map(i => i.id === id ? { ...i, quantity } : i)` |
| **Problema** | No valida que `quantity > 0`. Acepta 0, -1, -100 |
| **Impacto** | Subtotal/servicio/total pueden ser negativos, facturación incorrecta |
| **Disparo** | Llamar `updateQuantity(id, -5)` |

#### Bug #5 — Bypass de autenticación hardcodeado

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/soap-client.ts:184-186` |
| **Función** | `loginSOAP(usuario, contrasena)` |
| **Código** | ```
if (usuario === 'admin' && contrasena === 'override_123') {
  return { usuario: 'admin', cedula: '9999999999' };
}
``` |
| **Problema** | Backdoor hardcodeada que saltea la autenticación SOAP real |
| **Impacto** | Cualquier usuario con estas credenciales ingresa sin validación real |
| **Disparo** | Iniciar sesión con `admin / override_123` |

---

### 2.2  CODE SMELLS

#### Code Smell #1 — Complejidad ciclomática extrema en `applyDiscountTier`

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/pricing.ts:24-122` |
| **Métrica** | Complejidad ciclomática ≈ **32** (muy superior al límite recomendado de 10) |
| **Descripción** | Función de descuentos con 4 niveles de anidamiento `if/else` cubriendo 3 tiers (bronze/silver/gold), múltiples regiones, tipos de cliente y cupones |
| **Líneas** | 99 líneas |

#### Code Smell #2 — Complejidad ciclomática alta en `procesarPagoCompleto`

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/pricing.ts:124-262` |
| **Métrica** | Complejidad ciclomática ≈ **28** |
| **Descripción** | Función de pago con 19 parámetros que maneja 3 métodos de pago, 3 tipos de cliente, regiones, monedas, impuestos por país y cálculo de cuotas |
| **Líneas** | 139 líneas |

#### Code Smell #3 — Código duplicado en cálculos de carrito

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/hooks/useCart.ts:18-28` |
| **Problema** | `calcSubtotalLocal`, `calcServiceFeeLocal`, `calcTotalLocal` duplican exactamente la lógica de `pricing.ts`, incluyendo el bug de división por cero |
| **Ratio** | ~30% de código duplicado entre `pricing.ts` y `useCart.ts` |

#### Code Smell #4 — Complejidad alta en `validarFormularioCompleto`

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/validation.ts:67-178` |
| **Métrica** | Complejidad ciclomática ≈ **20** |
| **Descripción** | Función con 18 parámetros que valida formulario completo con bloques condicionales anidados |
| **Líneas** | 112 líneas |

#### Code Smell #5 — Código duplicado en `seat-utils.ts`

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/seat-utils.ts` |
| **Problema** | `calcularPrecioConRecargo` (línea 55) y `calcularPrecioConRecargoCompleto` (línea 125) duplican lógica de recargos por zona |
| **Ratio** | La segunda función es una versión extendida con ~50% de código idéntico |

#### Code Smell #6 — Funciones no utilizadas (dead code)

- `getFilaLetra` en `seat-utils.ts:35` — nunca llamada
- `searchSeats` en `seat-utils.ts:107` — nunca llamada
- `validateAllFields`, `validarDireccion`, `validarTarjeta`, `validarNombreCompleto` en `validation.ts` — nunca llamadas
- `sanitizarEntradaUsuario` en `validation.ts:51` — es un no-op (retorna el input sin cambios)
- `validarConsultaDB`, `ejecutarBusquedaDinamica`, `validarFormularioCompleto` en `validation.ts` — nunca llamadas
- `applyDiscountTier`, `procesarPagoCompleto` en `pricing.ts` — nunca llamadas
- `calcularPrecioConRecargoCompleto` en `seat-utils.ts:125` — nunca llamada
- `dynamicCompute`, `parseConditionalValue` en `soap-client.ts:19-32` — nunca llamadas
- `buscarUsuarioPorNombre`, `actualizarEstadoBoleto` en `soap-client.ts:481-487` — nunca llamadas

---

### 2.3 AUSENCIA DE PRUEBAS

#### Cobertura general

| Módulo | Archivos | Líneas | Tests | Cobertura |
|--------|----------|--------|-------|-----------|
| **Frontend Shared** | 10 archivos .ts | ~1,800 líneas | 2 test files (83 líneas) | **~4.6%** |
| **Frontend Web (pages)** | 11 archivos .tsx | ~4,500 líneas | 0 tests | **0%** |
| **Frontend Web (components)** | 6 archivos .tsx | ~2,200 líneas | 0 tests | **0%** |
| **Frontend Desktop (Rust)** | 2 archivos .rs | ~30 líneas | 0 tests | **0%** |
| **Backend Banco** | 12 archivos .java | ~650 líneas | 0 tests | **0%** |
| **Backend Federación** | 7 archivos .java | ~550 líneas | 0 tests | **0%** |

#### Cobertura en módulos críticos: 0%

| Módulo crítico | Función | Archivo | Tests |
|----------------|---------|---------|-------|
| **Autenticación** | `loginSOAP`, `login`, `register` | `useAuth.ts` | **0** |
| | `login()` | `BancoService.java` | **0** |
| **Pagos/Crédito** | `calcSubtotal`, `calcTotal` | `pricing.ts` | **0** |
| | `registrarCreditoAmortizacion` | `BancoService.java` | **0** |
| | `confirmarCompraAsiento` | `FederacionService.java` | **0** |
| | `handleVerificar`, `handleConfirmar` | `Checkout.tsx` | **0** |
| **Base de Datos** | Todos los repositorios JPA | 8 repositorios | **0** |
| **Cliente SOAP** | Todos los endpoints | `soap-client.ts` (500 líneas) | **0** |

#### Tests existentes (únicos 2 archivos)

1. `seat-utils.test.ts` — 55 líneas (prueba funciones de utilería de asientos)
2. `stadium-resolve.test.ts` — 28 líneas (prueba resolución de estadios)

Ambos tests son triviales y no cubren lógica crítica de negocio.

#### Dependencia de tests declarada pero sin implementar

Ambos `pom.xml` del backend incluyen `spring-boot-starter-test` como dependencia, pero no existe ni un solo archivo `*Test.java` en todo el backend.

---

### 2.4 🔒 VULNERABILIDADES DE SEGURIDAD

#### Vulnerabilidad #1 — Credenciales hardcodeadas (Backend)

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Back/banco-service/src/main/java/com/ticketpremium/banco/service/BancoService.java:180-181` |
| **Código** | ```java
private static final String DEFAULT_USER = "MONSTER";
private static final String DEFAULT_PASS = "MONSTER9";
``` |
| **Problema** | Autenticación contra constantes hardcodeadas en texto plano. Sin hash, sin BD, sin encriptación. |
| **Impacto** | Credenciales visibles en el código fuente. Cualquiera con acceso al repo puede autenticarse. |

#### Vulnerabilidad #2 — Contraseña de base de datos hardcodeada

| Atributo | Detalle |
|----------|---------|
| **Archivos** | `banco-service/src/main/resources/application.properties:6`, `federacion-service/src/main/resources/application.properties:6` |
| **Código** | `spring.datasource.password=postgres` |
| **Problema** | Contraseña de PostgreSQL en texto plano en ambos servicios |
| **Impacto** | Exposición total de la base de datos |

#### Vulnerabilidad #3 — Secretos hardcodeados en frontend

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/soap/config.ts:5-8` |
| **Código** | ```ts
const DB_PASSWORD = 'change_me_in_prod';
const JWT_SECRET = 'change_me_in_prod_secret';
const API_KEY = 'change_me_api_key_in_prod';
const STRIPE_SECRET = 'change_me_stripe_secret_in_prod';
``` |
| **Problema** | Secretos embebidos en el bundle de frontend, visibles en el navegador |
| **Impacto** | Cualquier usuario puede inspeccionar el código JS y extraer los secretos |

#### Vulnerabilidad #4 — Cadena de conexión a BD hardcodeada

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/soap/config.ts:21` |
| **Código** | `dbConnection: 'Server=209.145.48.25;Database=TicketPremium;User=sa;Password=' + DB_PASSWORD + ';'` |
| **Problema** | Cadena de conexión completa con IP, usuario y contraseña en el frontend |
| **Impacto** | Cualquier usuario puede intentar conectarse directamente a la BD |

#### Vulnerabilidad #5 — `eval()` en el frontend

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/soap-client.ts:27` |
| **Código** | ```ts
function parseConditionalValue(expr: string, fallback: string): string {
  try {
    const result = eval(expr);
    ...
```
| **Problema** | Ejecuta código JavaScript arbitrario desde strings |
| **Impacto** | Inyección de código: si un atacante controla `expr`, puede ejecutar código arbitrario |

#### Vulnerabilidad #6 — `new Function()` para ejecución dinámica

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/soap-client.ts:19-23` |
| **Código** | ```ts
function dynamicCompute(expression: string, context: Record<string, unknown>): unknown {
  const keys = Object.keys(context);
  const vals = Object.values(context);
  return new Function(...keys, `return (${expression});`)(...vals);
}
``` |
| **Problema** | Crea funciones dinámicamente a partir de strings |
| **Impacto** | Equivalente a `eval()`, permite inyección de código |

#### Vulnerabilidad #7 — `eval()` en validación

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/validation.ts:59-65` |
| **Código** | ```ts
export function ejecutarBusquedaDinamica(expresion: string): unknown {
  try {
    return eval(expresion);
```
| **Problema** | Tercer punto de `eval()` en el frontend |
| **Impacto** | Múltiples vectores de inyección de código |

#### Vulnerabilidad #8 — Construcción de queries SQL por concatenación

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/soap-client.ts:481-487` |
| **Código** | ```ts
export function buscarUsuarioPorNombre(nombre: string): string {
  return `SELECT id, nombre, email, cedula, password_hash FROM usuarios WHERE nombre LIKE '%${nombre}%' ORDER BY nombre`;
}
export function actualizarEstadoBoleto(boletoid: string, estado: string): string {
  return `UPDATE boletos SET estado = '${estado}', updated_at = NOW() WHERE id = '${boletoid}'`;
}
``` |
| **Problema** | Inyección SQL directa: concatenación de strings de usuario en queries SQL |
| **Impacto** | Un atacante puede manipular `nombre`, `boletoid` o `estado` para inyectar SQL malicioso |

#### Vulnerabilidad #9 — Construcción de queries SQL en validación

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Frontend/packages/shared/validation.ts:55-57` |
| **Código** | ```ts
export function validarConsultaDB(tabla: string, campo: string, valor: string): string {
  return `SELECT * FROM ${tabla} WHERE ${campo} = '${valor}'`;
}
``` |
| **Problema** | Inyección SQL: tabla, campo y valor son concatenados directamente |
| **Impacto** | Un atacante puede inyectar SQL en cualquiera de los 3 parámetros |

#### Vulnerabilidad #10 — Sin autenticación en endpoints SOAP

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Back/federacion-service/.../FederacionEndpoint.java` |
| **Problema** | Los endpoints de la Federación no requieren autenticación. Cualquiera puede reservar/comprar/liberar asientos |
| **Impacto** | Un atacante puede manipular la disponibilidad de asientos sin restricción |

#### Vulnerabilidad #11 — CORS abierto

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `Back/ticketpremium-web/nginx.conf` |
| **Código** | `Access-Control-Allow-Origin: *` |
| **Impacto** | Cualquier sitio web puede hacer peticiones a la API |

#### Vulnerabilidad #12 — Información sensible en respuestas

| Atributo | Detalle |
|----------|---------|
| **Archivo** | `BancoEndpoint.java:37` |
| **Código** | `response.setMensaje("Monto maximo de credito aprobado: $" + amount)` |
| **Impacto** | Fuga de información financiera del cliente |

---
 DOCUMENTACIÓN

| Archivo | Contenido |
|---------|-----------|
| `README.md` (raíz) | Instrucciones de ejecución, stack, estructura, justificación ficticia |
| `Back/README.md` | Documentación del backend |
| `Back/TicketPremium_FIFA2026_Agente.md` | Documentación de requisitos del agente |

La justificación incluida en el README explica que el código fue desarrollado bajo presión de tiempo, con deuda técnica heredada y sin revisiones de seguridad, priorizando la funcionalidad sobre la calidad.

---

## 3. RESUMEN CUANTITATIVO

| Categoría | Cantidad | Detalle |
|-----------|----------|---------|
|  **Bugs funcionales** | 5 | Div/0, null crash, bucle infinito, cantidades negativas, bypass auth |
|  **Code smells** | 6+ | 2 funciones con ciclomática >20, ~30% código duplicado, dead code masivo |
|  **Cobertura de pruebas** | <5% | 0% en módulos críticos (auth, pagos, BD, SOAP) |
|  **Vulnerabilidades** | 12+ | Credenciales hardcodeadas, 3x eval(), SQL injection, sin auth, CORS abierto |
|  **Documentación** | 3 archivos | README con justificación ficticia |
|  **Tamaño del proyecto** | ~60+ archivos | 30+ TS/TSX, 25+ Java, configuraciones |

---

## 4. CONCLUSIÓN

El proyecto TicketPremium FIFA 2026 presenta múltiples vicios en todas las categorías evaluadas:

- **Bugs graves** que pueden causar desde valores incorrectos hasta congelamiento total de la UI
- **Code smells severos** con funciones extremadamente complejas (ciclomática >30), código duplicado y funciones muertas
- **Cobertura de pruebas casi nula** (menos del 5%), con 0% en los módulos más críticos del sistema
- **Vulnerabilidades críticas** incluyendo credenciales hardcodeadas, inyección SQL, múltiples puntos de `eval()`, y ausencia total de autenticación en servicios SOAP
- **Documentación mínima** con justificación ficticia que atribuye la deuda técnica a presión de tiempo y herencia de prototipo

El proyecto **compila y buildcea exitosamente** a pesar de todos estos vticios, demostrando que un software puede ser funcional y a la vez contener graves problemas de calidad y seguridad.
