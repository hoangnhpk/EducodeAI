import { getAuthTokens } from '../utils/authStorage'
import { refreshSession } from './refreshSession'

let bootstrapPromise: Promise<boolean> | null = null

export const bootstrapAuth = (): Promise<boolean> => {
  if (getAuthTokens().accessToken) return Promise.resolve(true)
  if (bootstrapPromise) return bootstrapPromise
  bootstrapPromise = refreshSession()
    .then(result => result.outcome === 'success')
    .finally(() => { bootstrapPromise = null })
  return bootstrapPromise
}
