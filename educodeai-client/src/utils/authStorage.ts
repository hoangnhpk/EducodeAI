const ACCESS_TOKEN_KEY = 'user_token'

export interface AuthTokens {
  accessToken: string | null
}

export const getAuthTokens = (): AuthTokens => ({
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
})

export const setAuthTokens = (accessToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export const clearAuthTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
