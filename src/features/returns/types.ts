import type { ReturnReason } from '@/types/finance.types'

/**
 * Types for the Return & Refund workspace (vendor + admin).
 *
 * These describe the records the new screens render. They are intentionally
 * separate from the API shapes in `@/services/return.service` and
 * `@/services/refund.service`: the workspace adds the review, quality-check and
 * refund-approval stages the vendor and admin act on, which the customer-facing
 * service types do not model.
 */

/** Return lifecycle across the vendor and admin workspace. */
export type ReturnStage =
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'received'
  | 'quality_check'
  | 'refund_pending'
  | 'refund_completed'
  | 'cancelled'

/** Refund lifecycle across the vendor and admin workspace. */
export type RefundStage =
  | 'requested'
  | 'pending_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'cancelled'

/** One dated step of a return or refund trail. */
export interface TimelineEvent {
  key: string
  at: string | null
  note?: string | null
}

/** A customer-uploaded return photo. Rendered as themed artwork, not a network image. */
export interface ReturnImage {
  id: string
  label: string
  hue: number
}

export interface Party {
  name: string
  email: string
  phone: string
  address: string
}

export interface VendorParty {
  id: string
  name: string
  contact: string
  approvalStatus: string
}

export interface ReturnedProduct {
  name: string
  sku: string
  variant: string
  size: string
  color: string
  hue: number
  price: number
  discount: number
  tax: number
  finalAmount: number
}

export interface QualityCheckResult {
  productCondition: string
  packagingCondition: string
  tagsAvailable: boolean
  productUsed: boolean
  productDamaged: boolean
  matchesOrder: boolean
  notes: string
  outcome: 'passed' | 'failed'
  failureReason: string
  checkedAt: string
  checkedBy: string
}

export interface ReturnDecision {
  outcome: 'approved' | 'rejected'
  reason: string
  notes: string
  decidedAt: string
  decidedBy: string
}

export interface ReturnRecord {
  /** Route-safe handle, e.g. `ret-1042`. */
  id: string
  returnId: string
  orderId: string
  orderNumber: string
  orderDate: string
  orderAmount: number
  deliveryStatus: string
  customer: Party
  vendor: VendorParty
  product: ReturnedProduct
  quantity: number
  reason: ReturnReason
  comments: string
  requestedAt: string
  eligibleUntil: string
  refundAmount: number
  /** Set once a refund record exists for this return. */
  refundId: string | null
  stage: ReturnStage
  images: ReturnImage[]
  events: TimelineEvent[]
  decision: ReturnDecision | null
  qualityCheck: QualityCheckResult | null
  pickup: { scheduledFor: string; courier: string; waybill: string } | null
}

export interface RefundRecord {
  /** Route-safe handle, e.g. `ref-204`. */
  id: string
  refundId: string
  returnId: string
  returnHandle: string
  orderId: string
  orderNumber: string
  customer: Party
  vendor: VendorParty
  productName: string
  productHue: number
  originalOrderAmount: number
  productAmount: number
  discount: number
  tax: number
  shipping: number
  returnCharges: number
  deduction: number
  refundAmount: number
  method: string
  reason: string
  stage: RefundStage
  requestedAt: string
  approvedAt: string | null
  processedAt: string | null
  refundReference: string | null
  transactionReference: string | null
  adminNotes: string | null
  failureReason: string | null
  events: TimelineEvent[]
}
