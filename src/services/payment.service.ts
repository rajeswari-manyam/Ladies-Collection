import { apiRequest } from '@/services/http'
import type { Order } from '@/services/order.service'
import type { DateRangeQuery, PaginatedResult } from '@/types/finance.types'

export interface MockPaymentDetails {
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface CreatePaymentResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  paymentId: string
  mode: string
  mockPayment: MockPaymentDetails | null
}

export interface VerifyPaymentInput {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponse {
  order: Order
}

export type PaymentRecordStatus = 'created' | 'authorized' | 'paid' | 'failed' | 'refunded'

export interface PaymentRecord {
  _id: string
  orderId: string
  customerId: string
  razorpayOrderId: string
  razorpayPaymentId: string | null
  razorpaySignature: string | null
  amount: number
  currency: string
  status: PaymentRecordStatus
  method: string | null
  refundAmount: number
  refundId: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

/** Creates the Razorpay order for an existing order. */
export async function createPaymentOrder(token: string, orderId: string): Promise<CreatePaymentResponse> {
  return apiRequest<CreatePaymentResponse>({
    method: 'POST',
    url: '/paymentcreate-order',
    data: { orderId },
    token,
  })
}

export async function verifyPayment(token: string, input: VerifyPaymentInput): Promise<VerifyPaymentResponse> {
  return apiRequest<VerifyPaymentResponse>({
    method: 'POST',
    url: '/payment/verify',
    data: input,
    token,
  })
}

export async function getPaymentStatus(token: string, orderId: string): Promise<PaymentRecord> {
  return apiRequest<PaymentRecord>({
    method: 'GET',
    url: `/payment/status/${orderId}`,
    token,
  })
}

export function isMockMode(payment: CreatePaymentResponse): boolean {
  return payment.mode === 'mock'
}

// ─── Payment history ───

/** Populated `orderId`, as it arrives on payment list endpoints. */
export interface PaymentOrderRef {
  _id: string
  orderNumber?: string | null
  /** Set when the caller is allowed to see the buyer (admin endpoints). */
  customerName?: string | null
  customerEmail?: string | null
}

export interface PaymentVendorRef {
  _id: string
  businessName?: string | null
}

/**
 * A payment as the history screens read it. Every field mirrors the backend:
 * `amount` is the amount the gateway captured and `refundAmount` is whatever
 * the API has already refunded. The client never derives one from the other.
 */
export interface Payment {
  _id: string
  /** Gateway-facing payment id (`paymentId` on the wire). */
  paymentId: string | null
  orderId: string | PaymentOrderRef
  vendorId?: string | PaymentVendorRef | null
  orderNumber: string | null
  orderDate: string | null
  paymentDate: string | null
  paymentMethod: string | null
  amountPaid: number
  paymentStatus: string
  /**
   * Net amount the customer ended up charged, when the API reports one. Left
   * null rather than derived from the payment and refund figures.
   */
  finalAmount: number | null
  refundAmount: number | null
  refundStatus: string | null
  refundDate: string | null
  refundRequestedAt: string | null
  refundInitiatedAt: string | null
  /** Gateway/bank reference for the payout, when the API records one. */
  refundTransactionReference: string | null
  refundId: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentQuery extends DateRangeQuery {
  page?: number
  limit?: number
  orderNumber?: string
  paymentStatus?: string
  refundStatus?: string
}

function paymentQueryString(query: PaymentQuery = {}): string {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 20))
  if (query.orderNumber) params.set('orderNumber', query.orderNumber)
  if (query.paymentStatus) params.set('paymentStatus', query.paymentStatus)
  if (query.refundStatus) params.set('refundStatus', query.refundStatus)
  if (query.dateFrom) params.set('dateFrom', query.dateFrom)
  if (query.dateTo) params.set('dateTo', query.dateTo)
  return params.toString()
}

/** Narrows the API's list envelope, whichever key it used. */
function toPaymentList(body: unknown): PaginatedResult<Payment> {
  const source = (body ?? {}) as Record<string, unknown>
  const list =
    (Array.isArray(source) && source) ||
    (Array.isArray(source.payments) && source.payments) ||
    (Array.isArray(source.data) && source.data) ||
    []
  return {
    items: list as Payment[],
    total: typeof source.total === 'number' ? source.total : list.length,
    page: typeof source.page === 'number' ? source.page : 1,
    totalPages: typeof source.totalPages === 'number' ? source.totalPages : 1,
  }
}

/** Payment history for the signed-in customer. */
export async function getCustomerPayments(
  token: string,
  query: PaymentQuery = {},
): Promise<PaginatedResult<Payment>> {
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getcustomerpayments?${paymentQueryString(query)}`,
    token,
  }).then(toPaymentList)
}

/** Payment history across all customers, for the admin payments screen. */
export async function getAdminPayments(
  token: string,
  query: PaymentQuery = {},
): Promise<PaginatedResult<Payment>> {
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getallpayments?${paymentQueryString(query)}`,
    token,
  }).then(toPaymentList)
}

/** Full payment record for the payment details screen. */
export async function getPaymentById(token: string, paymentId: string): Promise<Payment> {
  return apiRequest<Payment>({
    method: 'GET',
    url: `/getpaymentById/${paymentId}`,
    token,
  })
}
