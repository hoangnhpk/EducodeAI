import { classifyLoginResponse, isAuthUser, parseAuthResponse } from '../types';

const user = { id: 1, taiKhoan: 'sv01', hoTen: 'Student', email: 'sv@example.com', vaiTro: 2 as const };

describe('login response classifier', () => {
  test.each([
    [{ requiresOtp: true, requiresLogoutOldest: true, requiresCaptcha: true }, 'requiresOtp'],
    [{ requiresLogoutOldest: true, requiresCaptcha: true }, 'requiresLogoutOldest'],
    [{ requiresCaptcha: true }, 'requiresCaptcha'],
  ])('uses precedence for %p', (value, kind) => {
    expect(classifyLoginResponse(value).kind).toBe(kind);
  });

  it('accepts a valid authenticated response', () => {
    expect(classifyLoginResponse({ token: ' jwt ', tokenExpiresAt: null, user })).toEqual({
      kind: 'authenticated',
      session: { token: 'jwt', tokenExpiresAt: null, user },
    });
  });

  it('rejects malformed responses', () => {
    expect(classifyLoginResponse({ token: 'x', user: { ...user, vaiTro: '2' } })).toEqual({ kind: 'invalid' });
    expect(classifyLoginResponse(null)).toEqual({ kind: 'invalid' });
  });
});

describe('auth user validation', () => {
  it('accepts only numeric role 2', () => {
    expect(isAuthUser(user)).toBe(true);
    expect(isAuthUser({ ...user, vaiTro: 0 })).toBe(false);
    expect(isAuthUser({ ...user, vaiTro: 1 })).toBe(false);
    expect(isAuthUser({ ...user, vaiTro: '2' })).toBe(false);
    expect(parseAuthResponse({ token: 'x', user: { ...user, email: '' } })).toBeNull();
  });
});
