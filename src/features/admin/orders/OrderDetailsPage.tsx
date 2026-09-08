import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  Package,
  ReceiptText,
  Truck,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOrders, useCustomers, usePayments, useShipments, useUpdateOrderStatus } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { OrderStatusBadge, PaymentStatusBadge, ShipmentStatusBadge } from '@/components/common/status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDateTime } from '@/utils'
import type { OrderStatus } from '@/features/admin/types'

const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export function OrderDetailsPage() {
  const { id = '' } = useParams()
  const { data: orders, isLoading } = useOrders()
  const { data: customers } = useCustomers()
  const { data: payments } = usePayments()
  const { data: shipments } = useShipments()
  const updateStatus = useUpdateOrderStatus()

  const order = orders?.find((o) => o.id === id)

  const customer = useMemo(
    () => customers?.find((c) => c.id === order?.customerId),
    [customers, order],
  )
  const payment = useMemo(() => payments?.find((p) => p.orderId === id), [payments, id])
  const shipment = useMemo(() => shipments?.find((s) => s.orderId === id), [shipments, id])

  const setStatus = (status: OrderStatus) => {
    if (!order) return
    updateStatus.mutate(
      { id: order.id, status },
      {
        onSuccess: () =>
          toast.success('Order updated', { description: `${order.orderNumber} moved to ${status.replace('-', ' ')}.` }),
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-44 w-full" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Order not found"
          description="We could not locate this order in the marketplace."
          action={
            <Button variant="outline" asChild>
              <Link to="/orders">All orders</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
          <Link to="/orders">
            <ArrowLeft className="size-4" />
            All orders
          </Link>
        </Button>
        <PageHeader
          eyebrow="Fulfilment"
          title={order.orderNumber}
          description={`Placed ${formatDateTime(order.createdAt)} · ${customer?.name ?? 'Guest customer'}`}
          actions={
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Order items</CardTitle>
            <CardDescription>{order.items.length} item(s) in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-xs font-bold text-primary">
                    {item.quantity}×
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>−{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (GST)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Update status</CardTitle>
              <CardDescription>Move the order along fulfilment</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={order.status} onValueChange={(v) => setStatus(v as OrderStatus)} disabled={updateStatus.isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Transaction details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {payment ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-blush-100 text-primary">
                      <ReceiptText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{order.paymentMethod} payment</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{payment.paymentId}</p>
                    </div>
                    <span className="shrink-0 font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Gateway fee</span>
                    <span>{formatCurrency(payment.fee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Captured at</span>
                    <span>{formatDateTime(payment.createdAt)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No payment record linked to this order.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
              <CardDescription>Destination & tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                Delivering to <span className="font-medium text-foreground">{order.city}</span>
              </p>
              {shipment ? (
                <>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="size-4 text-primary" />
                    {shipment.carrier} · {shipment.trackingNumber}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-4 text-primary" />
                    Est. delivery <span className="font-medium text-foreground">{shipment.estDelivery}</span>
                  </p>
                  <ShipmentStatusBadge status={shipment.status} />
                </>
              ) : (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Package className="size-4 text-primary" />
                  Tracking not generated yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Account holder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <span className="flex size-8 items-center justify-center rounded-full bg-blush-100 text-xs font-bold text-primary">
                  {customer?.name.charAt(0) ?? 'G'}
                </span>
                {customer?.name ?? 'Guest customer'}
              </p>
              {customer && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserRound className="size-3.5" />
                  {customer.email} · {customer.city}
                </p>
              )}
              <Link
                to={`/customers`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                View customer profile
                <ArrowLeft className="size-3.5 rotate-180" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}