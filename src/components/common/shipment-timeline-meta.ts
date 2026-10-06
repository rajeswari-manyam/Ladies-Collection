import { shipmentEventMilestone, type Shipment } from '@/services/shipment.service'
import { formatDateTime } from '@/utils'

/**
 * Timestamps for each step of a shipment timeline, taken from the courier's own
 * tracking events where they exist, falling back to the shipment's own dates.
 */
export function shipmentStepTimestamps(shipment: Shipment): Record<string, string | undefined> {
  const meta: Record<string, string | undefined> = {}
  const events = [...(shipment.trackingEvents ?? [])].sort(
    (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp),
  )
  for (const event of events) {
    const step = shipmentEventMilestone(event.status)
    if (!meta[step]) meta[step] = formatDateTime(event.timestamp)
  }
  if (!meta.pending && shipment.createdAt) meta.pending = `Booked ${formatDateTime(shipment.createdAt)}`
  if (!meta.in_transit && shipment.dispatchDate) meta.in_transit = `Dispatched ${formatDateTime(shipment.dispatchDate)}`
  if (!meta.delivered && shipment.deliveredDate) meta.delivered = `Delivered ${formatDateTime(shipment.deliveredDate)}`
  return meta
}
