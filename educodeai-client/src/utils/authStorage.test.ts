import { clearAuthTokens, getAuthTokens, setAuthTokens } from './authStorage'

describe('authStorage runtime access token', () => {
  beforeEach(() => {
    localStorage.clear()
    clearAuthTokens()
  })

  it('returns a null access token when runtime state is empty', () => {
    expect(getAuthTokens()).toEqual({ accessToken: null })
  })

  it('stores and returns the current access token only in memory', () => {
    setAuthTokens(' access-token ')

    expect(getAuthTokens()).toEqual({ accessToken: 'access-token' })
    expect(localStorage.getItem('user_token')).toBeNull()
  })

  it('removes legacy persisted access and refresh tokens when setting runtime auth', () => {
    localStorage.setItem('user_token', 'legacy-access')
    localStorage.setItem('token', 'legacy-token')
    localStorage.setItem('refresh_token', 'legacy-refresh')

    setAuthTokens('access-token')

    expect(localStorage.getItem('user_token')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('clears runtime and legacy tokens without removing user info', () => {
    localStorage.setItem('user_info', '{"id":42}')
    localStorage.setItem('user_token', 'legacy-access')
    setAuthTokens('access-token')

    clearAuthTokens()

    expect(getAuthTokens()).toEqual({ accessToken: null })
    expect(localStorage.getItem('user_token')).toBeNull()
    expect(localStorage.getItem('user_info')).toBe('{"id":42}')
  })
})
