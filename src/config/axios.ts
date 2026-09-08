export interface HttpRequestConfig {
  baseURL?: string
  headers?: Record<string, string>
}

export interface HttpResponse<T> {
  data: T
  status: number
  statusText: string
}

export interface HttpClient {
  baseURL: string
  headers: Record<string, string>
  request<T>(method: string, url: string, body?: unknown): Promise<HttpResponse<T>>
}

export function createHttpClient(baseURL: string, headers: Record<string, string> = {}): HttpClient {
  return {
    baseURL,
    headers,
    async request<T>(method: string, url: string, _body?: unknown): Promise<HttpResponse<T>> {
      throw new Error(`HttpAdapter not implemented — ${method.toUpperCase()} ${url}`)
    },
  }
}