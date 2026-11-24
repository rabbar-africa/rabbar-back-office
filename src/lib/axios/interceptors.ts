import Axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/constants/env';
import {
  getToken,
  setAccessToken,
  setRefreshToken,
} from '@/utils/persistToken';
import { isSessionEnded, leaveToSignIn } from '@/utils/session';

/**
 * Token expiry is the API's call, as in the business app
 * (internal-web-tool `lib/axios/interceptors.ts`): the browser keeps the
 * tokens with no expiry of its own. A 401 for an expired access token is
 * refreshed once and the request retried; requests that fail meanwhile wait
 * for that one refresh. A refused refresh, or a session the API has ended,
 * signs the admin out.
 */

const REFRESH_PATH = 'auth/refresh-token';

/**
 * Public calls (sign-in steps, forgotten password, the invite page): their
 * 401s are answers for the form ("Invalid credentials"), never a reason to
 * refresh or sign out.
 */
const PUBLIC_PATHS = [
  'back-office/auth/',
  'back-office/admins/invites/',
  'auth/login',
  'auth/forgot-password',
  'auth/reset-password',
];
const isSignInCall = (url?: string) =>
  Boolean(url && PUBLIC_PATHS.some((path) => url.includes(path)));

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  pendingQueue = [];
}

const messageOf = (data: unknown): unknown =>
  typeof data === 'object' && data !== null
    ? (data as Record<string, unknown>).message
    : data;

/** A 401 the API sends for a missing or expired access token. */
function isAuthError(status: number | undefined, data: unknown): boolean {
  if (status !== 401 && status !== 520) return false;
  const message = messageOf(data);
  const msg = (typeof message === 'string' ? message : '').toLowerCase();
  return (
    msg === 'jwt expired' ||
    msg === 'please authenticate' ||
    msg === 'unauthorized'
  );
}

// No interceptors: a failed refresh must not re-enter this logic.
const rawAxios = Axios.create({ baseURL: env.API_BASE_URL });

export function rejectErrorInterceptor(error: AxiosError) {
  return Promise.reject(error);
}

/** Adds the bearer token. */
export function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = getToken().accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }
  return config;
}

export async function refreshTokenInterceptor(error: AxiosError) {
  const originalRequest = error.config as RetryableConfig | undefined;
  const { status, data } = error.response ?? {};

  if (isSignInCall(originalRequest?.url)) return Promise.reject(error);

  // Ended on the API (deactivated, password reset, signed out everywhere):
  // a refresh can't bring it back.
  if (status === 401 && isSessionEnded(messageOf(data))) {
    flushQueue(error, null);
    leaveToSignIn(messageOf(data));
    return Promise.reject(error);
  }

  if (!isAuthError(status, data) || !originalRequest) {
    return Promise.reject(error);
  }

  // Already retried once, or the refresh itself was refused.
  if (originalRequest._retry || originalRequest.url?.includes(REFRESH_PATH)) {
    leaveToSignIn();
    return Promise.reject(error);
  }

  // A refresh is in flight: wait for it, then retry with the new token.
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    }).then((newToken) => {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return rawAxios(originalRequest);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const { refreshToken } = getToken();
  if (!refreshToken) {
    isRefreshing = false;
    flushQueue(error, null);
    leaveToSignIn();
    return Promise.reject(error);
  }

  try {
    const { data: body } = await rawAxios.post<{
      data: { accessToken: string; refreshToken: string };
    }>(REFRESH_PATH, { refreshToken });

    setAccessToken(body.data.accessToken);
    setRefreshToken(body.data.refreshToken);
    flushQueue(null, body.data.accessToken);

    originalRequest.headers.Authorization = `Bearer ${body.data.accessToken}`;
    return rawAxios(originalRequest);
  } catch (refreshError) {
    flushQueue(refreshError, null);
    leaveToSignIn(messageOf((refreshError as AxiosError)?.response?.data));
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}
