import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDeviceName, generateDeviceId } from './device';

test('device id generation is deterministic with injected inputs', () => {
  assert.equal(generateDeviceId(1_000, 0.5), 'native_rs_i');
});

test('device name uses native platform labels and fallback app name', () => {
  assert.equal(buildDeviceName('EduCodeAI Student', 'android'), 'EduCodeAI Student - Android');
  assert.equal(buildDeviceName(undefined, 'ios'), 'EduCodeAI - iOS');
});
