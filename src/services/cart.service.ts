import { apiRequest } from '@/services/http'
import { coverImage } from '@/services/catalog.service'

export interface CartProductRef {
  _id: string
  name: string
  slug: string
  images: string[]
}

export interface CartVariantRef {
  _id: string
  sku: string
  size: string
  color: string
  images: string[]
  stock: number
  customerSellingPrice: number
  vendorDiscountPercent?: number
}

export interface CartVendorRef {
  _id: string
  businessName: string
}

export interface CartItem {
  _id: string
  productId: CartProductRef
  variantId: CartVariantRef
  vendorId: CartVendorRef
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
}

export interface ApiCart {
  _id: string
  customerId: string
  items: CartItem[]
  subtotal: number
  shippingAmount: number
  taxAmount: number
  discountAmount: number
  grandTotal: number
  createdAt: string
  updatedAt: string
}

export interface AddToCartInput {
  productId: string
  variantId: string
  quantity: number
}

export function cartItemCount(cart: ApiCart | undefined): number {
  return (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
}

export function cartItemImage(item: CartItem): string {
  return coverImage(item.variantId.images || item.productId.images)
}

export function cartItemLabel(item: CartItem): string {
  const parts = [item.variantId.size, item.variantId.color].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : item.variantId.sku
}

/**
 * Vendor discount for a cart line. Prefers the amount the cart stored on the line,
 * and falls back to the variant's `vendorDiscountPercent` when the cart omits it.
 */
export function cartItemOffPercent(item: CartItem): number {
  const off = item.discount ?? 0
  if (off > 0) {
    const mrp = (item.unitPrice ?? 0) + off
    if (mrp > 0) return Math.max(0, Math.min(100, Math.round((off / mrp) * 100)))
  }
  const pct = item.variantId?.vendorDiscountPercent ?? 0
  return pct > 0 && pct < 100 ? Math.round(pct) : 0
}

/** Per-unit MRP, derived the same way as the product page so the figures agree. */
export function cartItemMrp(item: CartItem): number {
  const unitPrice = item.unitPrice ?? 0
  const off = item.discount ?? 0
  if (off > 0) return unitPrice + off
  const pct = item.variantId?.vendorDiscountPercent ?? 0
  return pct > 0 && pct < 100 ? Math.round(unitPrice / (1 - pct / 100)) : unitPrice
}

/** Rupees saved on this line at the current quantity, using the same MRP the item shows. */
export function cartItemSaved(item: CartItem): number {
  return Math.max(0, (cartItemMrp(item) - (item.unitPrice ?? 0)) * (item.quantity ?? 0))
}

export async function getCart(token: string): Promise<ApiCart> {
  return apiRequest<ApiCart>({ method: 'GET', url: '/getcart', token })
}

export async function addToCart(token: string, input: AddToCartInput): Promise<ApiCart> {
  return apiRequest<ApiCart>({ method: 'POST', url: '/addCart', data: input, token })
}

export async function updateCartQuantity(
  token: string,
  itemId: string,
  quantity: number,
): Promise<ApiCart> {
  return apiRequest<ApiCart>({
    method: 'PUT',
    url: `/updatecart/${itemId}`,
    data: { quantity },
    token,
  })
}

export async function removeFromCart(token: string, itemId: string): Promise<ApiCart> {
  return apiRequest<ApiCart>({ method: 'DELETE', url: `/removefromcart/${itemId}`, token })
}

export async function clearCart(token: string): Promise<ApiCart> {
  return apiRequest<ApiCart>({ method: 'DELETE', url: '/clearCart', token })
}