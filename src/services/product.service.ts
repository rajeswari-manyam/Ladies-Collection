import { apiRequest } from '@/services/http'

export type ProductApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApiProductRef {
  _id: string
  name?: string
  businessName?: string
  slug?: string
}

export interface ApiProduct {
  _id: string
  vendorId: string | ApiProductRef
  categoryId: string | ApiProductRef
  subCategoryId: string | ApiProductRef
  name: string
  slug: string
  description: string
  specifications: Record<string, string>
  images: string[]
  brand: string
  status: string
  approvalStatus: ProductApprovalStatus | string
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductInput {
  categoryId: string
  subCategoryId?: string
  name: string
  slug?: string
  description?: string
  specifications?: Record<string, string>
  images?: string[]
  brand?: string
}

export type UpdateProductInput = Partial<
  Pick<CreateProductInput, 'name' | 'slug' | 'description' | 'specifications' | 'images' | 'brand'>
>

export interface ProductQuery {
  page?: number
  limit?: number
  categoryId?: string
  approvalStatus?: string
}

export interface PaginatedProducts {
  products: ApiProduct[]
  total: number
  page: number
  totalPages: number
}

function productQueryString(query: ProductQuery): string {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.categoryId) params.set('categoryId', query.categoryId)
  if (query.approvalStatus) params.set('approvalStatus', query.approvalStatus)
  return params.toString()
}

export function productRefId(ref: string | ApiProductRef | undefined): string {
  if (!ref) return ''
  return typeof ref === 'string' ? ref : ref._id ?? ''
}

export function productRefName(ref: string | ApiProductRef | undefined): string {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  return ref.businessName ?? ref.name ?? ''
}

export function createProduct(token: string, input: CreateProductInput): Promise<ApiProduct> {
  return apiRequest<ApiProduct>({ method: 'POST', url: '/createproduct', data: input, token })
}

export function getAllProducts(query: ProductQuery = {}): Promise<PaginatedProducts> {
  const qs = productQueryString(query)
  return apiRequest<PaginatedProducts>({
    method: 'GET',
    url: qs ? `/getallproduct?${qs}` : '/getallproduct',
  })
}

export function getProductById(id: string): Promise<ApiProduct> {
  return apiRequest<ApiProduct>({ method: 'GET', url: `/getproductproductById/${id}` })
}

export function getVendorProducts(token: string, query: ProductQuery = {}): Promise<PaginatedProducts> {
  const qs = productQueryString(query)
  return apiRequest<PaginatedProducts>({
    method: 'GET',
    url: qs ? `/getvendorproducts?${qs}` : '/getvendorproducts',
    token,
  })
}

export function getAllAdminProducts(token: string, query: ProductQuery = {}): Promise<PaginatedProducts> {
  const qs = productQueryString(query)
  return apiRequest<PaginatedProducts>({
    method: 'GET',
    url: qs ? `/getalladminproducts?${qs}` : '/getalladminproducts',
    token,
  })
}

export function updateProduct(token: string, id: string, input: UpdateProductInput): Promise<ApiProduct> {
  return apiRequest<ApiProduct>({ method: 'PUT', url: `/updateproduct/${id}`, data: input, token })
}

export function updateProductStatus(token: string, id: string, status: string): Promise<ApiProduct> {
  return apiRequest<ApiProduct>({ method: 'PUT', url: `/updateproductstatus/${id}`, data: { status }, token })
}

export function approveProduct(token: string, id: string): Promise<ApiProduct> {
  return apiRequest<ApiProduct>({ method: 'PUT', url: `/approveproduct/${id}`, token })
}

export function rejectProduct(token: string, id: string): Promise<ApiProduct> {
  return apiRequest<ApiProduct>({ method: 'PUT', url: `/rejectproduct/${id}/reject`, token })
}

export function deleteProduct(token: string, id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({ method: 'DELETE', url: `/deleteproduct/${id}`, token })
}