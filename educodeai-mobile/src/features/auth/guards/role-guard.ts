import { USER_ROLES, type AuthUser, type UserRole } from '../types/auth.types';

export const normalizeRole = (value: unknown): UserRole | null => {
  const numeric = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return numeric === 0 || numeric === 1 || numeric === 2 ? numeric : null;
};

export const normalizeAuthUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const role = normalizeRole(raw.vaiTro);
  const id = typeof raw.maNguoiDung === 'number' ? raw.maNguoiDung : typeof raw.id === 'number' ? raw.id : null;
  if (id === null || role === null || typeof raw.taiKhoan !== 'string' || typeof raw.hoTen !== 'string' || typeof raw.email !== 'string') return null;
  return { maNguoiDung: id, id, taiKhoan: raw.taiKhoan, hoTen: raw.hoTen, email: raw.email, vaiTro: role, anhDaiDien: typeof raw.anhDaiDien === 'string' ? raw.anhDaiDien : null };
};

export const isStudent = (user: AuthUser | null): boolean => user?.vaiTro === USER_ROLES.student;
export const hasAllowedRole = (user: AuthUser | null, allowedRoles: readonly UserRole[]): boolean => user !== null && allowedRoles.includes(user.vaiTro);
