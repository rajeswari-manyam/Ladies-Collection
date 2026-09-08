import type { ApiConfig } from '@/types/api.types'
import { ENV } from './env'

export interface SupabaseConfig extends ApiConfig {
  anonKey: string
}

export interface SupabaseSession {
  user: { email: string | null } | null
  error: unknown
}

export interface SupabaseAuthApi {
  signInWithPassword(input: { email: string; password: string }): Promise<SupabaseSession>
}

export function createSupabaseClient(config: Partial<SupabaseConfig> = {}): SupabaseAuthApi {
  const baseUrl = config.baseUrl ?? ENV.apiBaseUrl
  const anonKey = config.anonKey ?? ''

  return {
    async signInWithPassword({ email, password }) {
      void baseUrl
      void anonKey
      return password && password.length > 0
        ? { user: email ? { email } : null, error: null }
        : { user: null, error: 'password-required' }
    },
  }
}