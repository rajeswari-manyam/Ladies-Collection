import { normaliseShipmentStatus, shipmentStatusLabel } from '@/services/shipment.service'
import type { BadgeProps } from '@/components/ui/badge'

/**
 * Single source of truth for every workflow status shown in the app.
 *
 * Labels are keyed by the values the API actually stores, so a status can never
 * read one way on the bag and another way on the vendor screen. Anything unknown
 * degrades to a readable version of itself rather than hiding the value.
 *
 * The order API only accepts/stores these values (verified against
 * `PUT /updateorder/:id/status`): placed, payment_confirmed, processing,
 * in_transit, delivered, cancelled, refunded. There is deliberately no entry for
 * `confirmed`, `packed`, `ready_for_pickup` or an order-level `shipped`,
 * because the backend cannot store them.
 */
export type StatusTone = NonNullable<BadgeProps['variant']>

// ─── Order status ───

const ORDER_LABELS: Record<string, string> = {
  // `pending` is the portal's own word for a freshly placed order.
  pending: 'Pending',
  placed: 'Order placed',
  payment_confirmed: 'Payment confirmed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  in_transit: 'In transit',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const ORDER_TONES: Record<string, StatusTone> = {
  placed: 'neutral',
  payment_confirmed: 'info',
  confirmed: 'info',
  processing: 'info',
  packed: 'info',
  in_transit: 'warning',
  shipped: 'warning',
  out_for_delivery: 'rose',
  delivered: 'success',
  cancelled: 'neutral',
  refunded: 'destructive',
}

function clean(value: string | null | undefined): string {
  return normaliseShipmentStatus(value ?? '')
}

/** Human label for an order status, in the API's own vocabulary. */
export function orderStatusText(status: string | null | undefined): string {
  const key = clean(status)
  if (ORDER_LABELS[key]) return ORDER_LABELS[key]
  if (!key) return 'Unknown'
  return key.replace(/_/g, ' ')
}

export function orderStatusTone(status: string | null | undefined): StatusTone {
  return ORDER_TONES[clean(status)] ?? 'neutral'
}

// ─── Payment status ───

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Paid',
  paid: 'Paid',
  captured: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

const PAYMENT_TONES: Record<string, StatusTone> = {
  pending: 'warning',
  confirmed: 'success',
  paid: 'success',
  captured: 'success',
  failed: 'destructive',
  refunded: 'destructive',
}

export function paymentStatusText(status: string | null | undefined): string {
  const key = clean(status)
  if (PAYMENT_LABELS[key]) return PAYMENT_LABELS[key]
  return key ? key.replace(/_/g, ' ') : 'Unknown'
}

export function paymentStatusTone(status: string | null | undefined): StatusTone {
  return PAYMENT_TONES[clean(status)] ?? 'neutral'
}

// ─── Shipment status ───

const SHIPMENT_TONES: Record<string, StatusTone> = {
  pending: 'warning',
  picked_up: 'info',
  dispatched: 'info',
  in_transit: 'info',
  out_for_delivery: 'warning',
  delivered: 'success',
  returned: 'rose',
  failed: 'destructive',
}

/** Courier vocabulary the API may emit, folded onto the shipment step list. */
const SHIPMENT_STEP_ALIASES: Record<string, string> = {
  shipment_created: 'pending',
  shipment_registered: 'pending',
  pickup_requested: 'pending',
  booking_confirmed: 'pending',
  picked_up: 'picked_up',
  dispatched: 'in_transit',
  in_transit: 'in_transit',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
}

/** Courier status label, reusing the label table that ships with the service. */
export function shipmentStatusText(status: string | null | undefined): string {
  return shipmentStatusLabel(clean(status) || 'pending')
}

export function shipmentStatusTone(status: string | null | undefined): StatusTone {
  return SHIPMENT_TONES[clean(status)] ?? 'neutral'
}

// ─── Terminal states ───

/** Order statuses that end the order lifecycle early. */
export const TERMINAL_ORDER_STATUSES = ['cancelled', 'refunded']

/** Shipment statuses that end the delivery timeline before "Delivered". */
export const TERMINAL_SHIPMENT_STATUSES = ['returned', 'failed']

export function isTerminalOrder(status: string | null | undefined): boolean {
  return TERMINAL_ORDER_STATUSES.includes(clean(status))
}

export function isTerminalShipment(status: string | null | undefined): boolean {
  return TERMINAL_SHIPMENT_STATUSES.includes(clean(status))
}

export function isDeliveredShipment(status: string | null | undefined): boolean {
  return clean(status) === 'delivered'
}

export interface ShipmentTerminalState {
  label: string
  description: string
}

export interface OrderTerminalState {
  label: string
  description: string
}

/** Payment-gate wording for the order lifecycle, from the order's own status. */
export function orderTerminalState(status: string | null | undefined): OrderTerminalState | null {
  if (clean(status) === 'cancelled') {
    return { label: 'Order cancelled', description: 'Any amount paid is refunded to the original payment method.' }
  }
  if (clean(status) === 'refunded') {
    return { label: 'Order refunded', description: 'The refund has been initiated for this order.' }
  }
  return null
}

/**
 * `returned` and `failed` are terminal: the parcel stops moving, so a timeline
 * should end on the outcome rather than implying delivery is still ahead.
 */
export function shipmentTerminalState(status: string | null | undefined): ShipmentTerminalState | null {
  const key = clean(status)
  if (key === 'returned') {
    return {
      label: 'Shipment returned',
      description: 'The parcel was returned to the vendor and is no longer in transit.',
    }
  }
  if (key === 'failed') {
    return {
      label: 'Delivery failed',
      description: 'The courier could not complete this delivery. Please contact support.',
    }
  }
  return null
}

// ─── Steps ───

export interface StatusStep {
  key: string
  label: string
}

/**
 * Customer order lifecycle, limited to statuses the order API can store.
 * `in_transit` is the API's "shipped" state, and it is the last step before
 * delivery — the courier-side handover is tracked by the shipment timeline.
 */
export const ORDER_STEPS: StatusStep[] = [
  { key: 'placed', label: 'Order placed' },
  { key: 'payment_confirmed', label: 'Payment confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'in_transit', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

/** Courier handover, exactly the statuses the shipment API defines. */
export const SHIPMENT_STEPS: StatusStep[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
]

/** Folds statuses the API may emit onto the nearest step in `ORDER_STEPS`. */
const ORDER_STEP_ALIASES: Record<string, string> = {
  pending: 'placed',
  placed: 'placed',
  payment_confirmed: 'payment_confirmed',
  confirmed: 'payment_confirmed',
  processing: 'processing',
  packed: 'processing',
  in_transit: 'in_transit',
  shipped: 'in_transit',
  out_for_delivery: 'in_transit',
  delivered: 'delivered',
}

/** Index of the current step, or `-1` when the order has not started/has stopped. */
export function orderStepIndex(status: string | null | undefined): number {
  if (isTerminalOrder(status)) return -1
  const key = clean(status)
  const folded = ORDER_STEP_ALIASES[key] ?? 'placed'
  const index = ORDER_STEPS.findIndex((s) => s.key === folded)
  return index === -1 ? 0 : index
}

export function shipmentStepIndex(status: string | null | undefined): number {
  const key = clean(status)
  const folded = SHIPMENT_STEP_ALIASES[key] ?? key
  const index = SHIPMENT_STEPS.findIndex((s) => s.key === folded)
  if (index !== -1) return index
  // returned / failed (or anything unknown) sit at the end of the flow.
  return SHIPMENT_STEPS.length - 1
}
