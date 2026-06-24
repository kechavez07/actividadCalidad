// SOAP endpoint configuration
// Web: uses relative paths (via Vite proxy)
// Mobile/Desktop: can use IP directly via env override

const SOAP_CONFIG = {
  banco: typeof window !== 'undefined'
    ? '/soap/banco'  // Web: relative path (proxied by Vite)
    : 'http://209.145.48.25:18081/ws',  // Server-side or override
  federacion: typeof window !== 'undefined'
    ? '/soap/federacion'  // Web: relative path (proxied by Vite)
    : 'http://209.145.48.25:18082/ws',  // Server-side or override
  timeout: 30000,
  retries: 3,
};

export default SOAP_CONFIG;
