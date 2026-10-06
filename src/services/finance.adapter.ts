import type { Payment } from '@/services/payment.service'
import type { Refund } from '@/services/refund.service'
import type { ReturnRequest, CancellationPreview } from '@/services/return.service'
import type { Settlement } from '@/services/settlement.service'
import type {
  FinanceTimelineStep,
  FinanceTimelineTone,
  RefundTimeline,
  SettlementStatus,
  SettlementTimeline,
} from '@/types/finance.types'
import { isTerminalOrder } from '@/components/common/workflow-status'
import { isDeadlinePassed } from '@/utils'

/**
 * Read-only helpers that turn API responses into view values.
 *
 * Two rules hold everywhere in this file:
 *  1. An amount displayed here was read off the response. Nothing is summed,
 *     netted or scaled — the backend owns every financial figure.
 *  2. A date displayed here came off the response. A stage with no timestamp
 *     renders as "Pending", never as a fabricated date.
 */

/** Unwraps a populated reference (`{ _id, … }`) or a bare id. */
export function refId(value: string | { _id?: string } | null | undefined): string {
  if (!value) return ''
  return typeof value === 'string' ? value : (value._id ?? '')
}

export function refName(value: string | { name?: string | null; businessName?: string | null } | null | undefined) {
  if (!value) return null
  if (typeof value === 'string') return null
  return value.businessName ?? value.name ?? null
}

export function refOrderNumber(value: string | { orderNumber?: string | null } | null | undefined) {
  if (!value || typeof value === 'string') return null
  return value.orderNumber ?? null
}

