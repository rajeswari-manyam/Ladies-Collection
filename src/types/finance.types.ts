/**
 * Shared vocabulary for the payment → refund → settlement module.
 *
 * Every monetary figure and every timestamp in this module is read straight
 * from a backend response. The types below describe the values the API sends;
 * they never describe a value the client is allowed to derive.
 */

// ─── Statuses ───

/**
 * Refund lifecycle. The API owns these strings; the UI only maps them to a
 * friendlier label (see `refundStatusText`).
 */
export type RefundStatus =
  | 'requested'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'pending'

/** Return (RMA) lifecycle as stored by the returns API. */
export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'received'
  | 'refund_initiated'
  | 'refund_completed'
  | 'cancelled'

/** Settlement lifecycle as stored by the settlement API. */
export type SettlementStatus =
  | 'pending'
  | 'eligible'
  | 'processing'
  | 'processed'
  | 'paid'
  | 'failed'
  | 'cancelled'

/** Settlement states a payout can move to next, used to gate admin actions. */
export const SETTLEMENT_ACTIONABLE_STATUSES: SettlementStatus[] = [
  'pending',
  'eligible',
  'processing',
  'processed',
]

/** Status filter options for the settlement list screens. */
export const SETTLEMENT_STATUS_OPTIONS: { value: SettlementStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'eligible', label: 'Eligible' },
  { value: 'processing', label: 'Processing' },
  { value: 'processed', label: 'Processed' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

/** Status filter options for the refund and return list screens. */
export const REFUND_STATUS_OPTIONS: { value: RefundStatus; label: string }[] = [
  { value: 'requested', label: 'Requested' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const RETURN_STATUS_OPTIONS: { value: ReturnStatus; label: string }[] = [
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'pickup_scheduled', label: 'Pickup scheduled' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'received', label: 'Received' },
  { value: 'refund_initiated', label: 'Refund initiated' },
  { value: 'refund_completed', label: 'Refund completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

// ─── Reasons ───

export type CancellationReason =
  | 'changed_mind'
  | 'ordered_by_mistake'
  | 'delivery_too_slow'
  | 'found_better_price'
  | 'item_not_as_described'
  | 'other'

export type ReturnReason =
  | 'size_not_fit'
  | 'damaged_on_arrival'
  | 'wrong_item_received'
  | 'item_not_as_described'
  | 'changed_mind'
  | 'defective'
  | 'other'

/** The select options offered in the cancel/return dialogs. */
export const CANCELLATION_REASON_OPTIONS: { value: CancellationReason; label: string }[] = [
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'ordered_by_mistake', label: 'Ordered by mistake' },
  { value: 'delivery_too_slow', label: 'Delivery took too long' },
  { value: 'found_better_price', label: 'Found a better price' },
  { value: 'item_not_as_described', label: 'Item not as described' },
  { value: 'other', label: 'Other' },
]

export const RETURN_REASON_OPTIONS: { value: ReturnReason; label: string }[] = [
  { value: 'size_not_fit', label: 'Size does not fit' },
  { value: 'damaged_on_arrival', label: 'Arrived damaged' },
  { value: 'wrong_item_received', label: 'Wrong item received' },
  { value: 'item_not_as_described', label: 'Item not as described' },
  { value: 'defective', label: 'Defective product' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
]

// ─── Timelines ───

export type FinanceTimelineTone = 'done' | 'current' | 'upcoming' | 'failed'

export interface FinanceTimelineStep {
  /** Stable key, also the react key. */
  key: string
  /** Friendly label, e.g. "Refund Completed". */
  label: string
  /** Backend timestamp for this stage, or null when it has not happened. */
  at: string | null
  /**
   * `done` for a stage the API has timestamped, `current` for the stage the
   * record is sitting on, `upcoming` for a stage with no date, `failed` when
   * the record failed at this point. A stage with no timestamp is never drawn
   * as completed.
   */
  tone: FinanceTimelineTone
  /** Optional supporting line, e.g. a transaction reference. */
  note?: string | null
}

/** Customer-facing order → return → refund progress. */
export type RefundTimeline = FinanceTimelineStep[]

/** Vendor-facing delivered → return window → eligible → paid progress. */
export type SettlementTimeline = FinanceTimelineStep[]

// ─── Refund summary ───

/**
 * The customer's view of what they paid and what came back. Deliberately free
 * of vendor base price, vendor net price, commission and vendor payable — those
 * are internal and must never be shown to a customer.
 */
export interface CustomerFinancials {
  orderTotal: number
  amountPaid: number
  refundAmount: number
  /** Backend-provided net of payment and refund, or null when not reported. */
  finalAmountCharged: number | null
  paymentStatus: string | null
  refundStatus: string | null
}

// ─── Return eligibility ───

/**
 * What the API says about cancelling or returning an order line. All of it is
 * read from the response — the client does not derive eligibility, a deadline or
 * a refund amount from the order total.
 */
export interface ReturnEligibility {
  itemId: string
  orderId: string
  productId?: string
  productName: string
  vendorId?: string | null
  vendorName?: string | null
  variantName?: string | null
  quantity: number
  returnableQuantity: number
  /** False when the window has closed or the backend refuses the return. */
  eligible: boolean
  /** Backend explanation when `eligible` is false. */
  ineligibleReason?: string | null
  /** Backend-stamped window bounds. */
  returnEligibleFrom: string | null
  returnEligibleUntil: string | null
  /** Amount the backend will refund for this line, if it quotes one. */
  refundAmount: number | null
  imageUrl?: string | null
}

export interface ReturnEligibilityResponse {
  orderId: string
  orderNumber?: string
  items: ReturnEligibility[]
}

// ─── Pagination ───

export interface PaginatedResult<T> {
  /** Backend-chosen list key (e.g. `refunds`, `settlements`, `payments`). */
  items: T[]
  total: number
  page: number
  totalPages: number
}

export interface DateRangeQuery {
  dateFrom?: string
  dateTo?: string
}
