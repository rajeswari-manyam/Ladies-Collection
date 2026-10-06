import { CircleDot, PackageCheck, Truck } from 'lucide-react'
import { shipmentMilestone, type Shipment } from '@/services/shipment.service'
import {
  shipmentStepIndex,
  shipmentStatusText,
  SHIPMENT_STEPS,
} from '@/components/common/workflow-status'
import { StatusProgressBar } from '@/components/common/status-timeline'
import { cn, formatDateTime } from '@/utils'

/** Most advanced parcel for an order, falling back to the most recently updated. */
function latestShipment(shipments: Shipment[] | undefined): Shipment | undefined {
  if (!shipments?.length) return undefined
  return [...shipments].sort(
    (a, b) =>
      shipmentStepIndex(shipmentMilestone(b)) - shipmentStepIndex(shipmentMilestone(a)) ||
      +new Date(b.updatedAt ?? b.createdAt ?? 0) - +new Date(a.updatedAt ?? a.createdAt ?? 0),
  )[0]
}

function iconFor(milestone: string) {
  if (milestone === 'delivered') return <PackageCheck className="size-3" />
  if (milestone === 'pending') return <CircleDot className="size-3" />
  return <Truck className="size-3" />
}

/**
 * Live courier progress for an order row: the furthest-along parcel's status,
 * its AWB, ETA, and a compact step bar. When a vendor has already created more
 * than one parcel, each one is listed separately so a multi-vendor order never
 * shows a single blended status.
 *
 * Returns null when nothing has been dispatched yet — the order lifecycle
 * timeline covers that phase.
 */
export function OrderShipmentStatus({ shipments }: { shipments: Shipment[] | undefined }) {
  if (!shipments?.length) return null

  const lead = latestShipment(shipments)
  if (!lead) return null

  const milestone = shipmentMilestone(lead)
  const closed = milestone === 'delivered' || milestone === 'returned' || milestone === 'failed'
  const lastEvent = [...(lead.trackingEvents ?? [])].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
  )[0]
  const extra = shipments.length - 1

  return (
    <div className="mt-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold',
            milestone === 'delivered'
              ? 'bg-emerald-100 text-emerald-700'
              : milestone === 'returned' || milestone === 'failed'
                ? 'bg-rose-100 text-rose-700'
                : milestone === 'pending'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-sky-100 text-sky-700',
          )}
        >
          {iconFor(milestone)}
          {shipmentStatusText(milestone)}
        </span>
        {lead.courier && <span className="text-muted-foreground">{lead.courier}</span>}
        {lead.awbNumber && <span className="font-mono text-muted-foreground">{lead.awbNumber}</span>}
        {extra > 0 && (
          <span className="text-muted-foreground">
            +{extra} other parcel{extra > 1 ? 's' : ''}
          </span>
        )}
        {lead.estimatedDeliveryDate && !closed && (
          <span className="text-muted-foreground">ETA {formatDateTime(lead.estimatedDeliveryDate)}</span>
        )}
      </div>

      {milestone !== 'returned' && milestone !== 'failed' && (
        <StatusProgressBar
          className="mt-2"
          steps={SHIPMENT_STEPS}
          currentIndex={shipmentStepIndex(milestone)}
        />
      )}

      {lastEvent?.description && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {lastEvent.description}
          {lastEvent.location ? ` · ${lastEvent.location}` : ''} · {formatDateTime(lastEvent.timestamp)}
        </p>
      )}
    </div>
  )
}
