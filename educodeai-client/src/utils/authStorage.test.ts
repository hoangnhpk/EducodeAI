import { clearAuthTokens, getAuthTokens, setAuthTokens } from './authStorage'

describe('authStorage baseline', () => {
  beforeEach(() => localStorage.clear())

  it('returns a null access token when storage is empty', () => {
    expect(getAuthTokens()).toEqual({ accessToken: null })
  })

  it('stores and returns the current access token', () => {
    setAuthTokens('access-token')

    expect(getAuthTokens()).toEqual({ accessToken: 'access-token' })
  })

  it('does not persist a refresh token in localStorage', () => {
    setAuthTokens('access-token')

    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('removes only the access token key', () => {
    localStorage.setItem('user_info', '{"id":42}')
    setAuthTokens('access-token')

    clearAuthTokens()

    expect(getAuthTokens()).toEqual({ accessToken: null })
    expect(localStorage.getItem('user_info')).toBe('{"id":42}')
  })
})
