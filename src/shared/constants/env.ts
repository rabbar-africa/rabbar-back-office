export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  GOOGLE_API_KEY: import.meta.env.VITE_APP_GOOGLE_API_KEY,
  FRONTEND_URL: import.meta.env.VITE_APP_FRONTEND_URL,
  GOOGLE_OAUTH_CLIENT_KEY: import.meta.env.VITE_APP_GOOGLE_OAUTH_CLIENT_KEY,
  ENCRYPTION_KEY: import.meta.env.VITE_APP_ENCRYPTION_KEY,
  ENCRYPTION_IV: import.meta.env.VITE_APP_ENCRYPTION_IV,
  /**
   * The business app (internal-web-tool), e.g. https://app.rabbar.africa.
   * Admins reset a forgotten password there; the sign-in screen links to it
   * only when this is set.
   */
  BUSINESS_APP_URL: import.meta.env.VITE_APP_BUSINESS_APP_URL as
    | string
    | undefined,
};
