import { apiRequest } from '@/services/http'
import type { DateRangeQuery, PaginatedResult, SettlementStatus } from '@/types/finance.types'

export interface SettlementPartyRef {
  _id: string
  name?: string | null
  businessName?: string | null
  email?: string | null
}

/**
 * A vendor settlement, exactly as the API reports it.
 *
 * Every amount here is a backend figure. `vendorPayableAmount` is the payable
 * the backend has already reduced by `vendorAdjustment`; the client reads it and
 * never derives it, so a settlement screen can never disagree with a payout.
 */
export interface Settlement {
  _id: string
  /** Human settlement number, e.g. `SET-10001`. */
  settlementNumber: string | null
  orderId: string
  orderNumber: string | null
  orderDate: string | null
  customerId?: string | null
  customerName?: string | null
  vendorId: string
  vendorName?: string | null
  /** One entry per vendor, for orders that split across sellers. */
  vendorItemCount?: number | null
  productName?: string | null

  /** What the customer paid for the whole order. */
  customerPaidAmount: number
  /** Seller-side pricing, as stored on the order lines. */
  vendorBaseAmount: number
  vendorDiscountAmount: number
  vendorNetAmount: number
  /** What the platform retains on this settlement. */
  adminAmount: number
  adminCommissionPercent?: number | null

  /** Customer money returned, and the seller's share of it. */
  refundAmount: number
  /** Signed: negative reduces the payable. */
  vendorAdjustment: number
  /** The backend's final payable. */
  vendorPayableAmount: number
  platformAdjustment: number

  settlementStatus: SettlementStatus | string
  paymentStatus: string | null
  refundStatus: string | null
  refundId: string | null
  refundReference: string | null

  /** Lifecycle timestamps, all backend-stamped. */
  deliveredAt: string | null
  returnEligibleFrom: string | null
  returnEligibleUntil: string | null
  returnRequestedAt: string | null
  returnApprovedAt: string | null
  returnedAt: string | null
  refundInitiatedAt: string | null
  refundCompletedAt: string | null
  settlementEligibleAt: string | null
  settlementProcessedAt: string | null
  settlementPaidAt: string | null

  transactionReference: string | null
  payoutMethod: string | null
  failureReason: string | null

  createdAt: string
  updatedAt: string
}

/** Vendor dashboard totals, straight from the summary endpoint. */
export interface SettlementSummary {
  pendingSettlement: number
  eligibleSettlement: number
  processingSettlement: number
  paidSettlement: number
  refundAdjustments: number
  totalVendorPayable: number
  pendingCount?: number
  eligibleCount?: number
  processingCount?: number
  paidCount?: number
}

/** Admin reconciliation totals, straight from the summary endpoint. */
export interface AdminSettlementSummary {
  totalCustomerPayments: number
  totalVendorPayable: number
  totalAdminAmount: number
  pendingSettlements: number
  eligibleSettlements: number
  processingSettlements: number
  paidSettlements: number
  totalRefunds: number
  totalVendorAdjustments: number
  failedSettlements: number
  pendingCount?: number
  eligibleCount?: number
  processingCount?: number
  paidCount?: number
  failedCount?: number
}

export interface SettlementQuery extends DateRangeQuery {
  page?: number
  limit?: number
  orderNumber?: string
  customer?: string
  vendor?: string
  settlementStatus?: string
  paymentStatus?: string
  refundStatus?: string
}

export interface MarkSettlementPaidInput {
  transactionReference?: string
  payoutMethod?: string
  remarks?: string
}

export interface MarkSettlementFailedInput {
  reason: string
}

function settlementQueryString(query: SettlementQuery = {}): string {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 20))
  if (query.orderNumber) params.set('orderNumber', query.orderNumber)
  if (query.customer) params.set('customer', query.customer)
  if (query.vendor) params.set('vendor', query.vendor)
  if (query.settlementStatus) params.set('settlementStatus', query.settlementStatus)
  if (query.paymentStatus) params.set('paymentStatus', query.paymentStatus)
  if (query.refundStatus) params.set('refundStatus', query.refundStatus)
  if (query.dateFrom) params.set('dateFrom', query.dateFrom)
  if (query.dateTo) params.set('dateTo', query.dateTo)
  return params.toString()
}

function toSettlementList(body: unknown): PaginatedResult<Settlement> {
  const source = (body ?? {}) as Record<string, unknown>
  const list =
    (Array.isArray(source) && source) ||
    (Array.isArray(source.settlements) && source.settlements) ||
    (Array.isArray(source.data) && source.data) ||
    []
  return {
    items: list as Settlement[],
    total: typeof source.total === 'number' ? source.total : list.length,
    page: typeof source.page === 'number' ? source.page : 1,
    totalPages: typeof source.totalPages === 'number' ? source.totalPages : 1,
  }
}

