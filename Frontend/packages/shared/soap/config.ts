// SOAP endpoint configuration.
// All secrets (DB password, JWT, API keys, Stripe) MUST be provided via
// environment variables. They are NEVER hardcoded and NEVER shipped to the client.
// Web: uses relative paths (via Vite proxy)
// Mobile/Desktop: can use IP directly via env override

const envBanco = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SOAP_BANCO) || '';
const envFederacion = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SOAP_FEDERACION) || '';

const SOAP_CONFIG = {
  banco: envBanco || (typeof window !== 'undefined' ? '/soap/banco' : ''),
  federacion: envFederacion || (typeof window !== 'undefined' ? '/soap/federacion' : ''),
  timeout: 30000,
  retries: 3,
};

export default SOAP_CONFIG;
