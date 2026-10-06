import type { Order } from '@/services/order.service'
import { orderItemDiscount } from '@/services/order.service'
import type { VendorOrder, VendorOrderItem } from '@/features/vendor/data/vendor-portal'
import type { OrderStatus, PaymentStatus } from '@/types'

/** API order/payment statuses mapped onto the portal's badge vocabulary. */
const STATUS_MAP: Record<string, OrderStatus> = {
  placed: 'pending',
  payment_confirmed: 'processing',
  confirmed: 'processing',
  processing: 'processing',
  packed: 'processing',
  shipped: 'shipped',
  'in-transit': 'shipped',
  'out-for-delivery': 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  refunded: 'refunded',
}

const PAYMENT_MAP: Record<string, PaymentStatus> = {
  pending: 'pending',
  confirmed: 'captured',
  paid: 'captured',
  failed: 'failed',
  refunded: 'refunded',
}

export function toPortalOrderStatus(status: string): OrderStatus {
  return STATUS_MAP[status] ?? 'pending'
}

/**
 * Portal status back to a value the order API accepts. Verified against
 * `PUT /updateorder/:id/status` — the API rejects anything outside this set with
 * a 400. Note it has no `shipped` or `out_for_delivery` status, and uses
 * snake_case throughout.
 */
const API_STATUS: Record<string, string> = {
  pending: 'placed',
  processing: 'processing',
  shipped: 'in_transit',
  delivered: 'delivered',
  cancelled: 'cancelled',
  refunded: 'refunded',
}

/** The only values the API accepts for `orderStatus`. */
export const API_ORDER_STATUSES = [
  'placed',
  'payment_confirmed',
  'processing',
  'in_transit',
  'delivered',
  'cancelled',
  'refunded',
] as const

export function toApiOrderStatus(status: string): string {
  const mapped = API_STATUS[status]
  if (mapped) return mapped
  // Portal labels are hyphenated while the API is snake_case.
  return status.replace(/-/g, '_')
}

export function toPortalPaymentStatus(status: string): PaymentStatus {
  return PAYMENT_MAP[status] ?? 'pending'
}

/** Adapts the API order to the `VendorOrder` shape the vendor pages already render. */
export function toVendorOrder(order: Order): VendorOrder {
  const items: VendorOrderItem[] = (order.items ?? []).map((item) => ({
    productId: item.productId,
    productName: item.productName,
    variantName: item.sku,
    quantity: item.quantity,
    unitPrice: item.customerUnitPrice,
    vendorId: item.vendorId,
  }))

  return {
    id: order._id,
    orderNumber: order.orderNumber,
    customer: order.shippingAddress?.fullName ?? '',
    city: order.shippingAddress?.city ?? '',
    items,
    subtotal: order.subtotal,
    discount: order.discountAmount,
    shipping: order.shippingAmount,
    tax: order.taxAmount,
    total: order.grandTotal,
    status: toPortalOrderStatus(order.orderStatus),
    apiStatus: order.orderStatus,
    paymentStatus: toPortalPaymentStatus(order.paymentStatus),
    paymentMethod: toPortalPaymentStatus(order.paymentStatus) === 'captured' ? 'Online' : 'Pending',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

/** Total vendor discount across the order's lines, from the stored pricing breakdown. */
export function vendorOrderDiscount(order: Order): number {
  return (order.items ?? []).reduce((sum, item) => sum + orderItemDiscount(item).amount * (item.quantity ?? 1), 0)
}
