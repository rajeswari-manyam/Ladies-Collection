import { apiRequest } from '@/services/http'

export interface ApiVariantProductRef {
  _id: string
  name?: string
  slug?: string
  images?: string[]
}

export interface ApiProductVariant {
  _id: string
  productId: string | ApiVariantProductRef
  sku: string
  size: string
  color: string
  material: string
  design: string
  attributes: Record<string, string>
  images: string[]
  stock: number
  lowStockThreshold: number
  vendorBasePrice: number
  vendorDiscountPercent: number
  vendorNetPrice: number
  adminAdditionalPercent: number
  customerSellingPrice: number
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateVariantInput {
  productId: string
  sku: string
  size?: string
  color?: string
  material?: string
  design?: string
  attributes?: Record<string, string>
  images?: string[]
  stock?: number
  lowStockThreshold?: number
  vendorBasePrice: number
  vendorDiscountPercent?: number
  adminAdditionalPercent?: number
}

export type UpdateVariantInput = Partial<
  Pick<
    CreateVariantInput,
    | 'sku'
    | 'size'
    | 'color'
    | 'material'
    | 'design'
    | 'attributes'
    | 'images'
    | 'stock'
    | 'lowStockThreshold'
    | 'vendorBasePrice'
    | 'vendorDiscountPercent'
    | 'adminAdditionalPercent'
  >
>

export function variantRefId(ref: string | ApiVariantProductRef | undefined): string {
  if (!ref) return ''
  return typeof ref === 'string' ? ref : ref._id ?? ''
}

export function variantRefName(ref: string | ApiVariantProductRef | undefined): string {
  if (!ref) return ''
  return typeof ref === 'string' ? ref : ref.name ?? ''
}

export function variantName(variant: Pick<ApiProductVariant, 'color' | 'size' | 'material' | 'sku'>): string {
  const parts = [variant.color, variant.size, variant.material].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : variant.sku
}

export function createVariant(token: string, input: CreateVariantInput): Promise<ApiProductVariant> {
  return apiRequest<ApiProductVariant>({ method: 'POST', url: '/createvariant', data: input, token })
}

export function getVariants(token?: string, productId?: string): Promise<ApiProductVariant[]> {
  const qs = productId ? `?productId=${encodeURIComponent(productId)}` : ''
  return apiRequest<ApiProductVariant[]>({ method: 'GET', url: `/getvariants${qs}`, token })
}

export function getVariantById(id: string): Promise<ApiProductVariant> {
  return apiRequest<ApiProductVariant>({ method: 'GET', url: `/getvariantById/${id}` })
}

export function updateVariant(token: string, id: string, input: UpdateVariantInput): Promise<ApiProductVariant> {
  return apiRequest<ApiProductVariant>({ method: 'PUT', url: `/updatevariant/${id}`, data: input, token })
}

export function updateVariantStock(token: string, id: string, stock: number): Promise<ApiProductVariant> {
  return apiRequest<ApiProductVariant>({ method: 'PUT', url: `/updatevariantstock/${id}`, data: { stock }, token })
}

export function deleteVariant(token: string, id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({ method: 'DELETE', url: `/deletevariant/${id}`, token })
}