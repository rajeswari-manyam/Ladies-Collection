import type { ReturnReason } from '@/types/finance.types'
import type { RefundRecord, ReturnRecord } from '@/features/returns/types'

/**
 * Filter state and matching for the return and refund list screens.
 *
 * Both portals filter the same records, so the predicates live here rather than
 * being written out twice per screen.
 */

export interface ReturnFilters {
  /** Matches return id, order number, customer or product. */
  search: string
  stage: string
  reason: string
  /** Vendor id, or `all`. */
  vendor: string
  from: string
  to: string
}

export interface RefundFilters {
  /** Matches refund id, order number, customer, vendor or product. */
  search: string
  stage: string
  method: string
  vendor: string
  from: string
  to: string
}

export const EMPTY_RETURN_FILTERS: ReturnFilters = {
  search: '',
  stage: 'all',
  reason: 'all',
  vendor: 'all',
  from: '',
  to: '',
}

export const EMPTY_REFUND_FILTERS: RefundFilters = {
  search: '',
  stage: 'all',
  method: 'all',
  vendor: 'all',
  from: '',
  to: '',
}

function withinRange(value: string, from: string, to: string): boolean {
  if (!from && !to) return true
  const at = new Date(value).getTime()
  if (Number.isNaN(at)) return true
  if (from && at < new Date(from).setHours(0, 0, 0, 0)) return false
  if (to && at > new Date(to).setHours(23, 59, 59, 999)) return false
  return true
}

function matchesTerm(record: string[], term: string): boolean {
  if (!term.trim()) return true
  const needle = term.trim().toLowerCase()
  return record.some((value) => (value ?? '').toLowerCase().includes(needle))
}

export function matchesReturnFilters(record: ReturnRecord, filters: ReturnFilters): boolean {
  if (filters.stage !== 'all' && record.stage !== filters.stage) return false
  if (filters.reason !== 'all' && record.reason !== (filters.reason as ReturnReason)) return false
  if (filters.vendor !== 'all' && record.vendor.id !== filters.vendor) return false
  if (!withinRange(record.requestedAt, filters.from, filters.to)) return false
  return matchesTerm(
    [record.returnId, record.orderNumber, record.customer.name, record.product.name, record.vendor.name],
    filters.search,
  )
}

export function matchesRefundFilters(record: RefundRecord, filters: RefundFilters): boolean {
  if (filters.stage !== 'all' && record.stage !== filters.stage) return false
  if (filters.method !== 'all' && record.method !== filters.method) return false
  if (filters.vendor !== 'all' && record.vendor.id !== filters.vendor) return false
  if (!withinRange(record.requestedAt, filters.from, filters.to)) return false
  return matchesTerm(
    [record.refundId, record.returnId, record.orderNumber, record.customer.name, record.vendor.name, record.productName],
    filters.search,
  )
}

export function hasActiveReturnFilters(filters: ReturnFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.stage !== 'all' ||
    filters.reason !== 'all' ||
    filters.vendor !== 'all' ||
    filters.from !== '' ||
    filters.to !== ''
  )
}

export function hasActiveRefundFilters(filters: RefundFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.stage !== 'all' ||
    filters.method !== 'all' ||
    filters.vendor !== 'all' ||
    filters.from !== '' ||
    filters.to !== ''
  )
}
