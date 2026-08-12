import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyLoginResponse } from '../services/login-classifier.ts';
import { normalizeRole, normalizeAuthUser, isStudent } from '../guards/role-guard.ts';
import { authReducer, initialAuthState } from '../context/auth-reducer.ts';

test('classifier validates unknown and prioritizes OTP', () => {
  assert.equal(classifyLoginResponse(null).kind, 'invalid-response');
  assert.equal(classifyLoginResponse({ requiresOtp: true, email: 'a@b.c', message: 'otp', token: 'ignored' }).kind, 'otp-required');
  assert.equal(classifyLoginResponse({ requiresLogoutOldest: true, email: 'a@b.c', oldestDeviceName: 'old', message: 'replace' }).kind, 'device-replacement-required');
  assert.equal(classifyLoginResponse({ requiresCaptcha: true, message: 'captcha' }).kind, 'captcha-required');
});

test('classifier normalizes completed user role and ids', () => {
  const result = classifyLoginResponse({ token: 'jwt', user: { id: 7, taiKhoan: 'hv', hoTen: 'HV', email: 'a@b.c', vaiTro: '2', anhDaiDien: null } });
  assert.equal(result.kind, 'authenticated');
  if (result.kind === 'authenticated') assert.equal(result.session.user.maNguoiDung, 7);
});

test('role normalization accepts only known numeric and string roles', () => {
  assert.equal(normalizeRole('2'), 2); assert.equal(normalizeRole(1), 1); assert.equal(normalizeRole('student'), null);
  const user = normalizeAuthUser({ maNguoiDung: 1, taiKhoan: 'x', hoTen: 'X', email: 'x@y.z', vaiTro: '2' });
  assert.equal(isStudent(user), true);
});

test('reducer models required terminal statuses', () => {
  assert.equal(initialAuthState.status, 'bootstrapping');
  assert.equal(authReducer(initialAuthState, { type: 'CLEARED', reason: 'sessionExpired' }).status, 'sessionExpired');
  assert.equal(authReducer(initialAuthState, { type: 'CLEARED', reason: 'rejectedRole' }).status, 'rejectedRole');
  assert.equal(authReducer(initialAuthState, { type: 'ERROR', message: 'x' }).status, 'error');
});
