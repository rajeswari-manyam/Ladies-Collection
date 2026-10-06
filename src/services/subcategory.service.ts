import { apiRequest } from '@/services/http'

export interface ApiSubcategory {
  _id: string
  categoryId: string | { _id: string; name?: string; slug?: string }
  name: string
  slug?: string
  description?: string
  status?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export interface SubcategoryInput {
  categoryId: string
  name: string
  slug?: string
  description?: string
  sortOrder?: number
}

export interface SubcategoryQuery {
  categoryId?: string
  page?: number
  limit?: number
}

export interface PaginatedSubcategories {
  subCategories: ApiSubcategory[]
  total: number
  page: number
  totalPages: number
}

export function createSubcategory(token: string, input: SubcategoryInput): Promise<ApiSubcategory> {
  return apiRequest<ApiSubcategory>({ method: 'POST', url: '/createsubcategory', data: input, token })
}

export function getAllSubcategories(query: SubcategoryQuery = {}): Promise<PaginatedSubcategories> {
  const params = new URLSearchParams()
  if (query.categoryId) params.set('categoryId', query.categoryId)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  const qs = params.toString()
  return apiRequest<PaginatedSubcategories>({
    method: 'GET',
    url: qs ? `/getallsubcategories?${qs}` : '/getallsubcategories',
  })
}

export function getSubcategoryById(id: string): Promise<ApiSubcategory> {
  return apiRequest<ApiSubcategory>({ method: 'GET', url: `/getsubcategoryById/${id}` })
}

export function updateSubcategory(token: string, id: string, input: Partial<SubcategoryInput>): Promise<ApiSubcategory> {
  return apiRequest<ApiSubcategory>({ method: 'PUT', url: `/updatesubcategoryById/${id}`, data: input, token })
}

export function updateSubcategoryStatus(token: string, id: string, status: string): Promise<ApiSubcategory> {
  return apiRequest<ApiSubcategory>({ method: 'PUT', url: `/updatesubcategorystatus/${id}`, data: { status }, token })
}

export function deleteSubcategory(token: string, id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({ method: 'DELETE', url: `/deletesubcategoryById/${id}`, token })
}