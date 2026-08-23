export type MobileRole = 0 | 1 | 2;

export interface AuthUser {
  id: string | number;
  maNguoiDung?: string | number;
  taiKhoan: string;
  hoTen: string;
  email: string;
  vaiTro: MobileRole;
  anhDaiDien?: string | null;
}

export type AuthStatus =
  | 'bootstrapping'
  | 'anonymous'
  | 'authenticated'
  | 'sessionExpired'
  | 'roleRejected';

export type SessionEndReason =
  | 'logout'
  | 'unauthorized'
  | 'revoked'
  | 'role-change';

export interface AuthPublicApi {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout(): Promise<void>;
  clearSession(reason?: SessionEndReason): Promise<void>;
  updateUser(
    patch: Partial<Pick<AuthUser, 'hoTen' | 'anhDaiDien'>>,
  ): Promise<void>;
}
