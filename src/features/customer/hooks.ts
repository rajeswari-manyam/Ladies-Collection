import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/appStore'
import {
  addToCart,
  cartItemCount,
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  type AddToCartInput,
  type ApiCart,
} from '@/services/cart.service'
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
  type ApiAddress,
  type CreateAddressInput,
  type UpdateAddressInput,
} from '@/services/address.service'
import {
  fetchPublicCategories,
  fetchPublicProduct,
  fetchPublicSubCategories,
  loadCatalog,
  type ApiCategory,
  type ApiProductDetail,
  type ApiSubCategory,
  type CatalogProduct,
} from '@/services/catalog.service'
import {
  cancelOrder,
  getAllOrders,
  getOrder,
  type Order,
  type PaginatedOrders,
} from '@/services/order.service'
import { createPaymentOrder, getCustomerPayments, getPaymentById, getPaymentStatus, isMockMode, verifyPayment } from '@/services/payment.service'
import type { PaymentRecord } from '@/services/payment.service'
import { getCustomerRefunds, getRefundById, getRefundsByOrder, type Refund } from '@/services/refund.service'
import {
  cancelOrderWithReason,
  getCancellationPreview,
  getOrderReturns,
  getReturnableItems,
  requestReturn,
  type CancellationPreview,
  type RequestCancellationInput,
  type RequestReturnInput,
  type ReturnRequest,
} from '@/services/return.service'
import {
  getShipmentsByOrder,
  trackByAwb,
  type Shipment,
  type TrackingResponse,
} from '@/services/shipment.service'
import type {
  PaginatedResult,
  ReturnEligibilityResponse,
} from '@/types/finance.types'
import type { Payment, PaymentQuery } from '@/services/payment.service'
import type { RefundQuery } from '@/services/refund.service'

export const CART_KEY = ['customer', 'cart'] as const
export const CATALOG_KEY = ['customer', 'catalog'] as const
export const CATEGORIES_KEY = ['customer', 'categories'] as const
export const SUBCATEGORIES_KEY = ['customer', 'subcategories'] as const
export const ADDRESSES_KEY = ['customer', 'addresses'] as const
export const ORDERS_KEY = ['customer', 'orders'] as const
export const PAYMENTS_KEY = ['customer', 'payments'] as const
export const REFUNDS_KEY = ['customer', 'refunds'] as const
export const RETURNS_KEY = ['customer', 'returns'] as const

function useCustomerToken(): string | null {
  return useAuthStore((s) => s.session?.token ?? null)
}

// ─── Live catalog ───

