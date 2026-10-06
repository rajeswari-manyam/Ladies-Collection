import { apiRequest } from '@/services/http'

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'failed'

export interface ShipmentTrackingEvent {
  status: string
  location: string
  timestamp: string
  description: string
}

/** `orderId` comes back as a plain id on list endpoints and populated on single reads. */
export interface ShipmentOrderRef {
  _id: string
  orderNumber?: string
}

export interface ShipmentVendorRef {
  _id: string
  businessName?: string
}

export interface Shipment {
  _id: string
  orderId: string | ShipmentOrderRef
  vendorId: string | ShipmentVendorRef
  courier: string
  awbNumber: string | null
  trackingNumber: string | null
  /** Courier's own id, e.g. `MOCK-DTDC-SHP-533893`. */
  shipmentId: string | null
  shipmentStatus: ShipmentStatus
  pickupDate: string | null
  dispatchDate: string | null
  estimatedDeliveryDate: string | null
  deliveredDate: string | null
  trackingEvents: ShipmentTrackingEvent[]
  createdAt: string
  updatedAt: string
}

export interface CreateShipmentInput {
  orderId: string
  vendorId: string
  weight: number
  length: number
  width: number
  height: number
  paymentMethod: string
}

export interface CourierSummary {
  provider: string
  mode: string
  shipmentId: string
  awbNumber: string
  status: string
  pickupDate: string | null
  estimatedDeliveryDate: string | null
}

/**
 * One entry per vendor. When a shipment is actually created this carries the
 * persisted `shipment` plus the courier summary; when the vendor is skipped
 * (already shipped, or not part of the order) the entry is flat and carries
 * only a `reason`, so both shapes are optional.
 */
export interface CreateShipmentResult {
  vendorId: string
  skipped: boolean
  reason?: string
  awbNumber?: string | null
  shipmentId?: string | null
  shipment?: Shipment
  courier?: CourierSummary
}

/**
 * `create-shipment` puts `provider`/`mode` alongside `data`, so the envelope
 * must be kept intact — unwrapping would silently drop the courier info.
 */
export interface CreateShipmentEnvelope {
  success: boolean
  message: string
  provider: string
  mode: string
  data: CreateShipmentResult[]
}

export interface UpdateShipmentStatusInput {
  shipmentStatus: ShipmentStatus
  location?: string
  description?: string
}

export interface RequestPickupInput {
  shipmentId: string
  pickupDate: string
  remarks?: string
}

/**
 * `shippingpickup` returns the updated shipment under `data` and the courier's
 * pickup confirmation as a *top-level* `courier` object — a name that collides
 * with `Shipment.courier` (the courier name), so they are kept separate here.
 */
export interface RequestPickupEnvelope {
  success: boolean
  data: Shipment
  courier: CourierSummary & {
    success?: boolean
    pickupRequestId?: string
    remarks?: string
  }
}

export interface TrackEvent {
  status: string
  statusDescription: string
  timestamp: string
}

export interface TrackingResponse {
  provider: string
  mode: string
  awbNumber: string
  status: string
  statusDescription: string
  statusUpdatedAt: string
  estimatedDeliveryDate: string | null
  events: TrackEvent[]
  shipment: {
    id: string
    orderId: string
    vendorId: string
    courier: string
    shipmentStatus: ShipmentStatus
    estimatedDeliveryDate: string | null
    deliveredDate: string | null
    trackingEvents: ShipmentTrackingEvent[]
  } | null
  persisted: boolean
}

export interface PaginatedShipments {
  shipments: Shipment[]
  total: number
  page: number
  totalPages: number
}

export async function createShipment(token: string, input: CreateShipmentInput): Promise<CreateShipmentEnvelope> {
  return apiRequest<CreateShipmentEnvelope>({
    method: 'POST',
    url: '/create-shipment',
    data: input,
    token,
    unwrap: false,
  })
}

