import type { StatusStep, StatusTone } from '@/components/common/workflow-status'
import type { FinanceTimelineStep, ReturnReason } from '@/types/finance.types'
import { RETURN_REASON_OPTIONS } from '@/types/finance.types'
import type { RefundRecord, RefundStage, ReturnRecord, ReturnStage } from '@/features/returns/types'

/**
 * The return and refund workflow as the vendor and admin screens present it.
 *
 * Labels and tones live here so a stage reads the same on the list, on the
 * detail screen and inside a dialog. The step keys match the return status
 * strings the API already stores wherever one exists (`requested`, `approved`,
 * `rejected`, `pickup_scheduled`, `picked_up`, `received`, `refund_completed`,
 * `cancelled`); `under_review`, `quality_check` and `refund_pending` are the
 * review stages this workspace adds on top.
 */

const RETURN_LABELS: Record<ReturnStage, string> = {
  requested: 'Return Requested',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  pickup_scheduled: 'Pickup Scheduled',
  picked_up: 'Product Picked Up',
  received: 'Product Received',
  quality_check: 'Quality Check',
  refund_pending: 'Refund Pending',
  refund_completed: 'Refund Completed',
  cancelled: 'Cancelled',
}

const RETURN_TONES: Record<ReturnStage, StatusTone> = {
  requested: 'warning',
  under_review: 'info',
  approved: 'info',
  rejected: 'destructive',
  pickup_scheduled: 'info',
  picked_up: 'info',
  received: 'info',
  quality_check: 'rose',
  refund_pending: 'warning',
  refund_completed: 'success',
  cancelled: 'neutral',
}

/** Return outcome that ends the trail early, with the copy shown under it. */
const RETURN_TERMINALS: Partial<Record<ReturnStage, { label: string; description: string }>> = {
  rejected: {
    label: 'Return rejected',
    description: 'The request was declined, so no pickup was arranged and no refund was raised.',
  },
  cancelled: {
    label: 'Return cancelled',
    description: 'The customer withdrew this request before the product was received.',
  },
}

export function returnStageLabel(stage: ReturnStage): string {
  return RETURN_LABELS[stage] ?? stage
}

export function returnStageTone(stage: ReturnStage): StatusTone {
  return RETURN_TONES[stage] ?? 'neutral'
}

export function returnStageTerminal(stage: ReturnStage) {
  return RETURN_TERMINALS[stage] ?? null
}

/** The nine steps of the return trail, in the order the workspace shows them. */
export const RETURN_STEPS: StatusStep[] = [
  { key: 'requested', label: 'Customer Requested Return' },
  { key: 'under_review', label: 'Vendor Reviewing' },
  { key: 'approved', label: 'Return Approved' },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { key: 'picked_up', label: 'Product Picked Up' },
  { key: 'received', label: 'Product Received' },
  { key: 'quality_check', label: 'Quality Check' },
  { key: 'refund_pending', label: 'Refund Processing' },
  { key: 'refund_completed', label: 'Refund Completed' },
]

/** Where each stage sits on `RETURN_STEPS`; `-1` means the trail has stopped. */
export function returnStepIndex(stage: ReturnStage): number {
  if (RETURN_TERMINALS[stage]) return -1
  const index = RETURN_STEPS.findIndex((step) => step.key === stage)
  return index === -1 ? 0 : index
}

/**
 * Builds the trail for `<FinanceTimeline>`. A step is only drawn as complete when
 * the record carries a timestamp for it, so a stage that has not happened yet
 * can never read as done.
 */
export function returnTimelineSteps(record: ReturnRecord): FinanceTimelineStep[] {
  const index = returnStepIndex(record.stage)
  const byKey = new Map(record.events.map((event) => [event.key, event]))

  if (index === -1) {
    const terminal = returnStageTerminal(record.stage)
    return record.events
      .map<FinanceTimelineStep>((event, position) => ({
        key: event.key,
        label: RETURN_LABELS[event.key as ReturnStage] ?? event.key,
        at: event.at,
        tone: position === record.events.length - 1 ? 'failed' : 'done',
        note: event.note,
      }))
      .concat(
        terminal
          ? [{ key: 'terminal', label: terminal.label, at: null, tone: 'failed' as const, note: terminal.description }]
          : [],
      )
      .slice(0, RETURN_STEPS.length)
  }

  return RETURN_STEPS.map((step, position) => {
    const event = byKey.get(step.key)
    const tone: FinanceTimelineStep['tone'] = position < index ? 'done' : position === index ? 'current' : 'upcoming'
    return { key: step.key, label: step.label, at: event?.at ?? null, tone, note: event?.note ?? null }
  })
}

// ─── Refund ───

