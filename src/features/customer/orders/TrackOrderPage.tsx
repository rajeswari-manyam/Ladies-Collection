import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Loader2, MapPin, Package, Truck } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { useOrder, useOrderShipments, useTrackShipment } from '@/features/customer/hooks'
import { orderItemCount } from '@/services/order.service'
import { shipmentMilestone, type Shipment, type TrackingResponse } from '@/services/shipment.service'
import { OrderStatusChip, PaymentStatusChip } from '@/components/common/status-chips'
import { shipmentStatusText, shipmentTerminalState } from '@/components/common/workflow-status'

import { OrderProgressTimeline } from '@/features/customer/orders/components/order-progress-timeline'
import { ShipmentTimeline } from '@/components/common/shipment-timeline'
import { groupOrderByVendor } from '@/features/customer/orders/components/group-order-by-vendor'
import { PayNowButton } from '@/features/customer/orders/components/pay-now-button'
import { Button } from '@/components/ui/button'
import { cn, formatINR, formatDateTime } from '@/utils'

/** Newest parcel for the order — the one the customer is most likely tracking. */
function leadShipment(shipments: Shipment[] | undefined): Shipment | undefined {
  if (!shipments?.length) return undefined
  return [...shipments].sort(
    (a, b) => +new Date(b.createdAt ?? b.dispatchDate ?? 0) - +new Date(a.createdAt ?? a.dispatchDate ?? 0),
  )[0]
}

/**
 * The courier's tracking endpoint answers for one AWB at a time, so the live
 * response is folded onto that single parcel and the rest keep the persisted
 * status the shipment API returned.
 */
function withLiveTracking(shipment: Shipment, live?: TrackingResponse | null): Shipment {
  if (!live?.shipment || live.shipment.id !== shipment._id) return shipment
  return {
    ...shipment,
    ...live.shipment,
    orderId: shipment.orderId,
    vendorId: shipment.vendorId,
    courier: live.shipment.courier,
    awbNumber: live.awbNumber ?? shipment.awbNumber,
    trackingEvents: live.shipment.trackingEvents ?? shipment.trackingEvents ?? [],
    pickupDate: shipment.pickupDate,
    dispatchDate: shipment.dispatchDate,
    estimatedDeliveryDate: live.estimatedDeliveryDate ?? shipment.estimatedDeliveryDate,
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
  }
}

