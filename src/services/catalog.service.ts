import { apiRequest } from '@/services/http'

// ─── API types (public storefront endpoints) ───

export interface ApiCategoryRef {
  _id: string
  name: string
  slug: string
}

export interface ApiVendorRef {
  _id: string
  businessName: string
}

export interface ApiCategory {
  _id: string
  name: string
  slug: string
  description: string
  accentColor: string
  isFeatured: boolean
  createdAt: string
}

export interface ApiSubCategory {
  _id: string
  categoryId: string
  name: string
}

export interface ApiProduct {
  _id: string
  name: string
  slug: string
  description: string
  specifications: Record<string, unknown> | null
  images: string[]
  brand: string
  status: 'draft' | 'active' | 'inactive'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  categoryId: ApiCategoryRef | string | null
  subCategoryId: ApiCategoryRef | string | null
  vendorId: ApiVendorRef | string
  createdAt: string
  updatedAt: string
}

export interface ApiVariant {
  _id: string
  productId: string | ApiCategoryRef
  sku: string
  size: string
  color: string
  material: string
  design: string
  attributes: Record<string, unknown>
  images: string[]
  stock: number
  lowStockThreshold: number
  vendorBasePrice: number
  vendorDiscountPercent: number
  vendorNetPrice: number
  adminAdditionalPercent: number
  customerSellingPrice: number
  status: 'active' | 'inactive' | 'blocked'
  createdAt: string
}

export interface PublicProductsResult {
  products: ApiProduct[]
  total: number
  page: number
  totalPages: number
}

export type ApiProductDetail = ApiProduct & { variants: ApiVariant[] }

// ─── Derived catalog types ───

export interface CatalogVariantOption {
  variantId: string
  sku: string
  size: string
  color: string
  images: string[]
  stock: number
  price: number
  offPercent: number
  /** Vendor's price before their own discount. */
  basePrice: number
  /** Amount the vendor knocked off, i.e. basePrice - vendorNetPrice. */
  discountAmount: number
}

export interface CatalogProduct {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  brand: string
  categoryId: string | null
  categoryName: string
  vendorId: string
  vendorName: string
  price: number
  mrp: number
  offPercent: number
  /** Vendor's price before their own discount — the "original amount". */
  basePrice: number
  discountAmount: number
  stock: number
  colors: string[]
  variants: CatalogVariantOption[]
  createdAt: string
}

// ─── Reference helpers ───

export function variantRefId(productId: string | ApiCategoryRef, fallback = ''): string {
  return typeof productId === 'string' ? productId : productId?._id ?? fallback
}

export function variantRefName(productId: string | ApiCategoryRef, fallback = ''): string {
  return typeof productId === 'object' ? productId?.name ?? fallback : ''
}

export function coverImage(images: string[] | undefined): string {
  return images?.find((img) => img && img.trim().length > 0) ?? ''
}

export function hueOf(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(hash) % 360
}

export function hueFromHex(hex: string, fallback = 336): number {
  const value = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(value)) return fallback
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return fallback
  let h: number
  if (max === r) h = ((g - b) / delta) % 6
  else if (max === g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4
  h = Math.round(h * 60)
  return h < 0 ? h + 360 : h
}

const NAMED_COLORS = new Set([
  'black', 'white', 'red', 'green', 'blue', 'yellow', 'pink', 'purple', 'orange', 'brown',
  'maroon', 'navy', 'grey', 'gray', 'gold', 'silver', 'beige', 'ivory', 'cream', 'olive',
  'teal', 'cyan', 'magenta', 'crimson', 'rose', 'sky', 'lime', 'indigo', 'violet', 'turquoise',
])

export function colorSwatch(color: string): string {
  const value = color.trim().toLowerCase()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value
  if (NAMED_COLORS.has(value)) return value
  return `hsl(${hueOf(value)} 58% 52%)`
}

// ─── Builders ───

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function toCatalogProduct(
  product: ApiProduct,
  variants: ApiVariant[],
  labels: { categoryName?: string; vendorName?: string } = {},
): CatalogProduct {
  const active = variants
    .filter((v) => v.status === 'active')
    .map((v) => ({
      variantId: v._id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      images: v.images ?? [],
      stock: v.stock ?? 0,
      price: v.customerSellingPrice ?? 0,
      offPercent: Math.max(0, v.vendorDiscountPercent ?? 0),
      basePrice: v.vendorBasePrice ?? 0,
      discountAmount:
        v.vendorBasePrice != null && v.vendorNetPrice != null
          ? Math.max(0, round2(v.vendorBasePrice - v.vendorNetPrice))
          : 0,
    }))

  const cheapest = [...active].sort((a, b) => a.price - b.price)[0]
  const price = cheapest?.price ?? 0
  const offPercent = cheapest?.offPercent ?? 0
  const basePrice = cheapest?.basePrice ?? price
  const discountAmount = cheapest?.discountAmount ?? 0
  const mrp = basePrice > 0 ? basePrice : price

  const colors = Array.from(new Set(active.map((v) => v.color).filter(Boolean)))

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    images: product.images ?? [],
    brand: product.brand,
    categoryId: typeof product.categoryId === 'object' ? product.categoryId?._id ?? null : product.categoryId ?? null,
    categoryName:
      labels.categoryName ??
      (typeof product.categoryId === 'object' ? product.categoryId?.name ?? '' : ''),
    vendorId: typeof product.vendorId === 'object' ? product.vendorId._id : product.vendorId,
    vendorName:
      labels.vendorName ??
      (typeof product.vendorId === 'object' ? product.vendorId.businessName ?? '' : ''),
    price,
    mrp,
    offPercent,
    basePrice,
    discountAmount,
    stock: active.reduce((sum, v) => sum + v.stock, 0),
    colors,
    variants: active,
    createdAt: product.createdAt,
  }
}

// ─── API functions ───

export async function fetchPublicCategories(): Promise<ApiCategory[]> {
  const data = await apiRequest<ApiCategory[]>({ method: 'GET', url: '/getallcategories' })
  return Array.isArray(data) ? data : []
}

export async function fetchPublicSubCategories(): Promise<ApiSubCategory[]> {
  const data = await apiRequest<ApiSubCategory[]>({ method: 'GET', url: '/getallsubcategories' })
  return Array.isArray(data) ? data : []
}

export async function fetchPublicProducts(): Promise<PublicProductsResult> {
  return apiRequest<PublicProductsResult>({
    method: 'GET',
    url: '/getallproduct?limit=200',
  })
}

export async function fetchPublicVariants(): Promise<ApiVariant[]> {
  const data = await apiRequest<ApiVariant[]>({ method: 'GET', url: '/getvariants' })
  return Array.isArray(data) ? data : []
}

export async function fetchPublicProduct(id: string): Promise<ApiProductDetail> {
  return apiRequest<ApiProductDetail>({ method: 'GET', url: `/getproductproductById/${id}` })
}

export async function loadCatalog(): Promise<CatalogProduct[]> {
  const [{ products }, variants] = await Promise.all([fetchPublicProducts(), fetchPublicVariants()])
  const byProduct = new Map<string, ApiVariant[]>()
  for (const variant of variants) {
    const key = variantRefId(variant.productId)
    if (!key) continue
    const bucket = byProduct.get(key) ?? []
    bucket.push(variant)
    byProduct.set(key, bucket)
  }
  return products.map((product) =>
    toCatalogProduct(product, byProduct.get(product._id) ?? []),
  )
}