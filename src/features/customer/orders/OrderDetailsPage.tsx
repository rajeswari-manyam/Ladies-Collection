import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MapPin, Package, Phone, Truck, Undo2 } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import {
  useCancelOrderWithReason,
  useCancellationPreview,
  useOrder,
  useOrderPayment,
  useOrderRefunds,
  useOrderReturns,
  useOrderShipments,
  useReturnableItems,
} from '@/features/customer/hooks'
import { OrderStatusChip, PaymentStatusChip } from '@/components/common/status-chips'
import { isTerminalOrder, orderTerminalState } from '@/components/common/workflow-status'
import { OrderProgressTimeline } from '@/features/customer/orders/components/order-progress-timeline'
import { VendorOrderGroups } from '@/features/customer/orders/components/vendor-order-groups'
import { PayNowButton } from '@/features/customer/orders/components/pay-now-button'
import { CancelOrderDialog } from '@/features/customer/orders/components/cancel-order-dialog'
import { ReturnItemDialog } from '@/features/customer/orders/components/return-item-dialog'
import { OrderFinancialPanel } from '@/features/customer/orders/components/order-financial-panel'
import { ReturnAwaitingPanel, ReturnTrackingPanel } from '@/features/customer/orders/components/return-tracking-panel'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatINR, formatDateTime } from '@/utils'

