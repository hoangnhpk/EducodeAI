import { authReducer, initialAuthState } from '../context/auth-reducer';
import { isStudent, normalizeAuthUser, normalizeRole } from '../guards/role-guard';
import { classifyLoginResponse } from '../services/login-classifier';

describe('legacy auth integration helpers', () => {
  it('validates unknown responses and prioritizes pending flows', () => {
    expect(classifyLoginResponse(null).kind).toBe('invalid-response');
    expect(classifyLoginResponse({ requiresOtp: true, email: 'a@b.c', message: 'otp', token: 'ignored' }).kind).toBe('otp-required');
    expect(classifyLoginResponse({ requiresLogoutOldest: true, email: 'a@b.c', oldestDeviceName: 'old', message: 'replace' }).kind).toBe('device-replacement-required');
    expect(classifyLoginResponse({ requiresCaptcha: true, message: 'captcha' }).kind).toBe('captcha-required');
  });

  it('normalizes a completed student response', () => {
    const result = classifyLoginResponse({ token: 'jwt', user: { id: 7, taiKhoan: 'hv', hoTen: 'HV', email: 'a@b.c', vaiTro: '2', anhDaiDien: null } });
    expect(result.kind).toBe('authenticated');
    if (result.kind === 'authenticated') expect(result.session.user.maNguoiDung).toBe(7);
  });

  it('accepts only known numeric and string roles', () => {
    expect(normalizeRole('2')).toBe(2);
    expect(normalizeRole(1)).toBe(1);
    expect(normalizeRole('student')).toBeNull();
    const user = normalizeAuthUser({ maNguoiDung: 1, taiKhoan: 'x', hoTen: 'X', email: 'x@y.z', vaiTro: '2' });
    expect(isStudent(user)).toBe(true);
  });

  it('models the historical terminal statuses', () => {
    expect(initialAuthState.status).toBe('bootstrapping');
    expect(authReducer(initialAuthState, { type: 'CLEARED', reason: 'sessionExpired' }).status).toBe('sessionExpired');
    expect(authReducer(initialAuthState, { type: 'CLEARED', reason: 'rejectedRole' }).status).toBe('rejectedRole');
    expect(authReducer(initialAuthState, { type: 'ERROR', message: 'x' }).status).toBe('error');
  });
});
