export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'ok' | 'error'
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiConfig {
  baseUrl: string
  timeout: number
}

export interface ApiErrorPayload {
  code: string
  message: string
  status: number
}