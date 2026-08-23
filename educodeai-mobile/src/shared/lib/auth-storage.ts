import AsyncStorage from '@react-native-async-storage/async-storage';

import { LEGACY_AUTH_STORAGE_KEYS, STORAGE_KEYS } from '../constants/storage-keys';
import type { AuthUser } from '../types/auth-public';

export const AUTH_SESSION_VERSION = 1 as const;

export interface AuthSession {
  token: string;
  tokenExpiresAt: string | null;
  user: AuthUser;
}

interface StoredAuthSession extends AuthSession {
  version: typeof AUTH_SESSION_VERSION;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isIdentity = (value: unknown): value is string | number =>
  (typeof value === 'string' && value.trim().length > 0) ||
  (typeof value === 'number' && Number.isFinite(value));

const isNullableString = (value: unknown): value is string | null | undefined =>
  value === null || value === undefined || typeof value === 'string';

export const parseStudentUser = (value: unknown): AuthUser | null => {
  if (!isRecord(value)) return null;
  const { id, maNguoiDung, taiKhoan, hoTen, email, vaiTro, anhDaiDien } = value;
  if (
    !isIdentity(id) ||
    (maNguoiDung !== undefined && !isIdentity(maNguoiDung)) ||
    typeof taiKhoan !== 'string' ||
    taiKhoan.trim().length === 0 ||
    typeof hoTen !== 'string' ||
    hoTen.trim().length === 0 ||
    typeof email !== 'string' ||
    email.trim().length === 0 ||
    vaiTro !== 2 ||
    !isNullableString(anhDaiDien)
  ) return null;

  return {
    id,
    ...(maNguoiDung !== undefined ? { maNguoiDung } : {}),
    taiKhoan,
    hoTen,
    email,
    vaiTro,
    ...(anhDaiDien !== undefined ? { anhDaiDien } : {}),
  };
};

export const parseStoredSession = (value: unknown): AuthSession | null => {
  if (!isRecord(value) || value.version !== AUTH_SESSION_VERSION) return null;
  const token = value.token;
  const tokenExpiresAt = value.tokenExpiresAt;
  const user = parseStudentUser(value.user);
  if (
    typeof token !== 'string' ||
    token.trim().length === 0 ||
    !(tokenExpiresAt === null || typeof tokenExpiresAt === 'string') ||
    !user
  ) return null;
  return { token: token.trim(), tokenExpiresAt, user };
};

const removeLegacySession = async (): Promise<void> => {
  await Promise.all([...LEGACY_AUTH_STORAGE_KEYS].map((key) => AsyncStorage.removeItem(key)));
};

export const authStorage = {
  async getSession(): Promise<AuthSession | null> {
    const serialized = await AsyncStorage.getItem(STORAGE_KEYS.authSession);
    if (serialized === null) {
      await removeLegacySession();
      return null;
    }

    try {
      const session = parseStoredSession(JSON.parse(serialized) as unknown);
      if (session) return session;
    } catch {
      // Invalid local data is treated as an anonymous session.
    }
    await this.clearSession();
    return null;
  },

  async setSession(session: AuthSession): Promise<void> {
    const user = parseStudentUser(session.user);
    if (!user || typeof session.token !== 'string' || session.token.trim().length === 0) {
      throw new Error('Only a valid student session can be persisted.');
    }
    const record: StoredAuthSession = {
      version: AUTH_SESSION_VERSION,
      token: session.token.trim(),
      tokenExpiresAt: session.tokenExpiresAt,
      user,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(record));
    await removeLegacySession();
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.authSession),
      ...LEGACY_AUTH_STORAGE_KEYS.map((key) => AsyncStorage.removeItem(key)),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return (await this.getSession())?.token ?? null;
  },
};
