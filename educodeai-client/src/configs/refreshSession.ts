import axios from 'axios'
import { getDeviceInfo } from '../utils/deviceHelper'
import { getSessionGeneration, isLoggingOut } from '../utils/authLifecycle'
import { setAuthTokens } from '../utils/authStorage'

export type RefreshOutcome = 'success' | 'terminal-failure' | 'transient-failure'
export type RefreshResult = { outcome: RefreshOutcome; token?: string; user?: unknown; error?: unknown }

let inFlight: Promise<RefreshResult> | null = null

const isTransient = (error: any) => !error?.response || error.response.status >= 500

export const refreshSession = (): Promise<RefreshResult> => {
  if (inFlight) return inFlight
  const generation = getSessionGeneration()
  const { maThietBi } = getDeviceInfo()
  inFlight = axios.post(`${import.meta.env.VITE_API_URL}/api/XacThuc/refresh-token`, { maThietBi }, { withCredentials: true })
    .then(response => {
      const token = response.data?.token
      if (isLoggingOut() || generation !== getSessionGeneration()) return { outcome: 'terminal-failure' as const }
      if (typeof token !== 'string' || !token.trim()) return { outcome: 'terminal-failure' as const, error: new Error('Invalid refresh response') }
      setAuthTokens(token.trim())
      return { outcome: 'success' as const, token: token.trim(), user: response.data?.user }
    })
    .catch(error => ({ outcome: isTransient(error) ? 'transient-failure' as const : 'terminal-failure' as const, error }))
    .finally(() => { inFlight = null })
  return inFlight
}
