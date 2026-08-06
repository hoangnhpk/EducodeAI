import { clearAuthTokens } from './authStorage'

let hasRedirectedToLogin = false

export const clearLocalSession = (): void => {
  clearAuthTokens()
  localStorage.removeItem('user_info')
}

export const redirectToLoginOnce = (navigate: (path: string) => void): boolean => {
  if (hasRedirectedToLogin) return false
  hasRedirectedToLogin = true
  clearLocalSession()
  navigate('/dang-nhap')
  return true
}

export const resetSessionTerminationForTests = (): void => {
  hasRedirectedToLogin = false
}