const REFUND_LABELS: Record<RefundStage, string> = {
  requested: 'Refund Requested',
  pending_review: 'Pending Review',
  approved: 'Approved',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

const REFUND_TONES: Record<RefundStage, StatusTone> = {
  requested: 'warning',
  pending_review: 'warning',
  approved: 'info',
  processing: 'info',
  completed: 'success',
  failed: 'destructive',
  rejected: 'destructive',
  cancelled: 'neutral',
}

const REFUND_TERMINALS: Partial<Record<RefundStage, { label: string; description: string }>> = {
  failed: { label: 'Refund failed', description: 'The payout was returned by the gateway and can be retried.' },
  rejected: { label: 'Refund rejected', description: 'The refund was declined and no money was sent back.' },
  cancelled: { label: 'Refund cancelled', description: 'The refund was withdrawn before it was processed.' },
}

export function refundStageLabel(stage: RefundStage): string {
  return REFUND_LABELS[stage] ?? stage
}

export function refundStageTone(stage: RefundStage): StatusTone {
  return REFUND_TONES[stage] ?? 'neutral'
}

export function refundStageTerminal(stage: RefundStage) {
  return REFUND_TERMINALS[stage] ?? null
}

export const REFUND_STEPS: StatusStep[] = [
  { key: 'requested', label: 'Refund Requested' },
  { key: 'pending_review', label: 'Admin Review' },
  { key: 'approved', label: 'Refund Approved' },
  { key: 'processing', label: 'Refund Processing' },
  { key: 'completed', label: 'Refund Completed' },
]

export function refundStepIndex(stage: RefundStage): number {
  if (REFUND_TERMINALS[stage]) return -1
  const index = REFUND_STEPS.findIndex((step) => step.key === stage)
  return index === -1 ? 0 : index
}

export function refundTimelineSteps(record: RefundRecord): FinanceTimelineStep[] {
  const index = refundStepIndex(record.stage)

  if (index === -1) {
    const terminal = refundStageTerminal(record.stage)
    return record.events
      .map<FinanceTimelineStep>((event, position) => ({
        key: event.key,
        label: REFUND_LABELS[event.key as RefundStage] ?? event.key,
        at: event.at,
        tone: position === record.events.length - 1 ? 'failed' : 'done',
        note: event.note,
      }))
      .concat(
        terminal
          ? [{ key: 'terminal', label: terminal.label, at: null, tone: 'failed' as const, note: terminal.description }]
          : [],
      )
      .slice(0, REFUND_STEPS.length)
  }

  const byKey = new Map(record.events.map((event) => [event.key, event]))
  return REFUND_STEPS.map((step, position) => {
    const event = byKey.get(step.key)
    const tone: FinanceTimelineStep['tone'] = position < index ? 'done' : position === index ? 'current' : 'upcoming'
    return { key: step.key, label: step.label, at: event?.at ?? null, tone, note: event?.note ?? null }
  })
}

// ─── Filters and pick lists ───

export const RETURN_STAGE_FILTERS: { value: ReturnStage; label: string }[] = (
  Object.keys(RETURN_LABELS) as ReturnStage[]
).map((value) => ({ value, label: RETURN_LABELS[value] }))

export const REFUND_STAGE_FILTERS: { value: RefundStage; label: string }[] = (
  Object.keys(REFUND_LABELS) as RefundStage[]
).map((value) => ({ value, label: REFUND_LABELS[value] }))

export const REFUND_METHOD_OPTIONS = [
  'UPI',
  'Credit / Debit Card',
  'Net Banking',
  'Wallet',
  'Cash on Delivery',
  'Bank Transfer',
] as const

export const RETURN_REJECTION_REASONS = [
  'Product outside the return window',
  'Item appears used or worn',
  'Tags or packaging missing',
  'Return does not match the order',
  'Damage caused after delivery',
  'Duplicate return request',
  'Other',
] as const

const REASON_LABELS = new Map(RETURN_REASON_OPTIONS.map((option) => [option.value, option.label]))

/** Readable reason text for a return, a refund, or a rejection note. */
export function returnReasonLabel(reason: ReturnReason | string | null | undefined): string {
  if (!reason) return 'Not stated'
  return REASON_LABELS.get(reason as ReturnReason) ?? String(reason).replace(/_/g, ' ')
}

export const REFUND_REJECTION_REASONS = [
  'Quality check failed',
  'Return outside the return window',
  'Refund already processed for this order',
  'Amount does not match the approved refund',
  'Customer could not be verified',
  'Other',
] as const

export const QUALITY_CONDITION_OPTIONS = [
  'New with tags',
  'New without tags',
  'Lightly used',
  'Used once or twice',
  'Heavily used',
  'Damaged',
] as const

export const PACKAGING_CONDITION_OPTIONS = [
  'Original packaging intact',
  'Packaging opened',
  'Packaging damaged',
  'No packaging received',
] as const

// ─── Gating ───

export const OPEN_RETURN_STAGES: ReturnStage[] = [
  'requested',
  'under_review',
  'approved',
  'pickup_scheduled',
  'picked_up',
  'received',
  'quality_check',
  'refund_pending',
]

export function isReturnOpen(stage: ReturnStage): boolean {
  return OPEN_RETURN_STAGES.includes(stage)
}

/** A return is decided while it is awaiting review or already under review. */
export function canDecideReturn(stage: ReturnStage): boolean {
  return stage === 'requested' || stage === 'under_review'
}

export function canSchedulePickup(stage: ReturnStage): boolean {
  return stage === 'approved'
}

export function canMarkPickedUp(stage: ReturnStage): boolean {
  return stage === 'pickup_scheduled'
}

export function canMarkReceived(stage: ReturnStage): boolean {
  return stage === 'picked_up'
}

export function canRunQualityCheck(stage: ReturnStage): boolean {
  return stage === 'received'
}

export function canApproveRefund(stage: ReturnStage): boolean {
  return stage === 'quality_check'
}

/** Refunds still owed to the customer. */
export function isRefundOpen(stage: RefundStage): boolean {
  return stage === 'requested' || stage === 'pending_review' || stage === 'approved' || stage === 'processing'
}

export function isRefundSettled(stage: RefundStage): boolean {
  return stage === 'completed'
}

export function canProcessRefund(stage: RefundStage): boolean {
  return stage === 'requested' || stage === 'pending_review' || stage === 'approved'
}

export function canCompleteRefund(stage: RefundStage): boolean {
  return stage === 'processing'
}

export function canRejectRefund(stage: RefundStage): boolean {
  return isRefundOpen(stage)
}
