import { create, isAxiosError } from 'axios';

import { authStorage } from '../lib/auth-storage';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
if (!configuredUrl) throw new Error('EXPO_PUBLIC_API_URL is required.');
export const API_BASE_URL = configuredUrl.replace(/\/+$/, '');
export const BASE_URL = API_BASE_URL;

export type UnauthorizedReason = 'sessionExpired';
let unauthorizedCallback: ((reason: UnauthorizedReason) => void | Promise<void>) | null = null;
let unauthorizedInProgress = false;

export const setUnauthorizedCallback = (callback: ((reason: UnauthorizedReason) => void | Promise<void>) | null): (() => void) => {
  unauthorizedCallback = callback;
  return () => { if (unauthorizedCallback === callback) unauthorizedCallback = null; };
};

const api = create({ baseURL: `${API_BASE_URL}/api`, timeout: 30_000 });
const readTokenSafely = async (): Promise<string | null> => {
  try {
    return await Promise.race([
      authStorage.getAccessToken(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_000)),
    ]);
  } catch {
    return null;
  }
};
api.interceptors.request.use(async (config) => {
  const token = await readTokenSafely();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, async (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401 && !unauthorizedInProgress) {
    unauthorizedInProgress = true;
    try { await unauthorizedCallback?.('sessionExpired'); } finally { unauthorizedInProgress = false; }
  }
  return Promise.reject(error);
});

export default api;
