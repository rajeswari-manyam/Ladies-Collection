import type { Order } from '@/services/order.service'
import { orderItemDiscount } from '@/services/order.service'
import { toPortalOrderStatus, toPortalPaymentStatus } from '@/features/vendor/orders/adapter'
import type { Order as AdminOrder, OrderItem as AdminOrderItem } from '@/types'

/** Adapts the API order to the `Order` shape the admin pages already render. */
export function toAdminOrder(order: Order): AdminOrder {
  const items: AdminOrderItem[] = (order.items ?? []).map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    variantName: item.sku,
    quantity: item.quantity,
    unitPrice: item.customerUnitPrice,
  }))

  const paymentStatus = toPortalPaymentStatus(order.paymentStatus)

  return {
    id: order._id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    vendorId: order.vendorMappings?.[0]?.vendorId ?? order.items?.[0]?.vendorId ?? '',
    items,
    subtotal: order.subtotal,
    discount: order.discountAmount,
    shipping: order.shippingAmount,
    tax: order.taxAmount,
    total: order.grandTotal,
    status: toPortalOrderStatus(order.orderStatus),
    paymentStatus,
    paymentMethod: paymentStatus === 'captured' ? 'Online' : 'Pending',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    city: order.shippingAddress?.city ?? '',
  }
}

/**
 * Total customer discount across the order's lines. The API's order-level
 * `discountAmount` is unreliable (it is 10% on older orders and 0 on newer
 * ones), so this reads the per-line `pricing` breakdown instead.
 */
export function adminOrderLineDiscount(order: Order): number {
  return (order.items ?? []).reduce((sum, item) => sum + orderItemDiscount(item).amount * (item.quantity ?? 1), 0)
}
