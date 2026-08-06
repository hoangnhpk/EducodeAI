vi.mock('@/configs/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('../utils/deviceHelper', () => ({
  getDeviceInfo: () => ({ maThietBi: 'spoofable-device-id', tenThietBi: 'Vitest Browser' }),
}))

vi.mock('../configs/sessionHub', () => ({ stopSessionHub: vi.fn() }))

import axiosInstance from '@/configs/axios'
import { authService } from './auth.service'

const get = vi.mocked(axiosInstance.get)
const post = vi.mocked(axiosInstance.post)

describe('authService social login', () => {
  beforeEach(() => post.mockReset())

  it('encodes Google device metadata through Axios params', async () => {
    post.mockResolvedValueOnce({})

    await authService.googleLogin({ credential: 'credential' }, 'id&?#', 'Browser & Phone?#')

    expect(post).toHaveBeenCalledWith('/api/XacThuc/google-login', { credential: 'credential' }, {
      params: { maThietBi: 'id&?#', tenThietBi: 'Browser & Phone?#' },
    })
  })
})

describe('authService device listing', () => {
  beforeEach(() => get.mockReset())

  it('does not send a client-controlled device fingerprint', async () => {
    get.mockResolvedValueOnce([])

    await authService.getDevices()

    expect(get).toHaveBeenCalledWith('/api/XacThuc/danh-sach-thiet-bi')
  })
})
