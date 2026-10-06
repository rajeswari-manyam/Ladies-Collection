import {
  normaliseShipmentStatus,
  shipmentOrderId,
  shipmentOrderNumber,
  type Shipment as ApiShipment,
  type ShipmentStatus as ApiShipmentStatus,
} from '@/services/shipment.service'
import type { Shipment, ShipmentStatus } from '@/types'
import type { VendorShipment } from '@/features/vendor/data/vendor-portal'

/**
 * Portal statuses are hyphenated (`in-transit`) while the API uses snake_case
 * (`in_transit`), so map across rather than trusting the raw value.
 */
const STATUS_MAP: Record<string, ShipmentStatus> = {
  pending: 'pending',
  shipment_created: 'pending',
  pickup_requested: 'pending',
  picked_up: 'picked_up',
  in_transit: 'in-transit',
  out_for_delivery: 'out-for-delivery',
  delivered: 'delivered',
  returned: 'returned',
  failed: 'failed',
}

export function toPortalShipmentStatus(status: string): ShipmentStatus {
  return STATUS_MAP[normaliseShipmentStatus(status)] ?? 'pending'
}

/**
 * Portal status back to the value the shipment API accepts. The API is
 * snake_case and rejects hyphens, so this is mostly a casing fix.
 */
export function toApiShipmentStatus(status: string): ApiShipmentStatus {
  return normaliseShipmentStatus(status) as ApiShipmentStatus
}

function etaDate(shipment: ApiShipment): string | null {
  return shipment.estimatedDeliveryDate ?? null
}

/** Adapts the API shipment to the `Shipment` shape the admin portal renders. */
export function toPortalShipment(shipment: ApiShipment): Shipment {
  return {
    id: shipment._id,
    shipmentId: shipment.shipmentId ?? shipment.awbNumber ?? '—',
    orderId: shipmentOrderId(shipment),
    orderNumber: shipmentOrderNumber(shipment) ?? '',
    carrier: shipment.courier,
    trackingNumber: shipment.trackingNumber ?? shipment.awbNumber ?? '',
    origin: '—',
    destination: '—',
    status: toPortalShipmentStatus(shipment.shipmentStatus),
    estDelivery: etaDate(shipment),
    createdAt: shipment.createdAt,
  }
}

/** Adapts the API shipment to the `VendorShipment` shape the vendor portal renders. */
export function toVendorShipment(shipment: ApiShipment): VendorShipment {
  return {
    id: shipment._id,
    shipmentId: shipment.shipmentId ?? shipment.awbNumber ?? '—',
    orderId: shipmentOrderId(shipment),
    orderNumber: shipmentOrderNumber(shipment) ?? '',
    carrier: shipment.courier,
    trackingNumber: shipment.trackingNumber ?? shipment.awbNumber ?? '',
    origin: '—',
    destination: '—',
    status: toPortalShipmentStatus(shipment.shipmentStatus),
    apiStatus: shipment.shipmentStatus,
    awbNumber: shipment.awbNumber ?? null,
    pickupDate: shipment.pickupDate ?? null,
    dispatchDate: shipment.dispatchDate ?? null,
    deliveredDate: shipment.deliveredDate ?? null,
    trackingEvents: shipment.trackingEvents ?? [],
    estDelivery: etaDate(shipment),
    createdAt: shipment.createdAt,
  }
}

/** API status strings offered in the vendor/admin status pickers. */
export const API_SHIPMENT_STATUSES = [
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'returned',
  'failed',
] as const
