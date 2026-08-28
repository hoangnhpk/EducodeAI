import { create, isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { authStorage } from '../lib/auth-storage';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_BASE_URL = (configuredUrl || 'http://localhost:5000').replace(/\/+$/, '');
export const BASE_URL = API_BASE_URL;

export type UnauthorizedReason = 'unauthorized';
type UnauthorizedHandler = (reason: UnauthorizedReason) => void | Promise<void>;

type RetryConfig = InternalAxiosRequestConfig & { __retryCount?: number };

const MAX_NETWORK_RETRIES = 2;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let unauthorizedNotification: Promise<void> | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null): (() => void) => {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
};

export const notifyUnauthorized = (): Promise<void> => {
  if (!unauthorizedNotification) {
    unauthorizedNotification = Promise.resolve(unauthorizedHandler?.('unauthorized')).finally(() => {
      unauthorizedNotification = null;
    });
  }
  return unauthorizedNotification;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableNetworkError = (error: AxiosError): boolean => {
  if (error.response) return false;
  const code = error.code ?? '';
  // Không retry khi request bị hủy (đổi màn / unmount).
  if (code === 'ERR_CANCELED' || error.message === 'canceled') return false;
  return (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ERR_NETWORK' ||
    code === 'ECONNRESET' ||
    code === ''
  );
};

const api = create({
  baseURL: `${API_BASE_URL}/api`,
  // Fail sớm hơn trên Wi‑Fi yếu để retry thay vì treo 30–60s.
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  const token = await authStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) return Promise.reject(error);

    if (error.response?.status === 401) {
      await notifyUnauthorized();
      return Promise.reject(error);
    }

    const config = error.config as RetryConfig | undefined;
    if (config && isRetryableNetworkError(error)) {
      const retryCount = config.__retryCount ?? 0;
      if (retryCount < MAX_NETWORK_RETRIES) {
        config.__retryCount = retryCount + 1;
        await sleep(350 * config.__retryCount);
        return api.request(config);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
