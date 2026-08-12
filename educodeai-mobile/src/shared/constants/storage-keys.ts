export const AUTH_STORAGE_KEYS = {
  accessToken: '@educodeai/auth/access-token',
  tokenExpiresAt: '@educodeai/auth/token-expires-at',
  user: '@educodeai/auth/user',
  deviceId: '@educodeai/auth/device-id',
} as const;

export const LEGACY_AUTH_STORAGE_KEYS = ['token', 'user'] as const;
