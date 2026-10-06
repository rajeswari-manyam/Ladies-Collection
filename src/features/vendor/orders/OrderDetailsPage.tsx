import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, PackagePlus, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'
import { useOrderShipmentsForVendor, useVendorOrder, useVendorOrders, useUpdateVendorOrderStatus } from '@/features/vendor/hooks'
import { CreateShipmentDialog } from '@/features/vendor/shipping/components/create-shipment-dialog'
import { RequestPickupDialog } from '@/features/vendor/shipping/components/request-pickup-dialog'
import { ShipmentStatusDialog } from '@/features/vendor/shipping/components/shipment-status-dialog'
import { ShipmentStatusChip } from '@/components/common/status-chips'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { ProductThumb } from '@/components/common/artwork'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDateTime } from '@/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OrderStatus } from '@/features/vendor/types'

const NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  pending: [
    { value: 'cancelled', label: 'Cancel order' },
  ],
  processing: [{ value: 'shipped', label: 'Mark as shipped' }],
  shipped: [{ value: 'delivered', label: 'Mark as delivered' }],
}

export function VendorOrderDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading } = useVendorOrder(id)
  const { data: orders } = useVendorOrders()
  const updateStatus = useUpdateVendorOrderStatus()
  // The shipment API wants the vendor that owns the order's items, which is a
  // different id from the signed-in user's — so take it from the line items.
  const vendorId = order?.items.find((i) => i.vendorId)?.vendorId
  const { data: shipments } = useOrderShipmentsForVendor(id)
  const [showCreate, setShowCreate] = useState(false)
  const [showPickup, setShowPickup] = useState(false)
  const [pickupDate, setPickupDate] = useState('')
  const [showShipStatus, setShowShipStatus] = useState(false)

  // Default pickup date is tomorrow; computed on click to keep render pure.
  const openPickup = () => {
    setPickupDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10))
    setShowPickup(true)
  }

  const shipment = shipments?.[0]
  const cancellable = order?.status !== 'cancelled' && order?.status !== 'delivered'

  const next = order ? NEXT_STATUS[order.status] ?? [] : []

  const index = useMemo(() => (orders ?? []).findIndex((o) => o.id === id), [orders, id])
  const nextOrder = index >= 0 && orders ? orders[index + 1] : undefined

  const changeStatus = (value: string) => {
    updateStatus.mutate(
      { id, status: value as OrderStatus },
      {
        onSuccess: () =>
          toast.success('Order updated', {
            description: `${order?.orderNumber} moved to ${value.replace('-', ' ')}.`,
          }),
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  const goTo = (targetId: string) => {
    navigate(`/vendor/orders/${targetId}`)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Order not found"
          description="This order could not be located."
          action={
            <Button variant="outline" asChild>
              <Link to="/vendor/orders">All orders</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
        <Link to="/vendor/orders">
          <ArrowLeft className="size-4" />
          All orders
        </Link>
      </Button>

      <PageHeader
        eyebrow="Sales"
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)} by ${order.customer}`}
        actions={
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {!shipment && cancellable && (
              <Button size="sm" className="rounded-full" onClick={() => setShowCreate(true)}>
                <PackagePlus className="size-4" /> Dispatch
              </Button>
            )}
            {next.length > 0 && (
              <Select onValueChange={changeStatus} value="__current">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__current">Set status…</SelectItem>
                  {next.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      />

      {shipment && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Shipment</CardTitle>
              <CardDescription>
                {shipment.courier} · {shipment.awbNumber ?? 'no AWB yet'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ShipmentStatusChip status={shipment.shipmentStatus} />
              <Button size="sm" variant="outline" className="rounded-full" onClick={openPickup}>
                Request pickup
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowShipStatus(true)}>
                Update status
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">AWB number</dt>
                <dd className="font-mono font-medium">{shipment.awbNumber ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Estimated delivery</dt>
                <dd className="font-medium">{formatDateTime(shipment.estimatedDeliveryDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tracking events</dt>
                <dd className="font-medium">{shipment.trackingEvents?.length ?? 0}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order items</CardTitle>
            <CardDescription>{order.items.length} line item(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {order.items.map((item, i) => (
                <li key={`${item.productId}-${i}`} className="flex items-center gap-4 py-3">
                  <ProductThumb seed={item.productName} color="transparent" className="size-12 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variantName} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span className="text-emerald-600">−{formatCurrency(order.discount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (5%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                Shipping address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.customer}</p>
              <p className="text-muted-foreground capitalize">{order.city}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ReceiptText className="size-4 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {nextOrder && (
            <Button variant="outline" size="sm" className="w-full" onClick={() => goTo(nextOrder.id)}>
              Next order →
            </Button>
          )}
        </div>
      </div>

      <CreateShipmentDialog open={showCreate} orderId={id} vendorId={vendorId} onClose={() => setShowCreate(false)} />
      {shipment && (
        <>
          <RequestPickupDialog
            open={showPickup}
            shipmentId={shipment._id}
            defaultPickupDate={pickupDate}
            onClose={() => setShowPickup(false)}
          />
          <ShipmentStatusDialog
            open={showShipStatus}
            shipmentId={shipment._id}
            currentStatus={shipment.shipmentStatus}
            onClose={() => setShowShipStatus(false)}
          />
        </>
      )}
    </div>
  )
}