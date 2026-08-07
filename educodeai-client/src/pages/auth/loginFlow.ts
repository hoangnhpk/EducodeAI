export interface LoginUser {
  vaiTro?: number
  VaiTro?: number
  [key: string]: unknown
}

type LoginResponse = Record<string, unknown>

export type LoginOutcome =
  | { kind: 'completed'; token: string; user: LoginUser }
  | { kind: 'otp'; email: string; message?: string }
  | { kind: 'replacement'; email: string; oldestDeviceName: string; message?: string }
  | { kind: 'captcha'; message?: string }
  | { kind: 'invalid' }

const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined

export const classifyLoginResponse = (response: LoginResponse): LoginOutcome => {
  if (response.requiresOtp === true && typeof response.email === 'string') {
    return { kind: 'otp', email: response.email, message: optionalString(response.message) }
  }

  if (response.requiresLogoutOldest === true && typeof response.email === 'string' && typeof response.oldestDeviceName === 'string') {
    return {
      kind: 'replacement',
      email: response.email,
      oldestDeviceName: response.oldestDeviceName,
      message: optionalString(response.message),
    }
  }

  if (response.requiresCaptcha === true) {
    return { kind: 'captcha', message: optionalString(response.message) }
  }

  if (typeof response.token === 'string' && response.token.trim() && response.user && typeof response.user === 'object') {
    return { kind: 'completed', token: response.token, user: response.user as LoginUser }
  }

  return { kind: 'invalid' }
}