export async function getShipment(token: string, shipmentId: string): Promise<Shipment> {
  return apiRequest<Shipment>({ method: 'GET', url: `/shipment/${shipmentId}`, token })
}

export async function getShipmentsByOrder(token: string, orderId: string): Promise<Shipment[]> {
  return apiRequest<Shipment[]>({ method: 'GET', url: `/shipment/order/${orderId}`, token })
}

export async function getVendorShipments(token: string, page = 1, limit = 20): Promise<PaginatedShipments> {
  return apiRequest<PaginatedShipments>({
    method: 'GET',
    url: `/shipment/vendor?page=${page}&limit=${limit}`,
    token,
  })
}

export async function updateShipmentStatus(
  token: string,
  shipmentId: string,
  input: UpdateShipmentStatusInput,
): Promise<Shipment> {
  return apiRequest<Shipment>({
    method: 'PUT',
    url: `/shipment/${shipmentId}/status`,
    data: input,
    token,
  })
}

export async function requestPickup(token: string, input: RequestPickupInput): Promise<RequestPickupEnvelope> {
  return apiRequest<RequestPickupEnvelope>({
    method: 'POST',
    url: '/shippingpickup',
    data: input,
    token,
    unwrap: false,
  })
}

/** Courier tracking by AWB number. Requires an authenticated session. */
export async function trackByAwb(token: string, awbNumber: string): Promise<TrackingResponse> {
  return apiRequest<TrackingResponse>({
    method: 'GET',
    url: `/shippingtrack/${encodeURIComponent(awbNumber)}`,
    token,
  })
}

// ─── Normalisers ───

export function shipmentOrderId(shipment: Shipment): string {
  return typeof shipment.orderId === 'string' ? shipment.orderId : shipment.orderId?._id ?? ''
}

export function shipmentOrderNumber(shipment: Shipment): string | undefined {
  return typeof shipment.orderId === 'object' ? shipment.orderId?.orderNumber : undefined
}

export function shipmentVendorId(shipment: Shipment): string {
  return typeof shipment.vendorId === 'string' ? shipment.vendorId : shipment.vendorId?._id ?? ''
}

export function shipmentVendorName(shipment: Shipment): string | undefined {
  return typeof shipment.vendorId === 'object' ? shipment.vendorId?.businessName : undefined
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  returned: 'Returned',
  failed: 'Failed',
}

export function shipmentStatusLabel(status: string): string {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status]
  return status.replace(/_/g, ' ').toLowerCase()
}

/**
 * Courier tracking events arrive with mixed casing (`in_transit` and
 * `IN_TRANSIT` both occur), so normalise before comparing.
 */
export function normaliseShipmentStatus(status: string): string {
  return status.toLowerCase().replace(/[\s-]+/g, '_')
}

/**
 * Courier events use their own vocabulary (`SHIPMENT_CREATED`,
 * `PICKUP_REQUESTED`, sometimes even "Shipment created") rather than the
 * shipment's own statuses, so fold them onto the milestone set.
 */
const EVENT_TO_MILESTONE: Record<string, string> = {
  shipment_created: 'pending',
  shipment_registered: 'pending',
  pickup_requested: 'pending',
  booking_confirmed: 'pending',
  manifest_generated: 'pending',
  picked_up: 'picked_up',
  dispatched: 'in_transit',
  in_transit: 'in_transit',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  returned: 'returned',
  failed: 'failed',
}

export function shipmentEventMilestone(eventStatus: string): string {
  const normalised = normaliseShipmentStatus(eventStatus)
  return EVENT_TO_MILESTONE[normalised] ?? normalised
}

/** The furthest milestone reached, derived from the courier event history. */
export function shipmentMilestone(shipment: Shipment): string {
  const order = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed']
  const seen = new Set<string>([shipmentEventMilestone(shipment.shipmentStatus)])
  for (const event of shipment.trackingEvents ?? []) seen.add(shipmentEventMilestone(event.status))
  let best = 'pending'
  for (const milestone of order) if (seen.has(milestone)) best = milestone
  return best
}
