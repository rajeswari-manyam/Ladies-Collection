export interface AppEnv {
  apiBaseUrl: string
  appName: string
}

const raw = import.meta.env as Record<string, string | undefined>

export const ENV: AppEnv = {
  apiBaseUrl: raw.VITE_API_BASE_URL ?? '',
  appName: raw.VITE_APP_NAME ?? 'Ladies Collection',
}

export const APP_CONFIG = {
  name: ENV.appName,
  currency: 'INR',
  currencySymbol: '₹',
} as const