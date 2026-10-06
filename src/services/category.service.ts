import { apiRequest } from '@/services/http'

export interface ApiCategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  accentColor?: string
  isFeatured?: boolean
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export interface CategoryInput {
  name: string
  slug?: string
  description?: string
  image?: string
  accentColor?: string
  isFeatured?: boolean
  sortOrder?: number
}

export interface CategoryQuery {
  page?: number
  limit?: number
}

export function createCategory(token: string, input: CategoryInput): Promise<ApiCategory> {
  return apiRequest<ApiCategory>({ method: 'POST', url: '/createcategory', data: input, token })
}

export function getAllCategories(query: CategoryQuery = {}): Promise<ApiCategory[]> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  const qs = params.toString()
  return apiRequest<ApiCategory[]>({ method: 'GET', url: qs ? `/getallcategories?${qs}` : '/getallcategories' })
}

export function getCategoryById(id: string): Promise<ApiCategory> {
  return apiRequest<ApiCategory>({ method: 'GET', url: `/getcategoryById/${id}` })
}

export function updateCategory(token: string, id: string, input: Partial<CategoryInput>): Promise<ApiCategory> {
  return apiRequest<ApiCategory>({ method: 'PUT', url: `/updatecategoryById/${id}`, data: input, token })
}

export function deleteCategory(token: string, id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({ method: 'DELETE', url: `/deletecategoryById/${id}`, token })
}