/** Backend amount, or null when the API did not report one. Never defaulted. */
export function money(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** A timestamp only if the API actually sent a usable one. */
export function stamp(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  return Number.isNaN(new Date(value).getTime()) ? null : value
}

/**
 * Whether a backend deadline has passed. Compares two timestamps the API gave
 * us against "now" — it never produces a date to display.
 */
export function isPast(deadline: string | null | undefined): boolean {
  return isDeadlinePassed(deadline)
}

// ─── Payment view ───

export interface PaymentView {
  id: string
  /** Id used by the payment details route — the gateway id when the API sends one. */
  routeId: string
  paymentId: string | null
  orderId: string
  orderNumber: string | null
  orderDate: string | null
  paymentDate: string | null
  paymentMethod: string | null
  amountPaid: number
  finalAmount: number | null
  paymentStatus: string | null
  refundAmount: number | null
  refundStatus: string | null
  refundDate: string | null
  refundRequestedAt: string | null
  refundInitiatedAt: string | null
  refundTransactionReference: string | null
  refundId: string | null
  hasRefund: boolean
}

export function toPaymentView(payment: Payment): PaymentView {
  const refundId = payment.refundId ?? null
  const refundAmount = money(payment.refundAmount)
  return {
    id: payment._id,
    routeId: payment.paymentId ?? payment._id,
    paymentId: payment.paymentId ?? null,
    orderId: refId(payment.orderId),
    orderNumber: payment.orderNumber ?? refOrderNumber(payment.orderId),
    orderDate: stamp(payment.orderDate),
    paymentDate: stamp(payment.paymentDate ?? payment.createdAt),
    paymentMethod: payment.paymentMethod ?? null,
    amountPaid: money(payment.amountPaid) ?? 0,
    finalAmount: money(payment.finalAmount),
    paymentStatus: payment.paymentStatus ?? null,
    refundAmount,
    refundStatus: payment.refundStatus ?? null,
    refundDate: stamp(payment.refundDate),
    refundRequestedAt: stamp(payment.refundRequestedAt),
    refundInitiatedAt: stamp(payment.refundInitiatedAt),
    refundTransactionReference: payment.refundTransactionReference ?? null,
    refundId,
    hasRefund: Boolean(refundId) || (refundAmount !== null && refundAmount > 0),
  }
}

// ─── Refund view ───

export interface RefundView {
  id: string
  /** Id used by the refund details route. */
  routeId: string
  refundNumber: string | null
  orderId: string
  orderNumber: string | null
  orderDate: string | null
  productName: string | null
  vendorName: string | null
  quantity: number
  originalPaymentAmount: number | null
  refundAmount: number | null
  finalAmount: number | null
  refundReason: string | null
  refundStatus: string
  refundRequestedAt: string | null
  refundInitiatedAt: string | null
  refundCompletedAt: string | null
  refundReference: string | null
  failureReason: string | null
  returnId: string | null
}

export function toRefundView(refund: Refund): RefundView {
  const lineNames = (refund.items ?? [])
    .map((line) => line.productName)
    .filter((name): name is string => Boolean(name))
  return {
    id: refund._id,
    routeId: refund.refundNumber ?? refund._id,
    refundNumber: refund.refundNumber ?? null,
    orderId: refId(refund.orderId),
    orderNumber: refund.orderNumber ?? refOrderNumber(refund.orderId),
    orderDate: stamp(refund.orderDate),
    productName: refund.productName ?? (lineNames.length ? lineNames.join(', ') : null),
    vendorName: refund.vendorName ?? refName(refund.vendorId),
    quantity: refund.quantity ?? refund.items?.reduce((sum, line) => sum + (line.quantity ?? 0), 0) ?? 0,
    originalPaymentAmount: money(refund.originalPaymentAmount),
    refundAmount: money(refund.refundAmount),
    finalAmount: money(refund.finalAmount),
    refundReason: refund.refundReason ?? null,
    refundStatus: String(refund.refundStatus ?? 'requested'),
    refundRequestedAt: stamp(refund.refundRequestedAt ?? refund.createdAt),
    refundInitiatedAt: stamp(refund.refundInitiatedAt),
    refundCompletedAt: stamp(refund.refundCompletedAt ?? refund.refundDate),
    refundReference: refund.refundReference ?? null,
    failureReason: refund.failureReason ?? null,
    returnId: refund.returnId ?? null,
  }
}

// ─── Timelines ───

interface StageSpec {
  key: string
  label: string
  at: string | null | undefined
  note?: string | null
}

interface TimelineOptions {
  /** Stages to draw even without a timestamp, as "Pending". */
  alwaysInclude?: string[]
  /** Key of the stage the record is currently sitting on. */
  currentKey?: string | null
  /** Key of the stage where the flow failed, drawn in the failed tone. */
  failedKey?: string | null
}

function buildSteps(stages: StageSpec[], options: TimelineOptions): FinanceTimelineStep[] {
  const include = new Set(options.alwaysInclude ?? [])
  const present = stages.filter((stage) => stage.at || include.has(stage.key))
  const firstPending = present.findIndex((stage) => !stage.at)

  return present.map((stage, index) => {
    const at = stamp(stage.at)
    let tone: FinanceTimelineTone
    if (at) tone = 'done'
    else if (options.failedKey && stage.key === options.failedKey) tone = 'failed'
    else if (stage.key === options.currentKey || index === firstPending) tone = 'current'
    else tone = 'upcoming'
    return { key: stage.key, label: stage.label, at, tone, note: stage.note ?? null }
  })
}

export interface TimelineSource {
  orderPlacedAt?: string | null
  paymentConfirmedAt?: string | null
  shipmentCreatedAt?: string | null
  dispatchedAt?: string | null
  deliveredAt?: string | null
  returnRequestedAt?: string | null
  returnApprovedAt?: string | null
  returnRejectedAt?: string | null
  pickupScheduledAt?: string | null
  pickedUpAt?: string | null
  returnReceivedAt?: string | null
  refundInitiatedAt?: string | null
  refundCompletedAt?: string | null
  settlementEligibleAt?: string | null
  settlementProcessedAt?: string | null
  settlementPaidAt?: string | null
}

/** Labels for every stage the order → refund → settlement flow can pass. */
const STAGE_LABELS: Record<keyof TimelineSource, string> = {
  orderPlacedAt: 'Order placed',
  paymentConfirmedAt: 'Payment confirmed',
  shipmentCreatedAt: 'Shipment created',
  dispatchedAt: 'Shipment dispatched',
  deliveredAt: 'Order delivered',
  returnRequestedAt: 'Return requested',
  returnApprovedAt: 'Return approved',
  returnRejectedAt: 'Return rejected',
  pickupScheduledAt: 'Pickup scheduled',
  pickedUpAt: 'Product picked up',
  returnReceivedAt: 'Return received',
  refundInitiatedAt: 'Refund initiated',
  refundCompletedAt: 'Refund completed',
  settlementEligibleAt: 'Settlement eligible',
  settlementProcessedAt: 'Settlement processed',
  settlementPaidAt: 'Settlement paid',
}

type StageKey = keyof TimelineSource

function sourceStages(source: TimelineSource, keys: StageKey[]): StageSpec[] {
  return keys.map((key) => ({ key, label: STAGE_LABELS[key], at: source[key] }))
}

/** Stages covering delivery, the return leg and the refund. */
export const REFUND_STAGE_KEYS: StageKey[] = [
  'orderPlacedAt',
  'paymentConfirmedAt',
  'shipmentCreatedAt',
  'dispatchedAt',
  'deliveredAt',
  'returnRequestedAt',
  'returnApprovedAt',
  'pickupScheduledAt',
  'pickedUpAt',
  'returnReceivedAt',
  'refundInitiatedAt',
  'refundCompletedAt',
]

/** Stages covering delivery, the return window and the payout. */
export const SETTLEMENT_STAGE_KEYS: StageKey[] = [
  'orderPlacedAt',
  'deliveredAt',
  'returnRequestedAt',
  'returnApprovedAt',
  'pickedUpAt',
  'returnReceivedAt',
  'refundCompletedAt',
  'settlementEligibleAt',
  'settlementProcessedAt',
  'settlementPaidAt',
]

/**
 * The timeline keys a return record implies, so a rejected return or a failed
 * refund is drawn as failed rather than as still-pending.
 */
function returnOutcomeKeys(status: string | null | undefined) {
  const value = (status ?? '').toLowerCase()
  return {
    currentKey:
      value === 'rejected'
        ? 'returnRejectedAt'
        : value === 'approved'
          ? 'returnApprovedAt'
          : value === 'pickup_scheduled'
            ? 'pickupScheduledAt'
            : value === 'picked_up'
              ? 'pickedUpAt'
              : value === 'received'
                ? 'returnReceivedAt'
                : 'returnRequestedAt',
    failedKey: value === 'rejected' ? 'returnApprovedAt' : null,
  }
}

export function timelineFromReturn(
  record: ReturnRequest,
  orderPlacedAt?: string | null,
): RefundTimeline {
  const { currentKey, failedKey } = returnOutcomeKeys(record.returnStatus)
  return buildSteps(
    sourceStages(
      {
        orderPlacedAt,
        deliveredAt: record.deliveredAt,
        returnRequestedAt: record.returnRequestedAt ?? record.createdAt,
        returnApprovedAt: record.returnApprovedAt,
        returnRejectedAt: record.returnRejectedAt,
        pickupScheduledAt: record.pickupScheduledAt,
        pickedUpAt: record.pickedUpAt,
        returnReceivedAt: record.returnReceivedAt,
        refundInitiatedAt: record.refundInitiatedAt,
        refundCompletedAt: record.refundCompletedAt,
      },
      REFUND_STAGE_KEYS,
    ),
    { currentKey, failedKey },
  )
}

/**
 * Every dated stage of a return, including the ones that have not happened yet.
 * Used by the "Return tracking" panel, where an undated stage reads "Pending"
 * rather than disappearing from the list.
 */
export function returnDateStages(record: ReturnRequest): RefundTimeline {
  const { currentKey, failedKey } = returnOutcomeKeys(record.returnStatus)
  return buildSteps(
    sourceStages(
      {
        deliveredAt: record.deliveredAt,
        returnRequestedAt: record.returnRequestedAt ?? record.createdAt,
        returnApprovedAt: record.returnApprovedAt,
        returnRejectedAt: record.returnRejectedAt,
        pickupScheduledAt: record.pickupScheduledAt,
        pickedUpAt: record.pickedUpAt,
        returnReceivedAt: record.returnReceivedAt,
        refundInitiatedAt: record.refundInitiatedAt,
        refundCompletedAt: record.refundCompletedAt,
      },
      REFUND_STAGE_KEYS.filter((key) => key !== 'orderPlacedAt'),
    ),
    { alwaysInclude: REFUND_STAGE_KEYS, currentKey, failedKey },
  )
}

export function timelineFromRefund(
  refund: Refund,
  record?: ReturnRequest | null,
  orderPlacedAt?: string | null,
): RefundTimeline {
  const failed = String(refund.refundStatus ?? '').toLowerCase() === 'failed'
  return buildSteps(
    sourceStages(
      {
        orderPlacedAt,
        deliveredAt: record?.deliveredAt ?? null,
        returnRequestedAt: record?.returnRequestedAt ?? null,
        returnApprovedAt: record?.returnApprovedAt ?? null,
        pickupScheduledAt: record?.pickupScheduledAt ?? null,
        pickedUpAt: record?.pickedUpAt ?? null,
        returnReceivedAt: record?.returnReceivedAt ?? null,
        refundInitiatedAt: refund.refundInitiatedAt,
        refundCompletedAt: refund.refundCompletedAt,
      },
      REFUND_STAGE_KEYS,
    ),
    {
      currentKey: failed ? null : 'refundInitiatedAt',
      failedKey: failed ? 'refundCompletedAt' : null,
    },
  )
}

export function timelineFromSettlement(
  settlement: Settlement,
  orderPlacedAt?: string | null,
): SettlementTimeline {
  const status = String(settlement.settlementStatus ?? '').toLowerCase()
  return buildSteps(
    sourceStages(
      {
        orderPlacedAt,
        deliveredAt: settlement.deliveredAt,
        returnRequestedAt: settlement.returnRequestedAt,
        returnApprovedAt: settlement.returnApprovedAt,
        pickedUpAt: settlement.pickedUpAt,
        returnReceivedAt: settlement.returnedAt,
        refundCompletedAt: settlement.refundCompletedAt,
        settlementEligibleAt: settlement.settlementEligibleAt,
        settlementProcessedAt: settlement.settlementProcessedAt,
        settlementPaidAt: settlement.settlementPaidAt,
      },
      SETTLEMENT_STAGE_KEYS,
    ),
    {
      currentKey: status === 'paid' ? null : 'settlementEligibleAt',
      failedKey: status === 'failed' ? 'settlementPaidAt' : null,
    },
  )
}

// ─── Cancellation ───

export interface CancellationDecision {
  allowed: boolean
  reason: string | null
  amountPaid: number | null
  refundAmount: number | null
  paymentStatus: string | null
  refundStatus: string | null
}

/**
 * Whether the customer may cancel. The backend's own answer wins whenever it
 * gives one; otherwise the order's status is the signal, since the order API
 * only stores statuses a cancellation can move away from.
 */
export function cancellationDecision(
  order: { orderStatus: string; paymentStatus?: string | null } | null | undefined,
  preview?: CancellationPreview | null,
): CancellationDecision {
  if (preview) {
    return {
      allowed: Boolean(preview.cancellationAllowed),
      reason: preview.blockedReason ?? null,
      amountPaid: money(preview.amountPaid),
      refundAmount: money(preview.refundAmount),
      paymentStatus: preview.paymentStatus ?? null,
      refundStatus: preview.refundStatus ?? null,
    }
  }
  if (!order) {
    return {
      allowed: false,
      reason: null,
      amountPaid: null,
      refundAmount: null,
      paymentStatus: null,
      refundStatus: null,
    }
  }
  const cancellable = !isTerminalOrder(order.orderStatus) && order.orderStatus !== 'delivered'
  return {
    allowed: cancellable,
    reason: cancellable
      ? null
      : isTerminalOrder(order.orderStatus)
        ? 'This order has already been closed.'
        : 'Delivered orders cannot be cancelled — request a return instead.',
    amountPaid: null,
    refundAmount: null,
    paymentStatus: order.paymentStatus ?? null,
    refundStatus: null,
  }
}

// ─── Settlement actions ───

export interface SettlementActions {
  canProcess: boolean
  canMarkPaid: boolean
  canMarkFailed: boolean
}

/** Which admin payout actions the record's own status permits. */
export function settlementActions(status: string | null | undefined): SettlementActions {
  const key = String(status ?? '').toLowerCase() as SettlementStatus
  return {
    canProcess: key === 'pending' || key === 'eligible',
    canMarkPaid: key === 'processing' || key === 'processed',
    canMarkFailed: key === 'processing' || key === 'processed',
  }
}
