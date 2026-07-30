import axios from 'axios'
import { getDeviceInfo } from '../utils/deviceHelper'
import { clearAuthTokens, getAuthTokens, setAuthTokens } from '../utils/authStorage'

let bootstrapPromise: Promise<boolean> | null = null

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
