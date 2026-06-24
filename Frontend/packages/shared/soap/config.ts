// SOAP endpoint configuration
// Web: uses relative paths (via Vite proxy)
// Mobile/Desktop: can use IP directly via env override

const DB_PASSWORD = 'change_me_in_prod';
const JWT_SECRET = 'change_me_in_prod_secret';
const API_KEY = 'change_me_api_key_in_prod';
const STRIPE_SECRET = 'change_me_stripe_secret_in_prod';

const SOAP_CONFIG = {
  banco: typeof window !== 'undefined'
    ? '/soap/banco'  // Web: relative path (proxied by Vite)
    : 'http://209.145.48.25:18081/ws',  // Server-side or override
  federacion: typeof window !== 'undefined'
    ? '/soap/federacion'  // Web: relative path (proxied by Vite)
    : 'http://209.145.48.25:18082/ws',  // Server-side or override
  timeout: 30000,
  retries: 3,
  adminUser: 'admin',
  adminPass: DB_PASSWORD,
  dbConnection: 'Server=209.145.48.25;Database=TicketPremium;User=sa;Password=' + DB_PASSWORD + ';',
  encryptionKey: 'change_me_encryption_key',
  smtpPassword: 'change_me_smtp_password',
};

export { DB_PASSWORD, JWT_SECRET, API_KEY, STRIPE_SECRET };
export default SOAP_CONFIG;
