import { normaliseShipmentStatus } from '@/services/shipment.service'
import type { StatusTone } from '@/components/common/workflow-status'

/**
 * Friendly labels for the refund, return and settlement vocabularies.
 *
 * The keys are the values the API stores. The values are what the customer, the
 * vendor and the admin read — the underlying status string is never rewritten
 * anywhere else, so a status can only ever look one way across the app.
 */

function clean(value: string | null | undefined): string {
  return normaliseShipmentStatus(value ?? '')
}

function degrade(key: string): string {
  return key ? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'Unknown'
}

// ─── Refund ───

const REFUND_LABELS: Record<string, string> = {
  requested: 'Refund Requested',
  pending: 'Refund Requested',
  processing: 'Refund Processing',
  initiated: 'Refund Processing',
  completed: 'Refund Completed',
  refunded: 'Refund Completed',
  failed: 'Refund Failed',
  cancelled: 'Refund Cancelled',
}

const REFUND_TONES: Record<string, StatusTone> = {
  requested: 'warning',
  pending: 'warning',
  processing: 'info',
  initiated: 'info',
  completed: 'success',
  refunded: 'success',
  failed: 'destructive',
  cancelled: 'neutral',
}

export function refundStatusText(status: string | null | undefined): string {
  const key = clean(status)
  return REFUND_LABELS[key] ?? degrade(key)
}

export function refundStatusTone(status: string | null | undefined): StatusTone {
  return REFUND_TONES[clean(status)] ?? 'neutral'
}

/** True when the API has moved the refund past "requested". */
export function isRefundOpen(status: string | null | undefined): boolean {
  const key = clean(status)
  return key === 'requested' || key === 'pending' || key === 'processing' || key === 'initiated'
}

export function isRefundSettled(status: string | null | undefined): boolean {
  const key = clean(status)
  return key === 'completed' || key === 'refunded'
}

// ─── Return ───

const RETURN_LABELS: Record<string, string> = {
  requested: 'Return requested',
  approved: 'Return approved',
  rejected: 'Return rejected',
  pickup_scheduled: 'Pickup scheduled',
  picked_up: 'Picked up',
  received: 'Return received',
  refund_initiated: 'Refund initiated',
  refund_completed: 'Refund completed',
  cancelled: 'Return cancelled',
  completed: 'Return completed',
}

const RETURN_TONES: Record<string, StatusTone> = {
  requested: 'warning',
  approved: 'info',
  rejected: 'destructive',
  pickup_scheduled: 'info',
  picked_up: 'info',
  received: 'info',
  refund_initiated: 'rose',
  refund_completed: 'success',
  cancelled: 'neutral',
  completed: 'success',
}

export function returnStatusText(status: string | null | undefined): string {
  const key = clean(status)
  return RETURN_LABELS[key] ?? degrade(key)
}

export function returnStatusTone(status: string | null | undefined): StatusTone {
  return RETURN_TONES[clean(status)] ?? 'neutral'
}

// ─── Settlement ───

const SETTLEMENT_LABELS: Record<string, string> = {
  pending: 'Pending',
  eligible: 'Eligible',
  processing: 'Processing',
  processed: 'Processed',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

const SETTLEMENT_TONES: Record<string, StatusTone> = {
  pending: 'warning',
  eligible: 'info',
  processing: 'info',
  processed: 'info',
  paid: 'success',
  failed: 'destructive',
  cancelled: 'neutral',
}

export function settlementStatusText(status: string | null | undefined): string {
  const key = clean(status)
  return SETTLEMENT_LABELS[key] ?? degrade(key)
}

export function settlementStatusTone(status: string | null | undefined): StatusTone {
  return SETTLEMENT_TONES[clean(status)] ?? 'neutral'
}
