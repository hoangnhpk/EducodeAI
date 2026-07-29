const LEGACY_ACCESS_TOKEN_KEYS = ['user_token', 'token', 'refresh_token'] as const

let accessToken: string | null = null

export interface AuthTokens {
  accessToken: string | null
}

const removeLegacyTokens = (): void => {
  LEGACY_ACCESS_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
}

export const getAccessToken = (): string | null => accessToken

export const getAuthTokens = (): AuthTokens => ({ accessToken })

export const setAuthTokens = (token: string): void => {
  accessToken = token.trim() || null
  removeLegacyTokens()
}

export const clearAuthTokens = (): void => {
  accessToken = null
  removeLegacyTokens()
}
