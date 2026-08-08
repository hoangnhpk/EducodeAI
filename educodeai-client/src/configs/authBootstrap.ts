import axios from 'axios'
import { getDeviceInfo } from '../utils/deviceHelper'
import { clearAuthTokens, getAuthTokens, setAuthTokens } from '../utils/authStorage'

let bootstrapPromise: Promise<boolean> | null = null

export const bootstrapAuth = (): Promise<boolean> => {
  if (getAuthTokens().accessToken) return Promise.resolve(true)
  if (bootstrapPromise) return bootstrapPromise

  // Không xóa access token đang có: Google/Facebook có thể hoàn tất đăng nhập
  // trong lúc request bootstrap ban đầu vẫn đang chờ cookie refresh.
  if (getAuthTokens().accessToken) return Promise.resolve(true)
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
      return true
    })
    .catch(() => {
      // Không xóa phiên vừa được tạo bởi đăng nhập Google/Facebook trong lúc
      // request bootstrap cũ còn đang hoàn tất.
      if (!getAuthTokens().accessToken) {
        clearAuthTokens()
        localStorage.removeItem('user_info')
      }
      return false
    })
    .finally(() => {
      bootstrapPromise = null
    })

  return bootstrapPromise
}
