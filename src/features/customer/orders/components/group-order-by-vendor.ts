import type { Order, OrderItem } from '@/services/order.service'
import { shipmentVendorId, shipmentVendorName, type Shipment } from '@/services/shipment.service'

export interface VendorGroup {
  vendorId: string
  /** Best name available: a populated shipment ref, else a short id. */
  vendorName: string
  items: OrderItem[]
  /** Only this vendor's parcels — a multi-vendor order ships them separately. */
  shipments: Shipment[]
  /** Per-vendor status from the order's `vendorMappings`, when the API sends it. */
  mappingStatus?: string
}

/** Reads a vendor's display name off a shipment when the API populated the ref. */
function vendorNameFor(vendorId: string, shipments: Shipment[]): string {
  const match = shipments.find((s) => shipmentVendorId(s) === vendorId)
  const name = match ? shipmentVendorName(match) : undefined
  if (name) return name
  return vendorId ? `Vendor ${vendorId.slice(-6)}` : 'Vendor'
}

/**
 * Splits an order into one group per vendor. Items carry their own `vendorId`
 * and shipments are keyed by vendor, so the two are matched directly — a
 * multi-vendor order is never assumed to move as a single parcel.
 */
export function groupOrderByVendor(order: Order, shipments: Shipment[] = []): VendorGroup[] {
  const groups = new Map<string, VendorGroup>()

  for (const item of order.items ?? []) {
    const vendorId = item.vendorId ?? ''
    const group = groups.get(vendorId) ?? {
      vendorId,
      vendorName: vendorNameFor(vendorId, shipments),
      items: [],
      shipments: [],
      mappingStatus: order.vendorMappings?.find((m) => m.vendorId === vendorId)?.status,
    }
    group.items.push(item)
    groups.set(vendorId, group)
  }

  for (const shipment of shipments) {
    const vendorId = shipmentVendorId(shipment)
    const group = groups.get(vendorId)
    if (group) group.shipments.push(shipment)
  }

  return [...groups.values()]
}
