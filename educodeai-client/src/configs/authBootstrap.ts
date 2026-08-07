import axios from 'axios'
import { getDeviceInfo } from '../utils/deviceHelper'
import { clearAuthTokens, getAuthTokens, setAuthTokens } from '../utils/authStorage'

let bootstrapPromise: Promise<boolean> | null = null

const persistRefreshUser = (user: unknown): void => {
  if (!user || typeof user !== 'object') return
  const source = user as Record<string, unknown>
  const allowlisted = {
    maNguoiDung: source.maNguoiDung ?? source.MaNguoiDung,
    id: source.id ?? source.Id ?? source.maNguoiDung ?? source.MaNguoiDung,
    taiKhoan: source.taiKhoan ?? source.TaiKhoan,
    hoTen: source.hoTen ?? source.HoTen,
    email: source.email ?? source.Email,
    vaiTro: source.vaiTro ?? source.VaiTro,
    anhDaiDien: source.anhDaiDien ?? source.AnhDaiDien
  }
  if (allowlisted.maNguoiDung == null && allowlisted.id == null) return
  localStorage.setItem('user_info', JSON.stringify(allowlisted))
}

export const bootstrapAuth = (): Promise<boolean> => {
  if (getAuthTokens().accessToken) return Promise.resolve(true)
  if (bootstrapPromise) return bootstrapPromise

  clearAuthTokens()
  const { maThietBi } = getDeviceInfo()

  bootstrapPromise = axios
    .post(
      `${import.meta.env.VITE_API_URL}/api/XacThuc/refresh-token`,
      { maThietBi },
      { withCredentials: true },
    )
    .then((response) => {
      const token = response.data?.token
      if (typeof token !== 'string' || !token.trim()) return false
      setAuthTokens(token)
      persistRefreshUser(response.data?.user)
      return true
    })
    .catch(() => {
      clearAuthTokens()
      localStorage.removeItem('user_info')
      return false
    })
    .finally(() => {
      bootstrapPromise = null
    })

  return bootstrapPromise
}
