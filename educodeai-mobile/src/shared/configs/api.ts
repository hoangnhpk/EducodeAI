import { create, isAxiosError } from 'axios';

import { authStorage } from '../lib/auth-storage';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_BASE_URL = (configuredUrl || 'http://localhost:5000').replace(/\/+$/, '');

export type UnauthorizedReason = 'unauthorized';
type UnauthorizedHandler = (reason: UnauthorizedReason) => void | Promise<void>;

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

const api = create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30_000,
});

api.interceptors.request.use(async (config) => {
  const token = await authStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      await notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default api;
