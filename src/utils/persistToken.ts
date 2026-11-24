import type { DurationType } from '@/shared/interface/time';
import cookie from './cookie';
import storage from './storage';
import { access_token, refresh_token } from '@/shared/constants/storage';

/**
 * Tokens live in cookies, as in the business app (internal-web-tool
 * `utils/persistToken.ts`). With no `duration` (and no caller passes one) a
 * cookie has no expiry: it's a session cookie, gone when the browser is quit.
 * Otherwise the API decides when a token stops working; see
 * `refreshTokenInterceptor`.
 */
export function getToken() {
  const accessToken = cookie.getValue<string>(access_token);
  const refreshToken = cookie.getValue<string>(refresh_token);

  return {
    accessToken,
    refreshToken,
  };
}

/** Without a `duration` the cookie is a session cookie: no expiry is set. */
export function setAccessToken(token: string, duration?: DurationType) {
  cookie.setValue(access_token, token, { duration });
}

/** Without a `duration` the cookie is a session cookie: no expiry is set. */
export function setRefreshToken(token: string, duration?: DurationType) {
  cookie.setValue(refresh_token, token, { duration });
}

export function removeToken() {
  cookie.clearValue(access_token);
  cookie.clearValue(refresh_token);
  // Tokens used to live in localStorage; don't leave old copies behind.
  storage.clearValue(access_token);
  storage.clearValue(refresh_token);
}

/**
 * One-off move for admins signed in before tokens moved to cookies: their
 * tokens are still in localStorage. Carried over once, then removed, so
 * nobody is signed out by the change and no copy stays in localStorage.
 */
export function migrateTokensToCookies() {
  const access = storage.getValue<string>(access_token);
  const refresh = storage.getValue<string>(refresh_token);
  if (!access && !refresh) return;
  if (access && !cookie.getValue(access_token)) setAccessToken(access);
  if (refresh && !cookie.getValue(refresh_token)) setRefreshToken(refresh);
  storage.clearValue(access_token);
  storage.clearValue(refresh_token);
}
