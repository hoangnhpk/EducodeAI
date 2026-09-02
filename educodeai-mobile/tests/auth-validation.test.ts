import assert from 'node:assert/strict';
import test from 'node:test';
import {
  emailError,
  matchingPasswordError,
  otpError,
  passwordError,
  required,
} from '../src/features/auth/utils/auth-validation.ts';

test('required validates blank fields', () => {
  assert.equal(required('   ', 'Email'), 'Email không được để trống.');
  assert.equal(required('student', 'Email'), undefined);
});

test('email validation accepts a valid address and rejects malformed input', () => {
  assert.equal(emailError('student@educode.ai'), undefined);
  assert.equal(emailError('student@'), 'Email không hợp lệ.');
});

test('OTP accepts exactly six digits', () => {
  assert.equal(otpError('123456'), undefined);
  assert.equal(otpError('12345'), 'Mã OTP phải gồm 6 chữ số.');
  assert.equal(otpError('12345a'), 'Mã OTP phải gồm 6 chữ số.');
});

test('password validation enforces length and confirmation', () => {
  assert.equal(passwordError('1234567'), 'Mật khẩu phải có ít nhất 8 ký tự.');
  assert.equal(passwordError('12345678'), undefined);
  assert.equal(matchingPasswordError('12345678', '87654321'), 'Mật khẩu xác nhận không khớp.');
  assert.equal(matchingPasswordError('12345678', '12345678'), undefined);
});
