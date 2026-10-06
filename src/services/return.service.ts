import { apiRequest } from '@/services/http'
import type {
  CancellationReason,
  PaginatedResult,
  ReturnEligibility,
  ReturnEligibilityResponse,
  ReturnReason,
  ReturnStatus,
} from '@/types/finance.types'
import type { RefundLine } from '@/services/refund.service'

/** A return request (RMA) as the API stores it. */
export interface ReturnRequest {
  _id: string
  returnNumber: string | null
  orderId: string
  orderNumber: string | null
  orderDate: string | null
  /** One entry per returned order line. */
  items: RefundLine[]
  itemIds: string[]
  returnType: 'full' | 'partial' | string
  returnStatus: ReturnStatus | string
  returnReason: string | null
  comments: string | null
  images: string[]
  quantity: number
  productName: string | null
  vendorId: string | null
  vendorName: string | null
  /** Amount the backend will refund for this request. Never computed here. */
  refundAmount: number | null
  /** Backend-stamped window bounds and milestones. */
  deliveredAt: string | null
  returnEligibleFrom: string | null
  returnEligibleUntil: string | null
  returnRequestedAt: string | null
  returnApprovedAt: string | null
  returnRejectedAt: string | null
  pickupScheduledAt: string | null
  pickedUpAt: string | null
  returnReceivedAt: string | null
  refundInitiatedAt: string | null
  refundCompletedAt: string | null
  refundId: string | null
  adminRemarks: string | null
  createdAt: string
  updatedAt: string
}

/** `Return` is the name the module is specified against; `ReturnRequest` is the
 *  interface used internally so the type reads well at every call site. */
export type Return = ReturnRequest

export interface RequestReturnInput {
  /** Order lines being returned, for a partial return. */
  itemIds: string[]
  quantities?: Record<string, number>
  returnReason: ReturnReason | string
  comments?: string
  images?: string[]
}

export interface RequestCancellationInput {
  cancellationReason: CancellationReason | string
  comments?: string
}

export interface CancellationPreview {
  orderId: string
  orderNumber: string | null
  /** False when the API refuses the cancellation. */
  cancellationAllowed: boolean
  /** Why the cancellation is blocked, when it is. */
  blockedReason: string | null
  /** Amount the backend has recorded against the payment. */
  amountPaid: number | null
  /** Amount the backend will refund. Displayed verbatim. */
  refundAmount: number | null
  paymentStatus: string | null
  refundStatus: string | null
  /** Window before which the customer can still cancel. */
  cancellationDeadline: string | null
}

export interface ReturnQuery {
  page?: number
  limit?: number
  orderNumber?: string
  returnStatus?: string
}

function returnQueryString(query: ReturnQuery = {}): string {
  const params = new URLSearchParams()
  params.set('page', String(query.page ?? 1))
  params.set('limit', String(query.limit ?? 20))
  if (query.orderNumber) params.set('orderNumber', query.orderNumber)
  if (query.returnStatus) params.set('returnStatus', query.returnStatus)
  return params.toString()
}

function toReturnList(body: unknown): PaginatedResult<ReturnRequest> {
  const source = (body ?? {}) as Record<string, unknown>
  const list =
    (Array.isArray(source) && source) ||
    (Array.isArray(source.returns) && source.returns) ||
    (Array.isArray(source.data) && source.data) ||
    []
  return {
    items: list as ReturnRequest[],
    total: typeof source.total === 'number' ? source.total : list.length,
    page: typeof source.page === 'number' ? source.page : 1,
    totalPages: typeof source.totalPages === 'number' ? source.totalPages : 1,
  }
}

/**
 * Which order lines can still be returned, with the window the backend reports
 * and the refund it would quote. The dialog renders these values as-is.
 */
export async function getReturnableItems(
  token: string,
  orderId: string,
): Promise<ReturnEligibilityResponse> {
  const result = await apiRequest<ReturnEligibilityResponse | ReturnEligibility[]>({
    method: 'GET',
    url: `/getreturnableitems/${orderId}`,
    token,
  })
  if (Array.isArray(result)) return { orderId, items: result }
  return { orderId: result.orderId, orderNumber: result.orderNumber, items: result.items ?? [] }
}

export async function getOrderReturns(
  token: string,
  orderId: string,
): Promise<ReturnRequest[]> {
  const result = await apiRequest<unknown>({
    method: 'GET',
    url: `/getreturns/order/${orderId}`,
    token,
  })
  if (Array.isArray(result)) return result as ReturnRequest[]
  const source = (result ?? {}) as Record<string, unknown>
  return (source.returns ?? source.data ?? []) as ReturnRequest[]
}

export async function getReturnById(token: string, returnId: string): Promise<ReturnRequest> {
  return apiRequest<ReturnRequest>({
    method: 'GET',
    url: `/getreturnById/${returnId}`,
    token,
  })
}

/** Every return request, for the admin view. */
export async function getAllReturns(
  token: string,
  query: ReturnQuery = {},
): Promise<PaginatedResult<ReturnRequest>> {
  return apiRequest<unknown>({
    method: 'GET',
    url: `/getallreturns?${returnQueryString(query)}`,
    token,
  }).then(toReturnList)
}

/**
 * Raises a return. The refund amount is decided by the backend from the items
 * sent, and the response carries it back for the confirmation toast.
 */
export async function requestReturn(
  token: string,
  orderId: string,
  input: RequestReturnInput,
): Promise<ReturnRequest> {
  return apiRequest<ReturnRequest>({
    method: 'POST',
    url: `/requestreturn/${orderId}`,
    data: input,
    token,
  })
}

/** What cancelling this order would refund, according to the backend. */
export async function getCancellationPreview(
  token: string,
  orderId: string,
): Promise<CancellationPreview> {
  return apiRequest<CancellationPreview>({
    method: 'GET',
    url: `/getcancellationpreview/${orderId}`,
    token,
  })
}

/**
 * Cancels an order. The reason and comments ride on the existing
 * `PUT /cancelorder/:id` call so no parallel endpoint is introduced.
 */
export async function cancelOrderWithReason(
  token: string,
  orderId: string,
  input: RequestCancellationInput,
): Promise<unknown> {
  return apiRequest<unknown>({
    method: 'PUT',
    url: `/cancelorder/${orderId}`,
    data: input,
    token,
  })
}

// ─── Admin return actions ───

export type AdminReturnAction = 'approve' | 'reject' | 'schedule_pickup' | 'mark_received'

export interface AdminReturnActionInput {
  reason?: string
  pickupDate?: string
  remarks?: string
}

export async function updateReturnStatus(
  token: string,
  returnId: string,
  action: AdminReturnAction,
  input: AdminReturnActionInput = {},
): Promise<ReturnRequest> {
  return apiRequest<ReturnRequest>({
    method: 'PUT',
    url: `/updatereturn/${returnId}/${action}`,
    data: input,
    token,
  })
}