export function TrackOrderPage() {
  const { id } = useParams()
  const session = useAuthStore((s) => s.session)
  const { data: order, isLoading } = useOrder(id)
  const { data: shipments, isFetching } = useOrderShipments(order?._id)

  const lead = leadShipment(shipments)
  const awb = lead?.awbNumber ?? lead?.trackingNumber ?? null
  const { data: live, isFetching: isTracking } = useTrackShipment(awb)

  // Live courier status wins for the tracked parcel; siblings stay as persisted.
  const parcels = useMemo(
    () => (shipments ?? []).map((s) => (s._id === lead?._id ? withLiveTracking(s, live) : s)),
    [shipments, lead?._id, live],
  )

  const groups = useMemo(
    () => (order ? groupOrderByVendor(order, parcels) : []),
    [order, parcels],
  )

  if (!session) return <Navigate to="/shop/login?redirect=/shop/orders/mine" replace />

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading tracking…
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Package className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 font-serif text-2xl font-semibold text-foreground">Order not found</p>
        <Button asChild className="mt-5 rounded-full">
          <Link to="/shop/orders/mine">Back to my orders</Link>
        </Button>
      </div>
    )
  }

  const cancelled = order.orderStatus === 'cancelled'
  const eta = parcels.map((s) => s.estimatedDeliveryDate).filter(Boolean).sort()[0] ?? null
  const addr = order.shippingAddress

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <Link to="/shop/orders/mine" className="text-sm font-medium text-primary hover:underline">← My orders</Link>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Track order</h1>
        <OrderStatusChip status={order.orderStatus} />
        <PaymentStatusChip status={order.paymentStatus} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{order.orderNumber} · placed {formatDateTime(order.createdAt)}</p>

      {!cancelled && order.paymentStatus !== 'confirmed' && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Payment not confirmed — this order will not ship until it is paid.
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_240px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="font-serif text-lg font-bold text-foreground">Order progress</p>
            <OrderProgressTimeline order={order} className="mt-4" />

            {cancelled ? (
              <p className="mt-5 rounded-2xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                This order was cancelled. Any amount paid will be refunded within 5–7 business days.
              </p>
            ) : parcels.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                {isFetching || isTracking
                  ? 'Checking for a courier booking…'
                  : 'No shipment yet. A courier will be assigned once the vendor dispatches your order.'}
              </p>
            ) : (
              <div className="mt-6 space-y-6 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {groups.length > 1 ? `Delivery progress · ${parcels.length} parcels` : 'Delivery progress'}
                </p>
                {groups.map((group) => (
                  <div key={group.vendorId || 'unknown'}>
                    <p className="text-sm font-semibold text-foreground">
                      {group.vendorName}
                      {group.shipments.length > 1 && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {group.shipments.length} parcels
                        </span>
                      )}
                    </p>
                    {group.shipments.length === 0 ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        This vendor has not created a shipment yet.
                      </p>
                    ) : (
                      group.shipments.map((shipment) => (
                        <ShipmentTimeline
                          key={shipment._id}
                          shipment={shipment}
                          className="mt-3"
                        />
                      ))
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {lead && lead.trackingEvents?.length > 0 && (
            <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Courier events</p>
              <ul className="mt-3 space-y-2.5">
                {[...lead.trackingEvents]
                  .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
                  .map((event, i) => (
                    <li key={`${event.status}-${i}`} className="text-xs">
                      <p className="font-semibold text-foreground">{event.description}</p>
                      <p className="text-muted-foreground">
                        {event.location ? `${event.location} · ` : ''}
                        {formatDateTime(event.timestamp)}
                      </p>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">{order.items[0]?.productName}</p>
              <p className="text-[11px] text-muted-foreground">{orderItemCount(order)} pc(s)</p>
            </div>
            <hr className="my-3 border-border" />
            <dl className="space-y-2 text-xs">
              <Row title="Parcels" value={String(parcels.length)} />
              <Row title="Courier" value={lead?.courier ?? '—'} />
              <Row title="AWB no." value={lead?.awbNumber ?? '—'} mono />
              <Row title="Tracking no." value={lead?.trackingNumber ?? '—'} mono />
              <Row
                title="Current status"
                value={lead ? shipmentStatusText(shipmentMilestone(lead)) : '—'}
              />
              <Row title="Expected" value={eta ? formatDateTime(eta as string) : '—'} />
              <Row title="Shipping" value={formatINR(order.shippingAmount)} />
              <Row title="Deliver to" value={`${addr?.city ?? ''} ${addr?.pincode ?? ''}`} />
            </dl>
          {lead && shipmentTerminalState(shipmentMilestone(lead)) && (
            <p className="rounded-2xl bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              {shipmentTerminalState(shipmentMilestone(lead))?.description}
            </p>
          )}

          </div>

          {!cancelled && (
            <div className="flex items-start gap-3 rounded-3xl border border-border bg-card p-4 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-muted-foreground">Delivering to <span className="font-semibold text-foreground">{addr?.city}</span></p>
            </div>
          )}

          <PayNowButton order={order} className="w-full rounded-2xl" />

          <Button asChild variant="outline" className="w-full rounded-2xl">
            <Link to={`/shop/orders/${encodeURIComponent(order._id)}`}>
              <Truck className="size-4" /> Order details
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}

function Row({ title, value, mono }: { title: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{title}</dt>
      <dd className={cn('font-medium text-foreground', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}
