import { create } from 'zustand'
import { toast } from 'sonner'
import { createDemoWorkspace } from '@/features/returns/demo-data'
import type { QualityCheckResult, RefundRecord, ReturnRecord, TimelineEvent } from '@/features/returns/types'
import { refundStageLabel } from '@/features/returns/workflow'

/**
 * Local state for the Return & Refund workspace.
 *
 * Every action here is a UI state transition only — nothing is sent to the API,
 * which is why the screens can be demoed end to end before the endpoints exist.
 * The shapes mirror what the returns/refunds services send, so swapping this
 * store for a query hook later does not touch the pages.
 */

export interface PickupDetails {
  scheduledFor: string
  courier: string
  waybill: string
}

export interface RefundApprovalInput {
  amount: number
  notes: string
}

export interface RefundCompletionInput {
  refundReference: string
  transactionReference: string
  processedAt: string
  notes: string
}

export interface RefundRejectionInput {
  reason: string
  notes: string
}

interface ReturnWorkspaceState {
  returns: ReturnRecord[]
  refunds: RefundRecord[]
  /** Remembers which review step an approved return was acknowledged at. */
  markReviewing: (id: string) => void
  approveReturn: (id: string, notes?: string) => void
  rejectReturn: (id: string, reason: string, notes?: string) => void
  schedulePickup: (id: string, pickup: PickupDetails) => void
  markPickedUp: (id: string) => void
  markReceived: (id: string) => void
  submitQualityCheck: (id: string, result: QualityCheckResult) => void
  approveRefundForReturn: (id: string, notes?: string) => void
  processRefund: (refundId: string, input: RefundApprovalInput) => void
  completeRefund: (refundId: string, input: RefundCompletionInput) => void
  rejectRefund: (refundId: string, input: RefundRejectionInput) => void
}

function nowIso(): string {
  return new Date().toISOString()
}

/** Records a step on the trail: added once, refreshed if it already happened. */
function withEvent(events: TimelineEvent[], key: string, note?: string | null): TimelineEvent[] {
  const at = nowIso()
  const existing = events.find((event) => event.key === key)
  if (existing) {
    return events.map((event) => (event.key === key ? { ...event, at, note: note ?? event.note } : event))
  }
  return [...events, { key, at, note: note ?? null }]
}

function eventNote(key: string, detail?: string): string | null {
  switch (key) {
    case 'requested':
      return 'Raised by the customer'
    case 'under_review':
      return 'Picked up for review'
    case 'approved':
      return detail || 'Return approved'
    case 'rejected':
      return detail || 'Return rejected'
    case 'pickup_scheduled':
      return detail || 'Pickup booked with the courier'
    case 'picked_up':
      return 'Collected from the customer address'
    case 'received':
      return 'Product received at the vendor warehouse'
    case 'quality_check':
      return 'Inspected against the order'
    case 'refund_pending':
      return 'Refund raised with the payment gateway'
    case 'refund_completed':
      return 'Amount credited to the customer'
    case 'cancelled':
      return 'Withdrawn before completion'
    default:
      return null
  }
}

/** A refund record derived from an approved return, used when none exists yet. */
function refundFromReturn(record: ReturnRecord, stage: RefundRecord['stage'], at: string): RefundRecord {
  const shipping = record.orderAmount - record.product.finalAmount
  const productAmount = record.product.finalAmount - record.product.tax
  const refundId = `REF-${record.returnId.replace(/\D/g, '').slice(-4)}${Math.floor(Date.now() / 1000) % 90 + 10}`

  return {
    id: `ref-${record.id.replace(/\D/g, '')}`,
    refundId,
    returnId: record.returnId,
    returnHandle: record.id,
    orderId: record.orderId,
    orderNumber: record.orderNumber,
    customer: record.customer,
    vendor: record.vendor,
    productName: record.product.name,
    productHue: record.product.hue,
    originalOrderAmount: record.orderAmount,
    productAmount,
    discount: record.product.discount,
    tax: record.product.tax,
    shipping,
    returnCharges: 0,
    deduction: 0,
    refundAmount: record.refundAmount,
    method: 'UPI',
    reason: record.reason,
    stage,
    requestedAt: at,
    approvedAt: stage === 'requested' ? null : at,
    processedAt: null,
    refundReference: null,
    transactionReference: null,
    adminNotes: 'Refund raised against the approved return.',
    failureReason: null,
    events: [{ key: 'requested', at, note: 'Raised against the approved return' }],
  }
}

const seed = createDemoWorkspace()