export function OrderDetailsPage() {
  const { id } = useParams()
  const session = useAuthStore((s) => s.session)
  const { data: order, isLoading } = useOrder(id)
  const { data: shipments } = useOrderShipments(order?._id)
  const { data: payment } = useOrderPayment(order?._id)
  const { data: refunds } = useOrderRefunds(order?._id)
  const { data: returns } = useOrderReturns(order?._id)
  const { data: returnable } = useReturnableItems(order?._id)
  const { data: cancellationPreview } = useCancellationPreview(order?._id)
  const invalidateAfterChange = useCancelOrderWithReason()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnItemId, setReturnItemId] = useState<string | undefined>(undefined)

  if (!session) return <Navigate to="/shop/login?redirect=/shop/orders/mine" replace />

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        Loading order…
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

  const addr = order.shippingAddress
  const parcels = shipments ?? []
  const delivered = parcels.find((s) => s.shipmentStatus === 'delivered')
  const eta = parcels.map((s) => s.estimatedDeliveryDate).filter(Boolean).sort()[0] ?? null
  const activeReturn = returns?.[0] ?? null

  /**
   * The backend owns both decisions. `cancellationPreview` answers "may I
   * cancel, and what comes back"; the returnable-items endpoint answers "may I
   * return this line, by when, and for how much".
   */
  const cancellation = cancellationPreview
    ? {
        allowed: Boolean(cancellationPreview.cancellationAllowed),
        reason: cancellationPreview.blockedReason ?? null,
      }
    : { allowed: !isTerminalOrder(order.orderStatus) && order.orderStatus !== 'delivered', reason: null }

  const returnableLines = (returnable?.items ?? []).filter(
    (item) => item.eligible && item.returnableQuantity > 0,
  )
  const canReturn = returnableLines.length > 0 && !activeReturn

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/shop/orders/mine" className="text-sm font-medium text-primary hover:underline">
            ← My orders
          </Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 font-serif text-3xl font-bold tracking-tight text-foreground">
            {order.orderNumber}
            <OrderStatusChip status={order.orderStatus} />
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <PayNowButton order={order} className="rounded-full" />
          {cancellation.allowed && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-destructive hover:text-destructive"
              onClick={() => setCancelOpen(true)}
              disabled={invalidateAfterChange.isPending}
            >
              Cancel order
            </Button>
          )}
          {canReturn && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setReturnItemId(undefined)
                setReturnOpen(true)
              }}
            >
              <Undo2 className="size-3.5" /> Return item
            </Button>
          )}
          {!isTerminalOrder(order.orderStatus) && order.orderStatus !== 'delivered' && (
            <Button asChild size="sm" className="rounded-full">
              <Link to={`/shop/orders/${encodeURIComponent(order._id)}/track`}>
                <Truck className="size-3.5" /> Track order
              </Link>
            </Button>
          )}
        </div>
      </div>

      {cancellation.allowed && cancellation.reason && (
        <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
          {cancellation.reason}
        </p>
      )}

      <p className="mt-2 text-sm text-muted-foreground">
        Placed on {formatDateTime(order.createdAt)} · payment{' '}
        <PaymentStatusChip status={order.paymentStatus} className="align-middle" />
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="font-serif text-lg font-bold text-foreground">Order progress</p>
            <OrderProgressTimeline
              order={order}
              className="mt-4"
              stepMeta={{
                in_transit: parcels.map((s) => s.dispatchDate).filter(Boolean).sort()[0]
                  ? `Dispatched ${formatDateTime(parcels.map((s) => s.dispatchDate).filter(Boolean).sort()[0]!)}`
                  : undefined,
                delivered: delivered?.deliveredDate ? `Delivered ${formatDateTime(delivered.deliveredDate)}` : undefined,
              }}
            />
            {eta && !delivered && (
              <p className="mt-4 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                Expected delivery {formatDateTime(eta as string)}
              </p>
            )}
          </section>

          <div>
            <p className="mb-2 font-serif text-lg font-bold text-foreground">
              Items{parcels.length > 1 ? ' by vendor' : ''}
            </p>
            <VendorOrderGroups order={order} shipments={parcels} />
          </div>

          {activeReturn ? (
            <ReturnTrackingPanel record={activeReturn} />
          ) : (
            canReturn && <ReturnAwaitingPanel />
          )}

          <section className="rounded-3xl border border-border bg-card p-5">
            <p className="font-serif text-lg font-bold text-foreground">Delivery address</p>
            <div className="mt-3 flex items-start gap-3">
              <MapPin className="mt-1 size-4 shrink-0 text-primary" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{addr?.fullName}</p>
                <p>{addr?.addressLine1}</p>
                {addr?.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>
                  {addr?.city}, {addr?.state} — {addr?.pincode}
                </p>
                <p className="mt-1 flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {addr?.mobile}
                </p>
              </div>
            </div>
            {order.shippingDetails && (
              <p className="mt-3 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                {order.shippingDetails.provider} · {order.shippingDetails.customerShippingStatus} ·{' '}
                {order.shippingDetails.distanceKm} km
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-card p-5">
          <p className="font-serif text-lg font-bold text-foreground">Payment summary</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Item total</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-foreground">
                <dt>Discount</dt>
                <dd className="font-semibold text-emerald-600">− {formatINR(order.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>Delivery{order.shippingAmount === 0 ? ' (free)' : ''}</dt>
              <dd>{order.shippingAmount === 0 ? 'FREE' : formatINR(order.shippingAmount)}</dd>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Tax</dt>
                <dd>{formatINR(order.taxAmount)}</dd>
              </div>
            )}
          </dl>
          <Separator className="my-4" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="font-serif text-xl font-bold text-primary">{formatINR(order.grandTotal)}</span>
          </div>
          {orderTerminalState(order.orderStatus) && (
            <p className="mt-3 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
              {orderTerminalState(order.orderStatus)?.description}
            </p>
          )}
        </aside>

        <div className="lg:col-start-2">
          <OrderFinancialPanel
            order={order}
            refunds={refunds ?? []}
            amountPaid={payment?.amount ?? null}
            finalAmountCharged={payment?.finalAmount ?? null}
          />
        </div>
      </div>

      <CancelOrderDialog
        order={order}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCancelled={() => invalidateAfterChange.reset()}
      />

      {returnableLines.length > 0 && (
        <ReturnItemDialog
          order={order}
          open={returnOpen}
          onOpenChange={setReturnOpen}
          presetItemId={returnItemId}
        />
      )}
    </div>
  )
}
