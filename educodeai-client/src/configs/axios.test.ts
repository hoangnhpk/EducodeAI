import axios from 'axios'
import axiosClient from './axios'
import { getAuthTokens, setAuthTokens } from '../utils/authStorage'
import { getSessionGeneration, markLoginSucceeded } from '../utils/authLifecycle'

const { swalFire } = vi.hoisted(() => ({
  swalFire: vi.fn(() => Promise.resolve()),
}))

vi.mock('sweetalert2', () => ({
  default: {
    fire: swalFire,
    getHtmlContainer: () => null,
    getTimerLeft: () => 0,
  },
}))
vi.mock('../utils/deviceHelper', () => ({
  getDeviceInfo: () => ({ maThietBi: 'device-001', tenThietBi: 'Vitest Browser' }),
}))

describe('axios auth storage integration', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
    swalFire.mockClear()
    vi.restoreAllMocks()
  })

  it('adds a trimmed bearer token from runtime memory to outgoing requests', async () => {
    setAuthTokens('access-token')

    const config = await axiosClient.interceptors.request.handlers[0].fulfilled({
      headers: {},
      data: undefined,
    })

    expect(config.headers.Authorization).toBe('Bearer access-token')
    expect(config.headers['Content-Type']).toBe('application/json')
  })

  it('never sends a client-controlled maintenance bypass header on admin routes', async () => {
    window.history.pushState({}, '', '/quan-tri-vien/dashboard')

    const config = await axiosClient.interceptors.request.handlers[0].fulfilled({
      headers: {},
      data: undefined,
    })

    expect(config.headers['X-Bypass-Maintenance']).toBeUndefined()
  })

  it('refreshes via HttpOnly cookie without any token in localStorage or URL', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: { token: 'new-access-token' },
    })

    await axiosClient.interceptors.response.handlers[0].rejected({
      config: {
        headers: {},
        adapter: async () => ({
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} },
        }),
      },
      response: { status: 401, data: {} },
    })

    expect(getAuthTokens().accessToken).toBe('new-access-token')
    expect(localStorage.getItem('user_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()

    // Refresh request carries no refresh token in the URL and relies on the cookie.
    const [url, body, options] = postSpy.mock.calls[0]
    expect(url).not.toContain('refreshToken=')
    expect(body).toEqual({ maThietBi: 'device-001' })
    expect(options).toMatchObject({ withCredentials: true })
  })

  it('does not let an older refresh failure clear a newer successful login', async () => {
    let rejectRefresh!: (reason: unknown) => void
    vi.spyOn(axios, 'post').mockImplementationOnce(() => new Promise((_, reject) => {
      rejectRefresh = reject
    }))

    const requestGeneration = getSessionGeneration()
    const staleRequest = axiosClient.interceptors.response.handlers[0].rejected({
      config: {
        headers: {},
        _authGeneration: requestGeneration,
      },
      response: { status: 401, data: {} },
    })

    markLoginSucceeded()
    setAuthTokens('new-login-token')
    rejectRefresh({ response: { status: 401, data: {} } })

    await expect(staleRequest).rejects.toBeTruthy()
    await Promise.resolve()

    expect(getAuthTokens().accessToken).toBe('new-login-token')
    expect(swalFire).not.toHaveBeenCalled()
  })
})