export function useLiveCategories() {
  return useQuery<ApiCategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchPublicCategories,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLiveSubCategories() {
  return useQuery<ApiSubCategory[]>({
    queryKey: SUBCATEGORIES_KEY,
    queryFn: fetchPublicSubCategories,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCatalog() {
  return useQuery<CatalogProduct[]>({
    queryKey: CATALOG_KEY,
    queryFn: loadCatalog,
  })
}

export function useCatalogProduct(id?: string) {
  return useQuery<ApiProductDetail>({
    queryKey: ['customer', 'product', id],
    queryFn: () => fetchPublicProduct(id!),
    enabled: Boolean(id),
  })
}

// ─── Server cart ───

export function useCart() {
  const token = useCustomerToken()
  return useQuery<ApiCart>({
    queryKey: CART_KEY,
    queryFn: () => getCart(token!),
    enabled: Boolean(token),
  })
}

export function useCartItemCount(): number {
  const token = useCustomerToken()
  const { data } = useCart()
  return token ? cartItemCount(data) : 0
}

export function useAddToCart() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiCart, Error, AddToCartInput>({
    mutationFn: (input) => addToCart(token!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useUpdateCartQuantity() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiCart, Error, { itemId: string; quantity: number }>({
    mutationFn: ({ itemId, quantity }) => updateCartQuantity(token!, itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useRemoveFromCart() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiCart, Error, string>({
    mutationFn: (itemId) => removeFromCart(token!, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useClearCart() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiCart, Error, void>({
    mutationFn: () => clearCart(token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

// ─── Address book ───

export function useAddresses() {
  const token = useCustomerToken()
  return useQuery<ApiAddress[]>({
    queryKey: ADDRESSES_KEY,
    queryFn: () => getAddresses(token!),
    enabled: Boolean(token),
  })
}

export function useCreateAddress() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiAddress, Error, CreateAddressInput>({
    mutationFn: (input) => createAddress(token!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useUpdateAddress() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiAddress, Error, { id: string; patch: UpdateAddressInput }>({
    mutationFn: ({ id, patch }) => updateAddress(token!, id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useDeleteAddress() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiAddress, Error, string>({
    mutationFn: (id) => deleteAddress(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useSetDefaultAddress() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ApiAddress, Error, string>({
    mutationFn: (id) => setDefaultAddress(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

// ─── Orders ───

export function useOrders(page = 1) {
  const token = useCustomerToken()
  return useQuery<PaginatedOrders>({
    queryKey: ORDERS_KEY,
    queryFn: () => getAllOrders(token!, page),
    enabled: Boolean(token),
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id?: string) {
  const token = useCustomerToken()
  return useQuery<Order>({
    queryKey: ['customer', 'order', id],
    queryFn: () => getOrder(token!, id!),
    enabled: Boolean(token && id),
  })
}

export function useCancelOrder() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<Order, Error, string>({
    mutationFn: (orderId) => cancelOrder(token!, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['customer', 'order'] })
    },
  })
}

/** Pays an already-placed order: creates the payment then verifies it. */export function usePayOrder() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<Order, Error, string>({
    mutationFn: async (orderId) => {
      const payment = await createPaymentOrder(token!, orderId)
      if (!isMockMode(payment) || !payment.mockPayment) {
        throw new Error('Online payment is unavailable right now')
      }
      const verified = await verifyPayment(token!, {
        orderId,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.mockPayment.razorpayPaymentId,
        razorpaySignature: payment.mockPayment.razorpaySignature,
      })
      return verified.order
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['customer', 'order'] })
    },
  })
}

// ─── Shipments ───

export function useOrderShipments(orderId?: string) {
  const token = useCustomerToken()
  return useQuery<Shipment[]>({
    queryKey: ['customer', 'order-shipments', orderId],
    queryFn: () => getShipmentsByOrder(token!, orderId!),
    enabled: Boolean(token && orderId),
  })
}

/** Courier tracking lookup by AWB number. */
export function useTrackShipment(awb?: string | null) {
  const token = useCustomerToken()
  return useQuery<TrackingResponse>({
    queryKey: ['customer', 'tracking', awb],
    queryFn: () => trackByAwb(token!, awb!),
    enabled: Boolean(token && awb),
    retry: false,
  })
}

/**
 * Shipments for many orders at once, for the order list. The API only exposes
 * shipments per order, so this issues one request per id and tolerates
 * individual failures rather than blanking the whole list.
 */
export function useOrderShipmentsMap(orderIds: string[]) {
  const token = useCustomerToken()
  return useQuery<Record<string, Shipment[]>>({
    queryKey: ['customer', 'order-shipments-map', orderIds.join(',')],
    queryFn: async () => {
      const entries = await Promise.all(
        orderIds.map(async (id) => {
          try {
            return [id, await getShipmentsByOrder(token!, id)] as const
          } catch {
            return [id, [] as Shipment[]] as const
          }
        }),
      )
      return Object.fromEntries(entries)
    },
    enabled: Boolean(token) && orderIds.length > 0,
  })
}

// ─── Payments ───

export function useCustomerPayments(query: PaymentQuery = {}) {
  const token = useCustomerToken()
  return useQuery<PaginatedResult<Payment>>({
    queryKey: [...PAYMENTS_KEY, query],
    queryFn: () => getCustomerPayments(token!, query),
    enabled: Boolean(token),
    placeholderData: (prev) => prev,
  })
}

export function useCustomerPayment(paymentId?: string) {
  const token = useCustomerToken()
  return useQuery<Payment>({
    queryKey: ['customer', 'payment', paymentId],
    queryFn: () => getPaymentById(token!, paymentId!),
    enabled: Boolean(token && paymentId),
  })
}

/**
 * The order's payment record, from the existing `GET /payment/status/:orderId`.
 * It is the customer's source of truth for what was captured and how much has
 * already been refunded, so the order screen never has to work it out.
 */
export function useOrderPayment(orderId?: string) {
  const token = useCustomerToken()
  return useQuery<PaymentRecord>({
    queryKey: ['customer', 'order-payment', orderId],
    queryFn: () => getPaymentStatus(token!, orderId!),
    enabled: Boolean(token && orderId),
    retry: false,
  })
}

// ─── Refunds ───

export function useCustomerRefunds(query: RefundQuery = {}) {
  const token = useCustomerToken()
  return useQuery<PaginatedResult<Refund>>({
    queryKey: [...REFUNDS_KEY, query],
    queryFn: () => getCustomerRefunds(token!, query),
    enabled: Boolean(token),
    placeholderData: (prev) => prev,
  })
}

export function useCustomerRefund(refundId?: string) {
  const token = useCustomerToken()
  return useQuery<Refund>({
    queryKey: ['customer', 'refund', refundId],
    queryFn: () => getRefundById(token!, refundId!),
    enabled: Boolean(token && refundId),
  })
}

/** Refunds raised against one order, so the order screen can link to them. */
export function useOrderRefunds(orderId?: string) {
  const token = useCustomerToken()
  return useQuery<Refund[]>({
    queryKey: ['customer', 'order-refunds', orderId],
    queryFn: () => getRefundsByOrder(token!, orderId!),
    enabled: Boolean(token && orderId),
  })
}

// ─── Returns ───

/**
 * Which lines of this order can be returned, with the window and refund amount
 * the backend quotes. The return dialog renders these values unchanged.
 */
export function useReturnableItems(orderId?: string) {
  const token = useCustomerToken()
  return useQuery<ReturnEligibilityResponse>({
    queryKey: ['customer', 'returnable-items', orderId],
    queryFn: () => getReturnableItems(token!, orderId!),
    enabled: Boolean(token && orderId),
  })
}

export function useOrderReturns(orderId?: string) {
  const token = useCustomerToken()
  return useQuery<ReturnRequest[]>({
    queryKey: ['customer', 'order-returns', orderId],
    queryFn: () => getOrderReturns(token!, orderId!),
    enabled: Boolean(token && orderId),
  })
}

export function useRequestReturn() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<ReturnRequest, Error, { orderId: string; input: RequestReturnInput }>({
    mutationFn: ({ orderId, input }) => requestReturn(token!, orderId, input),
    onSuccess: (_record, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: [...RETURNS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['customer', 'order-returns', orderId] })
      queryClient.invalidateQueries({ queryKey: ['customer', 'returnable-items', orderId] })
      queryClient.invalidateQueries({ queryKey: ['customer', 'order-refunds', orderId] })
    },
  })
}

/** What cancelling this order would refund, per the backend. */
export function useCancellationPreview(orderId?: string) {
  const token = useCustomerToken()
  return useQuery<CancellationPreview>({
    queryKey: ['customer', 'cancellation-preview', orderId],
    queryFn: () => getCancellationPreview(token!, orderId!),
    enabled: Boolean(token && orderId),
    retry: false,
  })
}

/** Cancels the order and refreshes the order, payment, return and refund data. */
export function useCancelOrderWithReason() {
  const token = useCustomerToken()
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, { orderId: string; input: RequestCancellationInput }>({
    mutationFn: ({ orderId, input }) => cancelOrderWithReason(token!, orderId, input),
    onSuccess: (_record, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['customer', 'order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['customer', 'order-refunds', orderId] })
      queryClient.invalidateQueries({ queryKey: ['customer', 'order-returns', orderId] })
      queryClient.invalidateQueries({ queryKey: ['customer', 'cancellation-preview', orderId] })
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: REFUNDS_KEY })
    },
  })
}