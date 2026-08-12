import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_STORAGE_KEYS, LEGACY_AUTH_STORAGE_KEYS } from '../constants/storage-keys';
import type { AuthSession } from '../../features/auth/types/auth.types';
import { normalizeAuthUser } from '../../features/auth/guards/role-guard';

export const authStorage = {
  async readSession(): Promise<AuthSession | null> {
    const [accessToken, serializedUser, tokenExpiresAt] = await Promise.all([
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.accessToken),
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.user),
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.tokenExpiresAt),
    ]);
    if (!accessToken || !serializedUser) {
      if (accessToken || serializedUser) await this.clearSession();
      return null;
    }

    try {
      const user = normalizeAuthUser(JSON.parse(serializedUser));
      if (user) return { accessToken, tokenExpiresAt, user };
      await this.clearSession();
      return null;
    } catch {
      await this.clearSession();
      return null;
    }
  },

  async writeSession(session: AuthSession): Promise<void> {
    const entries: [string, string][] = [
      [AUTH_STORAGE_KEYS.accessToken, session.accessToken],
      [AUTH_STORAGE_KEYS.user, JSON.stringify(session.user)],
    ];
    if (session.tokenExpiresAt) entries.push([AUTH_STORAGE_KEYS.tokenExpiresAt, session.tokenExpiresAt]);
    await Promise.all(entries.map(([key, value]) => AsyncStorage.setItem(key, value)));
    if (!session.tokenExpiresAt) await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.tokenExpiresAt);
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      AUTH_STORAGE_KEYS.accessToken,
      AUTH_STORAGE_KEYS.tokenExpiresAt,
      AUTH_STORAGE_KEYS.user,
      ...LEGACY_AUTH_STORAGE_KEYS,
    ].map((key) => AsyncStorage.removeItem(key)));
  },

  getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  },
};