export const useReturnWorkspace = create<ReturnWorkspaceState>((set, get) => ({
  returns: seed.returns,
  refunds: seed.refunds,

  markReviewing: (id) =>
    set((state) => ({
      returns: state.returns.map((record) =>
        record.id === id && record.stage === 'requested'
          ? {
              ...record,
              stage: 'under_review' as const,
              events: withEvent(record.events, 'under_review', eventNote('under_review')),
            }
          : record,
      ),
    })),

  approveReturn: (id, notes) => {
    set((state) => ({
      returns: state.returns.map((record) =>
        record.id === id
          ? {
              ...record,
              stage: 'approved' as const,
              decision: {
                outcome: 'approved' as const,
                reason: 'Approved — within the return window',
                notes: notes ?? '',
                decidedAt: nowIso(),
                decidedBy: 'Vendor review desk',
              },
              events: withEvent(record.events, 'approved', eventNote('approved', notes)),
            }
          : record,
      ),
    }))
    toast.success('Return approved', { description: 'Schedule a pickup to move this request forward.' })
  },

  rejectReturn: (id, reason, notes) => {
    set((state) => ({
      returns: state.returns.map((record) =>
        record.id === id
          ? {
              ...record,
              stage: 'rejected' as const,
              decision: {
                outcome: 'rejected' as const,
                reason,
                notes: notes ?? '',
                decidedAt: nowIso(),
                decidedBy: 'Vendor review desk',
              },
              events: withEvent(record.events, 'rejected', eventNote('rejected', reason)),
            }
          : record,
      ),
    }))
    toast.success('Return rejected', { description: reason })
  },

  schedulePickup: (id, pickup) => {
    set((state) => ({
      returns: state.returns.map((record) =>
        record.id === id
          ? {
              ...record,
              stage: 'pickup_scheduled' as const,
              pickup,
              events: withEvent(
                record.events,
                'pickup_scheduled',
                `${pickup.courier} · waybill ${pickup.waybill}`,
              ),
            }
          : record,
      ),
    }))
    toast.success('Pickup scheduled', { description: `${pickup.courier} will collect the product.` })
  },

  markPickedUp: (id) => {
    set((state) => ({
      returns: state.returns.map((record) =>
        record.id === id
          ? { ...record, stage: 'picked_up' as const, events: withEvent(record.events, 'picked_up') }
          : record,
      ),
    }))
    toast.success('Marked as picked up')
  },

  markReceived: (id) => {
    set((state) => ({
      returns: state.returns.map((record) =>
        record.id === id
          ? { ...record, stage: 'received' as const, events: withEvent(record.events, 'received') }
          : record,
      ),
    }))
    toast.success('Product received', { description: 'A quality check can now be recorded.' })
  },

  submitQualityCheck: (id, result) => {
    const record = get().returns.find((item) => item.id === id)
    if (!record) return

    set((state) => ({
      returns: state.returns.map((item) =>
        item.id === id
          ? {
              ...item,
              stage: 'quality_check' as const,
              qualityCheck: result,
              events: withEvent(
                item.events,
                'quality_check',
                result.outcome === 'passed' ? 'Quality check passed' : `Quality check failed — ${result.failureReason}`,
              ),
            }
          : item,
      ),
    }))

    if (result.outcome === 'passed') {
      toast.success('Quality check passed', { description: 'The refund can now be approved.' })
    } else {
      toast.error('Quality check failed', { description: result.failureReason })
    }
  },

  approveRefundForReturn: (id, notes) => {
    const at = nowIso()
    const record = get().returns.find((item) => item.id === id)
    if (!record) return
    const linked = get().refunds.find((refund) => refund.returnHandle === id)
    const raised = linked ?? refundFromReturn(record, 'approved', at)

    set((state) => ({
      refunds: linked
        ? state.refunds.map((refund) =>
            refund.id === linked.id
              ? {
                  ...refund,
                  stage: 'approved' as const,
                  approvedAt: refund.approvedAt ?? at,
                  adminNotes: notes || refund.adminNotes,
                  events: withEvent(refund.events, 'approved', notes || 'Approved for processing'),
                }
              : refund,
          )
        : [...state.refunds, raised],
      returns: state.returns.map((item) =>
        item.id === id
          ? {
              ...item,
              stage: 'refund_pending' as const,
              refundId: raised.refundId,
              events: withEvent(item.events, 'refund_pending'),
            }
          : item,
      ),
    }))

    toast.success('Refund approved', { description: 'The platform has been asked to process it.' })
  },

  processRefund: (refundId, input) => {
    const at = nowIso()
    set((state) => ({
      refunds: state.refunds.map((refund) =>
        refund.id === refundId
          ? {
              ...refund,
              stage: 'processing' as const,
              refundAmount: input.amount,
              approvedAt: refund.approvedAt ?? at,
              adminNotes: input.notes || refund.adminNotes,
              events: [
                ...refund.events.filter((event) => event.key !== 'approved' && event.key !== 'processing'),
                { key: 'approved', at, note: 'Approved for processing' },
                { key: 'processing', at, note: 'Sent to the payment gateway' },
              ],
            }
          : refund,
      ),
    }))
    toast.success('Refund processing', { description: 'The gateway has been asked to reverse the amount.' })
  },

  completeRefund: (refundId, input) => {
    const at = nowIso()
    const refund = get().refunds.find((item) => item.id === refundId)
    if (!refund) return

    set((state) => ({
      refunds: state.refunds.map((item) =>
        item.id === refundId
          ? {
              ...item,
              stage: 'completed' as const,
              refundReference: input.refundReference || item.refundReference,
              transactionReference: input.transactionReference || item.transactionReference,
              processedAt: input.processedAt || at,
              adminNotes: input.notes || item.adminNotes,
              failureReason: null,
              events: withEvent(item.events, 'completed', input.transactionReference || 'Credited to the customer'),
            }
          : item,
      ),
      returns: state.returns.map((record) =>
        record.returnId === refund.returnId
          ? { ...record, stage: 'refund_completed' as const, events: withEvent(record.events, 'refund_completed') }
          : record,
      ),
    }))

    toast.success('Refund completed', { description: `${refundStageLabel('completed')} · ${refund.refundId}` })
  },

  rejectRefund: (refundId, input) => {
    set((state) => ({
      refunds: state.refunds.map((refund) =>
        refund.id === refundId
          ? {
              ...refund,
              stage: 'rejected' as const,
              adminNotes: input.notes || refund.adminNotes,
              failureReason: input.reason,
              events: withEvent(refund.events, 'rejected', input.reason),
            }
          : refund,
      ),
    }))
    toast.error('Refund rejected', { description: input.reason })
  },
}))
