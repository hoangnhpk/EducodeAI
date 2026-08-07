import { describe, expect, it } from 'vitest'
import { classifyLoginResponse } from '../pages/auth/loginFlow'

describe('classifyLoginResponse', () => {
  it('classifies a completed login only with a token and user', () => {
    expect(classifyLoginResponse({ token: 'token', user: { vaiTro: 2 } })).toEqual({
      kind: 'completed', token: 'token', user: { vaiTro: 2 },
    })
  })

  it('keeps the server email for an OTP continuation', () => {
    expect(classifyLoginResponse({ requiresOtp: true, email: 'google@example.com', message: 'OTP sent' })).toEqual({
      kind: 'otp', email: 'google@example.com', message: 'OTP sent',
    })
  })

  it('classifies a device replacement challenge', () => {
    expect(classifyLoginResponse({ requiresLogoutOldest: true, email: 'user@example.com', oldestDeviceName: 'Phone' })).toEqual({
      kind: 'replacement', email: 'user@example.com', oldestDeviceName: 'Phone', message: undefined,
    })
  })

  it('rejects malformed success responses', () => {
    expect(classifyLoginResponse({ user: { vaiTro: 2 } })).toEqual({ kind: 'invalid' })
    expect(classifyLoginResponse({ token: 'token' })).toEqual({ kind: 'invalid' })
  })
})
