import { clearLocalSession, redirectToLoginOnce, resetSessionTerminationForTests } from './sessionTermination'
import { clearAuthTokens } from './authStorage'

vi.mock('./authStorage', () => ({ clearAuthTokens: vi.fn() }))

describe('session termination', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(clearAuthTokens).mockClear()
    resetSessionTerminationForTests()
  })

  it('clears only local authentication state', () => {
    localStorage.setItem('user_info', '{}')
    localStorage.setItem('unrelated_preference', 'kept')

    clearLocalSession()

    expect(clearAuthTokens).toHaveBeenCalledOnce()
    expect(localStorage.getItem('user_info')).toBeNull()
    expect(localStorage.getItem('unrelated_preference')).toBe('kept')
  })

  it('redirects only once for duplicate realtime events', () => {
    const navigate = vi.fn()

    expect(redirectToLoginOnce(navigate)).toBe(true)
    expect(redirectToLoginOnce(navigate)).toBe(false)

    expect(navigate).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith('/dang-nhap')
    expect(clearAuthTokens).toHaveBeenCalledOnce()
  })
})
