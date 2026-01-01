/**
 * Staging Environment Configuration
 * This file is used for staging deployments
 */
export const environment = {
  production: false,
  apiUrl: 'https://api.staging.com/api',
  appName: 'GOGL RCS',
  version: '1.0.0',
  enableLogging: true,
  logLevel: 'info',
  enableDevTools: false,
  enableMockData: false,
  corsOrigin: 'https://staging.gogl-rcs.com',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE',
};

