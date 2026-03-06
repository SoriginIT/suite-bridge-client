/**
 * App configuration. In Vite, only variables prefixed with VITE_ are exposed to the client.
 * Use import.meta.env.VITE_* in code, or this config for a single place to reference.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
