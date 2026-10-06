import axios from 'axios'
import { ENV } from '@/config/env'
import { useAdminStore, useAuthStore, useVendorStore } from '@/store/appStore'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _skipLogoutOn401?: boolean
  }
}

const BASE_URL = ENV.apiBaseUrl

if (!BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Define it in your .env file (see .env.example) before starting the app.',
  )
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
})

function getActiveToken(): string | null {
  return (
    useAuthStore.getState().session?.token ||
    useVendorStore.getState().session?.token ||
    useAdminStore.getState().session?.token ||
    null
  )
}

function logoutEverySession(): void {
  useAuthStore.getState().logout()
  useVendorStore.getState().logout()
  useAdminStore.getState().logout()
}

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers ?? {}
    const headers = config.headers as Record<string, string>

    // Only force JSON when the body isn't FormData — a hardcoded
    // "application/json" here would make axios silently JSON-stringify
    // FormData uploads instead of sending them as real multipart requests,
    // dropping any attached files with no error.
    if (!(config.data instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    // Services that pass an explicit token keep it; everything else falls back
    // to whichever portal session is active.
    if (!headers.Authorization) {
      const token = getActiveToken()
      if (token) headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

function loginPathFor(pathname: string): string {
  if (pathname.startsWith('/vendor')) return '/vendor/login'
  if (pathname.startsWith('/shop')) return '/shop/login'
  return '/login'
}

const AUTH_ENTRY_POINTS = ['/auth/login', '/auth/register', '/auth/reset-password']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config as { url?: string; _skipLogoutOn401?: boolean } | undefined
    const url = config?.url ?? ''
    const isAuthEntryPoint = AUTH_ENTRY_POINTS.some((path) => url.includes(path))

    if (error.response?.status === 401 && !config?._skipLogoutOn401 && !isAuthEntryPoint) {
      logoutEverySession()
      const target = loginPathFor(window.location.pathname)
      if (window.location.pathname !== target) window.location.href = target
    }

    return Promise.reject(error)
  },
)

export { api as axiosInstance }
export default api
