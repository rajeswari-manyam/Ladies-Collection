import { apiRequest } from '@/services/http'
import type { DateRangeQuery, PaginatedResult, RefundStatus } from '@/types/finance.types'

/** Populated order reference, as it arrives on refund list endpoints. */
export interface RefundOrderRef {
  _id: string
  orderNumber?: string | null
  orderDate?: string | null
}

export interface RefundPartyRef {
  _id: string
  name?: string | null
  businessName?: string | null
  email?: string | null
}

/** One refunded line, when the backend itemises a partial return. */
export interface RefundLine {
  _id?: string
  orderItemId: string | null
  productName: string
  quantity: number
  amount: number
}

export interface RefundImage {
  url: string
}

/**
 * A refund as the API stores it. `refundAmount`, the three lifecycle
 * timestamps and `refundReference` are all backend-owned: the client reads them
 * and never recomputes or back-fills any of them.
 */
export interface Refund {
  _id: string
  refundNumber: string | null
  orderId: string | RefundOrderRef
  orderNumber: string | null
  orderDate: string | null
  /** Full refund covers the whole order; partial refunds carry `items`. */
  type?: string | null
  isPartial?: boolean
  customerId?: string | RefundPartyRef | null
  customerName?: string | null
  vendorId?: string | RefundPartyRef | null
  vendorName?: string | null
  productName: string | null
  items: RefundLine[]
  quantity: number
  /** What the customer originally paid, as recorded by the payment. */
  originalPaymentAmount: number
  /** What the API refunds. Displayed verbatim, never derived. */
  refundAmount: number
  /** Net amount charged after the refund, when the API reports one. */
  finalAmount: number | null
  refundReason: string | null
  refundStatus: RefundStatus | string
  /** Payment fields the refund record carries, for the payment section. */
  paymentMethod: string | null
  paymentDate: string | null
  paymentStatus: string | null
  refundRequestedAt: string | null
  refundInitiatedAt: string | null
  refundCompletedAt: string | null
  refundDate: string | null
  /** Gateway/bank reference for the payout. */
  refundReference: string | null
  failureReason: string | null
  images: RefundImage[]
  returnId?: string | null
  createdAt: string
  updatedAt: string
}

export interface RefundQuery extends DateRangeQuery {
  page?: number
  limit?: number
  orderNumber?: string
  customer?: string
  vendor?: string
  refundStatus?: string
  paymentStatus?: string
}

export interface UpdateRefundStatusInput {
  refundStatus: string
  reason?: string
  refundReference?: string
}

function refundQueryString(query: RefundQuery = {}): string {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 20))
  if (query.orderNumber) params.set('orderNumber', query.orderNumber)
  if (query.customer) params.set('customer', query.customer)
  if (query.vendor) params.set('vendor', query.vendor)
  if (query.refundStatus) params.set('refundStatus', query.refundStatus)
  if (query.paymentStatus) params.set('paymentStatus', query.paymentStatus)
  if (query.dateFrom) params.set('dateFrom', query.dateFrom)
  if (query.dateTo) params.set('dateTo', query.dateTo)
  return params.toString()
}

function toRefundList(body: unknown): PaginatedResult<Refund> {
  const source = (body ?? {}) as Record<string, unknown>
  const list =
    (Array.isArray(source) && source) ||
    (Array.isArray(source.refunds) && source.refunds) ||
    (Array.isArray(source.data) && source.data) ||
    []
  return {
    items: list as Refund[],
    total: typeof source.total === 'number' ? source.total : list.length,
    page: typeof source.page === 'number' ? source.page : 1,
    totalPages: typeof source.totalPages === 'number' ? source.totalPages : 1,
  }
}

/** Refunds raised by the signed-in customer. */
export async function getCustomerRefunds(
  token: string,
  query: RefundQuery = {},
): Promise<PaginatedResult<Refund>> {
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getcustomerrefunds?${refundQueryString(query)}`,
    token,
  }).then(toRefundList)
}

/** Refunds for one order, so the order screen can link to the refund. */
export async function getRefundsByOrder(
  token: string,
  orderId: string,
): Promise<Refund[]> {
  const result = await apiRequest<unknown>({
    method: 'GET',
    url: `/getrefunds/order/${orderId}`,
    token,
  })
  const source = (result ?? {}) as Record<string, unknown>
  if (Array.isArray(result)) return result as Refund[]
  return (source.refunds ?? source.data ?? []) as Refund[]
}

export async function getRefundById(token: string, refundId: string): Promise<Refund> {
  return apiRequest<Refund>({
    method: 'GET',
    url: `/getrefundById/${refundId}`,
    token,
  })
}

/** Every refund, across customers and vendors, for the admin refunds screen. */
export async function getAdminRefunds(
  token: string,
  query: RefundQuery = {},
): Promise<PaginatedResult<Refund>> {
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getallrefunds?${refundQueryString(query)}`,
    token,
  }).then(toRefundList)
}

/** Admin action: move a refund to its next state. */
export async function updateRefundStatus(
  token: string,
  refundId: string,
  input: UpdateRefundStatusInput,
): Promise<Refund> {
  return apiRequest<Refund>({
    method: 'PUT',
    url: `/updaterefund/${refundId}/status`,
    data: input,
    token,
  })
}

/** Admin action: record the gateway reference for a completed refund. */
export async function completeRefund(
  token: string,
  refundId: string,
  input: { refundReference: string; reason?: string },
): Promise<Refund> {
  return apiRequest<Refund>({
    method: 'PUT',
    url: `/completerefund/${refundId}`,
    data: input,
    token,
  })
}

/** Vendor-facing refunds, scoped by the backend to the signed-in vendor. */
export async function getVendorRefunds(
  token: string,
  query: RefundQuery = {},
): Promise<PaginatedResult<Refund>> {
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getvendorrefunds?${refundQueryString(query)}`,
    token,
  }).then(toRefundList)
}
