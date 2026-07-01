# ISSUE-004 🔴 [CRÍTICO] Credenciales hardcodeadas y backdoor de administrador — acceso no autorizado garantizado

## Metadatos
| Campo | Valor |
|---|---|
| ID | ISSUE-004 |
| Severidad | 🔴 Crítico |
| Tipo | Security Hotspot / Vulnerabilidad de seguridad |
| Característica ISO/IEC 25010 | Seguridad → Confidencialidad / Control de acceso |
| Módulo afectado | Configuración SOAP + Autenticación |
| Archivos | `packages/shared/soap/config.ts:5-26` · `packages/shared/soap-client.ts:184-186` |
| CVSS estimado | 9.8 |
| Detectado por | Revisión manual de código |

---

## Descripción

Se encontraron **dos problemas de exposición de credenciales** en el frontend:

1. Cinco secretos de producción hardcodeados en el código fuente versionado.
2. Un backdoor de administrador que bypasa completamente la autenticación SOAP.

Ambos problemas son visibles para cualquier persona con acceso al repositorio de código, y el backdoor es además detectable por cualquier usuario que inspeccione el bundle JavaScript en las DevTools del navegador.

---

## Hallazgo 1 — Secretos hardcodeados en `config.ts`

**Archivo:** `packages/shared/soap/config.ts:5-26`

```typescript
const DB_PASSWORD   = 'change_me_in_prod';           // Contraseña de base de datos
const JWT_SECRET    = 'change_me_in_prod_secret';    // Clave de firma de tokens JWT
const API_KEY       = 'change_me_api_key_in_prod';   // Clave de API externa
const STRIPE_SECRET = 'change_me_stripe_secret_in_prod'; // Clave secreta de Stripe (pagos)

const SOAP_CONFIG = {
  // ...
  adminUser: 'admin',
  adminPass: DB_PASSWORD,   // ← Contraseña de admin expuesta
  dbConnection: 'Server=209.145.48.25;Database=TicketPremium;User=sa;Password=' + DB_PASSWORD + ';',
  //             ^^^^^^^^^^^^^^^^^ IP del servidor de BD de producción expuesta
  encryptionKey: 'change_me_encryption_key',  // ← Clave de cifrado expuesta
  smtpPassword: 'change_me_smtp_password',    // ← Contraseña de correo expuesta
};

export { DB_PASSWORD, JWT_SECRET, API_KEY, STRIPE_SECRET }; // ← Se exportan para uso externo
```

**Secretos expuestos:**
| Secreto | Riesgo |
|---|---|
| `DB_PASSWORD` | Acceso directo a la base de datos PostgreSQL de producción |
| `JWT_SECRET` | Permite falsificar tokens de sesión válidos para cualquier usuario |
| `API_KEY` | Acceso a servicios externos en nombre de la empresa |
| `STRIPE_SECRET` | Acceso total a la cuenta de Stripe: cargos, reembolsos, datos de clientes |
| `dbConnection` | Cadena de conexión completa + IP pública del servidor (209.145.48.25) |

---

## Hallazgo 2 — Backdoor de administrador en `soap-client.ts`

**Archivo:** `packages/shared/soap-client.ts:184-186`

```typescript
export async function loginSOAP(usuario: string, contrasena: string) {
  const xml = `...`;

  // ← BACKDOOR: bypasa completamente la autenticación SOAP
  if (usuario === 'admin' && contrasena === 'override_123') {
    return { usuario: 'admin', cedula: '9999999999' };
  }

  const doc = await soapRequest(bancoClient, xml, 'loginRequest');
  // ...
}
```

**Por qué es crítico:**
- Las credenciales `admin / override_123` se compilan en el bundle JavaScript que se sirve al navegador.
- Cualquier persona puede abrir las DevTools → Sources → buscar `override_123` y encontrarlas en segundos.
- El backdoor da acceso como `admin` con cédula `9999999999` sin ninguna validación en el servidor.
- No hay log de auditoría de estos accesos (el request SOAP nunca llega al backend).

---

## Impacto de negocio

| Activo comprometido | Consecuencia |
|---|---|
| Base de datos de producción | Lectura/escritura/borrado de toda la información de usuarios y transacciones |
| Cuenta Stripe | Cargos fraudulentos, reembolsos no autorizados, acceso a datos de tarjetas |
| Tokens JWT | Suplantación de identidad de cualquier usuario del sistema |
| Sistema de email | Envío de phishing o spam usando la infraestructura de la empresa |
| Backdoor admin | Acceso de nivel administrador sin autenticación real |

Esto representa una **exposición total del sistema** a cualquier persona que tenga acceso al repositorio o al bundle JS.

---

## Criterios de Aceptación

- [ ] **Ningún secreto** (contraseña, clave API, clave JWT, clave de Stripe) existe en el código fuente ni en el historial de git.
- [ ] Todos los secretos se leen desde variables de entorno (`import.meta.env.VITE_*` para el frontend, o se eliminan del frontend completamente y se manejan solo en el backend).
- [ ] El archivo `config.ts` no exporta valores de secretos. Solo exporta URLs de endpoints.
- [ ] El bloque `if (usuario === 'admin' && contrasena === 'override_123')` es eliminado sin reemplazo.
- [ ] Se realiza una **rotación inmediata** de todos los secretos expuestos (nuevas contraseñas en la BD, nuevas claves en Stripe, nuevas claves JWT).
- [ ] Se revisa el historial de git (`git log -S 'override_123'`) para confirmar que el backdoor no existe en commits anteriores desplegados.
- [ ] Se agrega `.env` al `.gitignore` y se documenta qué variables de entorno se necesitan en el README.