function toSummary<T>(body: unknown, keys: (keyof T)[], fallback: T): T {
  const source = (body ?? {}) as Record<string, unknown>
  const result = { ...fallback }
  for (const key of keys) {
    const value = source[key as string]
    if (typeof value === 'number') (result as Record<string, number>)[key as string] = value
  }
  return result
}

// ─── Vendor ───

/** Settlements for the signed-in vendor. `vendorId` is optional because the
 *  backend scopes the list to the token's vendor. */
export async function getVendorSettlements(
  token: string,
  query: SettlementQuery = {},
  vendorId?: string,
): Promise<PaginatedResult<Settlement>> {
  const params = new URLSearchParams(settlementQueryString(query))
  if (vendorId) params.set('vendorId', vendorId)
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getvendorsettlements?${params.toString()}`,
    token,
  }).then(toSettlementList)
}

export async function getVendorSettlementById(
  token: string,
  settlementId: string,
): Promise<Settlement> {
  return apiRequest<Settlement>({
    method: 'GET',
    url: `/getvendorsettlementById/${settlementId}`,
    token,
  })
}

/** Vendor dashboard totals. Falls back to an all-zero summary rather than
 *  summing the list in the browser. */
export async function getVendorSettlementSummary(
  token: string,
  query: SettlementQuery = {},
): Promise<SettlementSummary> {
  const empty: SettlementSummary = {
    pendingSettlement: 0,
    eligibleSettlement: 0,
    processingSettlement: 0,
    paidSettlement: 0,
    refundAdjustments: 0,
    totalVendorPayable: 0,
  }
  const body = await apiRequest<unknown>({
    method: 'GET',
    url: `/getvendorsettlementsummary?${settlementQueryString(query)}`,
    token,
  })
  const source = (body ?? {}) as Record<string, unknown>
  return toSummary(
    (source.summary as Record<string, unknown>) ?? source,
    [
      'pendingSettlement',
      'eligibleSettlement',
      'processingSettlement',
      'paidSettlement',
      'refundAdjustments',
      'totalVendorPayable',
      'pendingCount',
      'eligibleCount',
      'processingCount',
      'paidCount',
    ],
    empty,
  )
}

// ─── Admin ───

export async function getAdminSettlements(
  token: string,
  query: SettlementQuery = {},
): Promise<PaginatedResult<Settlement>> {
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getallsettlements?${settlementQueryString(query)}`,
    token,
  }).then(toSettlementList)
}

export async function getAdminSettlementById(
  token: string,
  settlementId: string,
): Promise<Settlement> {
  return apiRequest<Settlement>({
    method: 'GET',
    url: `/getsettlementById/${settlementId}`,
    token,
  })
}

export async function getAdminSettlementSummary(
  token: string,
  query: SettlementQuery = {},
): Promise<AdminSettlementSummary> {
  const empty: AdminSettlementSummary = {
    totalCustomerPayments: 0,
    totalVendorPayable: 0,
    totalAdminAmount: 0,
    pendingSettlements: 0,
    eligibleSettlements: 0,
    processingSettlements: 0,
    paidSettlements: 0,
    totalRefunds: 0,
    totalVendorAdjustments: 0,
    failedSettlements: 0,
  }
  const body = await apiRequest<unknown>({
    method: 'GET',
    url: `/getsettlementsummary?${settlementQueryString(query)}`,
    token,
  })
  const source = (body ?? {}) as Record<string, unknown>
  return toSummary(
    (source.summary as Record<string, unknown>) ?? source,
    [
      'totalCustomerPayments',
      'totalVendorPayable',
      'totalAdminAmount',
      'pendingSettlements',
      'eligibleSettlements',
      'processingSettlements',
      'paidSettlements',
      'totalRefunds',
      'totalVendorAdjustments',
      'failedSettlements',
      'pendingCount',
      'eligibleCount',
      'processingCount',
      'paidCount',
      'failedCount',
    ],
    empty,
  )
}

/** Admin action: move an eligible settlement into processing. */
export async function processSettlement(token: string, settlementId: string): Promise<Settlement> {
  return apiRequest<Settlement>({
    method: 'PUT',
    url: `/processsettlement/${settlementId}`,
    token,
  })
}

/** Admin action: record the payout against a processed settlement. */
export async function markSettlementPaid(
  token: string,
  settlementId: string,
  input: MarkSettlementPaidInput = {},
): Promise<Settlement> {
  return apiRequest<Settlement>({
    method: 'PUT',
    url: `/marksettlementpaid/${settlementId}`,
    data: input,
    token,
  })
}

/** Admin action: record a failed payout attempt. */
export async function markSettlementFailed(
  token: string,
  settlementId: string,
  input: MarkSettlementFailedInput,
): Promise<Settlement> {
  return apiRequest<Settlement>({
    method: 'PUT',
    url: `/marksettlementfailed/${settlementId}`,
    data: input,
    token,
  })
}
