/**
 * Production Environment Configuration
 * This file is used for production deployments
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com/api',
  appName: 'GOGL RCS',
  version: '1.0.0',
  enableLogging: false,
  logLevel: 'error',
  enableDevTools: false,
  enableMockData: false,
  corsOrigin: 'https://gogl-rcs.com',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE',
};

