import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyLoginResponse, isStudent } from '../src/features/auth/utils/classify-login-response.ts';

test('classifies every supported login outcome', () => {
  assert.equal(classifyLoginResponse({ token: 'token', user: { vaiTro: 2 } }).kind, 'completed');
  assert.equal(classifyLoginResponse({ requiresOtp: true, email: 'student@educode.ai' }).kind, 'otp');
  assert.equal(classifyLoginResponse({ requiresLogoutOldest: true, email: 'student@educode.ai', oldestDeviceName: 'iPhone' }).kind, 'replacement');
  assert.equal(classifyLoginResponse({ requiresCaptcha: true }).kind, 'captcha');
  assert.equal(classifyLoginResponse({ requiresOtp: true }).kind, 'invalid');
});

test('student role accepts numeric and serialized role 2 only', () => {
  assert.equal(isStudent({ vaiTro: 2 }), true);
  assert.equal(isStudent({ VaiTro: '2' }), true);
  assert.equal(isStudent({ vaiTro: 1 }), false);
  assert.equal(isStudent({ VaiTro: 0 }), false);
});
