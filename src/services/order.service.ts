import { apiRequest } from '@/services/http'

export interface OrderAddress {
  fullName: string
  mobile: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  pincode: string
  landmark: string
}

export interface OrderItemPricing {
  vendorBasePrice: number
  vendorDiscountPercent: number
  vendorDiscountAmount: number
  priceAfterVendorDiscount: number
  vendorNetPrice: number
  adminAdditionalPercent: number
  adminAdditionalAmount: number
  priceAfterAdminAdditional: number
  shippingAmount: number
  includedShippingCharge: number
  customerSellingPrice: number
  additionalShippingCharge: number
  finalPrice: number
}

export interface OrderItem {
  _id: string
  productId: string
  variantId: string
  vendorId: string
  productName: string
  sku: string
  quantity: number
  vendorBasePrice: number
  vendorDiscount: number
  vendorNetPrice: number
  adminAdditionalPercent: number
  customerUnitPrice: number
  itemTotal: number
  settlementAmount: number
  /** Full per-line price breakdown as stored by the backend. */
  pricing?: OrderItemPricing
}

export interface OrderShippingBreakdownEntry {
  vendorId: string
  pickupPincode: string
  deliveryPincode: string
  distanceKm: number
  extraShippingCharge: number
  customerShippingStatus: string
}

export interface OrderShippingDetails {
  provider: string
  mode: string
  includedShippingCharge: number
  extraShippingCharge: number
  customerShippingStatus: string
  distanceKm: number
  totalDistanceKm: number
  breakdown: OrderShippingBreakdownEntry[]
}

export interface OrderVendorMapping {
  _id: string
  vendorId: string
  itemIds: string[]
  status: string
}

/**
 * Statuses the order API stores. `confirmed`, `packed` and `shipped` are legacy
 * values the API may still return, but the writable set is `placed`,
 * `payment_confirmed`, `processing`, `in_transit`, `delivered`, `cancelled`,
 * `refunded` — nothing else is accepted by `PUT /updateorder/:id/status`.
 */
export type OrderStatus =
  | 'placed'
  | 'payment_confirmed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'in_transit'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'
export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered'

export interface Order {
  _id: string
  orderNumber: string
  customerId: string
  billingAddress: OrderAddress
  shippingAddress: OrderAddress
  items: OrderItem[]
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  grandTotal: number
  shippingDetails: OrderShippingDetails
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  shipmentStatus: ShipmentStatus
  vendorMappings: OrderVendorMapping[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderInput {
  shippingAddressId: string
  billingAddressId: string
}

export interface PaginatedOrders {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

export interface UpdateOrderStatusInput {
  orderStatus: string
}

/**
 * Creates the order from the server-side cart, so item pricing is recomputed
 * by the backend rather than trusted from the client.
 */
export async function createOrder(token: string, input: CreateOrderInput): Promise<Order> {
  return apiRequest<Order>({ method: 'POST', url: '/createorder', data: input, token })
}

export async function getOrder(token: string, orderId: string): Promise<Order> {
  return apiRequest<Order>({ method: 'GET', url: `/getorder/${orderId}`, token })
}

export async function getOrderById(token: string, orderId: string): Promise<Order> {
  return apiRequest<Order>({ method: 'GET', url: `/getorderById/${orderId}`, token })
}

/** Paginated orders for the signed-in customer. */
export async function getAllOrders(
  token: string,
  page = 1,
  limit = 20,
): Promise<PaginatedOrders> {
  return apiRequest<PaginatedOrders>({
    method: 'GET',
    url: `/getallorder?page=${page}&limit=${limit}`,
    token,
  })
}

export async function getVendorOrders(
  token: string,
  page = 1,
  limit = 20,
): Promise<PaginatedOrders> {
  return apiRequest<PaginatedOrders>({
    method: 'GET',
    url: `/getvendororders?page=${page}&limit=${limit}`,
    token,
  })
}

export async function getAdminOrders(
  token: string,
  orderStatus?: string,
  page = 1,
  limit = 20,
): Promise<PaginatedOrders> {
  const status = orderStatus ? `?orderStatus=${orderStatus}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`
  return apiRequest<PaginatedOrders>({ method: 'GET', url: `/getadminorders${status}`, token })
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<Order> {
  return apiRequest<Order>({
    method: 'PUT',
    url: `/updateorder/${orderId}/status`,
    data: input,
    token,
  })
}

export async function cancelOrder(token: string, orderId: string): Promise<Order> {
  return apiRequest<Order>({ method: 'PUT', url: `/cancelorder/${orderId}`, token })
}

export interface ItemDiscount {
  /** Vendor's price before their own discount — the "original amount". */
  basePrice: number
  percent: number
  amount: number
}

/**
 * Discount shown to the customer for an order line. Prefers the backend's stored
 * `pricing` breakdown and falls back to the top-level snapshot fields.
 */
export function orderItemDiscount(item: OrderItem): ItemDiscount {
  const p = item.pricing
  if (p) {
    return {
      basePrice: p.vendorBasePrice ?? 0,
      percent: p.vendorDiscountPercent ?? 0,
      amount: p.vendorDiscountAmount ?? 0,
    }
  }
  const base = item.vendorBasePrice ?? 0
  const net = item.vendorNetPrice ?? 0
  return {
    basePrice: base,
    percent: item.vendorDiscount ?? 0,
    amount: base > net ? base - net : 0,
  }
}

/** Vendor discount amount on a line, i.e. base price less the net price. */
export function orderItemDiscountAmount(item: OrderItem): number {
  return orderItemDiscount(item).amount
}

export function orderItemCount(order: Order | undefined): number {
  return (order?.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}
