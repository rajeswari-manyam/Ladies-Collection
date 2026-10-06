import axios, { type AxiosRequestConfig } from 'axios'
import { api as http } from '@/config/axios'
import { ENV } from '@/config/env'

export const API_BASE_URL = ENV.apiBaseUrl

export interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
}

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  data?: unknown
  token?: string
  /**
   * Set false for endpoints that put extra fields alongside `data` (e.g.
   * `provider` on create-shipment, `courier` on shippingpickup). Defaults to
   * returning just the unwrapped `data` payload.
   */
  unwrap?: boolean
}

export function toApiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { success?: boolean; message?: string; error?: string } | undefined
    const fromBody = body?.message || body?.error
    if (fromBody) return new Error(fromBody)
    const status = err.response?.status
    if (status) return new Error(`Request failed (${status})`)
    return new Error(err.message || 'Something went wrong')
  }
  return err instanceof Error ? err : new Error('Something went wrong')
}

export async function apiRequest<T>({ method, url, data, token, unwrap = true }: HttpRequestOptions): Promise<T> {
  const config: AxiosRequestConfig = {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }

  try {
    const response = await (method === 'GET'
      ? http.get<ApiEnvelope<T>>(url, config)
      : method === 'POST'
        ? http.post<ApiEnvelope<T>>(url, data, config)
        : method === 'PUT'
          ? http.put<ApiEnvelope<T>>(url, data, config)
          : method === 'PATCH'
            ? http.patch<ApiEnvelope<T>>(url, data, config)
            : http.delete<ApiEnvelope<T>>(url, { ...config, data }))

    const body = response.data as unknown as ApiEnvelope<T>
    if (body && typeof body === 'object' && 'success' in body && body.success === false) {
      throw new Error(body.message ?? 'Request failed')
    }
    return (unwrap ? body?.data ?? body : body) as T
  } catch (err) {
    throw toApiError(err)
  }
}
