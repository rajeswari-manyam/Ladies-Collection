import { Link, Navigate, useParams } from 'react-router-dom'
import { Check, CircleDot, Loader2, MapPin, Package, Truck } from 'lucide-react'
import { orderById } from '@/features/customer/data/account'
import { storeProductById } from '@/features/customer/products/data/products'
import { useAuthStore } from '@/store/appStore'
import { StoreOrderStatusBadge } from '@/features/customer/orders/components/store-status-badge'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { Button } from '@/components/ui/button'
import { formatINR, formatDateTime } from '@/utils'
import { cn } from '@/utils'

export function TrackOrderPage() {
  const { id } = useParams()
  const session = useAuthStore((s) => s.session)
  const order = id ? orderById(id) : undefined

  if (!session) return <Navigate to="/shop/login?redirect=/shop/orders/mine" replace />

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

  const cancelled = order.status === 'cancelled'
  const activeIndex = cancelled ? -1 : order.trackSteps.map((s) => s.done).lastIndexOf(true)
  const firstProduct = storeProductById(order.items[0]?.productId ?? '')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <Link to="/shop/orders/mine" className="text-sm font-medium text-primary hover:underline">← My orders</Link>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Track order</h1>
        <StoreOrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{order.orderNumber} · placed {formatDateTime(order.placedAt)}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_240px]">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          {cancelled ? (
            <div className="py-8 text-center">
              <p className="font-serif text-lg font-semibold text-foreground">This order was cancelled</p>
              <p className="mt-1 text-sm text-muted-foreground">Your payment of {formatINR(order.total)} will be refunded within 5–7 business days.</p>
            </div>
          ) : (
            <ol className="relative space-y-7">
              {order.trackSteps.map((step, i) => {
                const isCurrent = !cancelled && i === activeIndex
                return (
                  <li key={i} className="relative flex gap-4">
                    {i < order.trackSteps.length - 1 && (
                      <span
                        className={cn(
                          'absolute left-[13px] top-8 h-[calc(100%-8px)] w-0.5 rounded',
                          i <= activeIndex ? 'bg-emerald-500' : 'bg-border',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                        step.done ? 'border-emerald-500 bg-emerald-500 text-emerald-50' : 'border-border bg-card',
                      )}
                    >
                      {isCurrent ? (
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                      ) : step.done ? (
                        <Check className="size-3.5" />
                      ) : (
                        <CircleDot className="size-3.5 text-muted-foreground" />
                      )}
                    </span>
                    <div className="pt-0.5">
                      <p className={cn('text-sm font-semibold', step.done ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.label}
                        {isCurrent && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">LIVE</span>}
                      </p>
                      {step.at && <p className="mt-0.5 text-[11px] font-medium text-primary">{step.at}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <aside className="h-fit space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <ProductArt hue={firstProduct?.hue ?? 336} pattern={firstProduct?.pattern ?? 1} label={order.items[0]?.name ?? 'Order'} className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">{order.items[0]?.name}</p>
                <p className="text-[11px] text-muted-foreground">{order.items.reduce((n, i) => n + i.quantity, 0)} pc(s)</p>
              </div>
            </div>
            <SeparatorMini />
            <dl className="space-y-2 text-xs">
              <Row title="Carrier" value={order.carrier} />
              <Row title="AWB no." value={order.trackingNumber || '—'} mono />
              <Row title="ETA" value={order.estDelivery} />
              <Row title="Deliver to" value={`${order.addressCity} ${order.addressPin}`} />
            </dl>
          </div>

          {!cancelled && (
            <div className="flex items-start gap-3 rounded-3xl border border-border bg-card p-4 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-muted-foreground">Delivering to <span className="font-semibold text-foreground">{order.addressCity}</span></p>
            </div>
          )}

          <Button asChild variant="outline" className="w-full rounded-2xl">
            <Link to={`/shop/orders/${encodeURIComponent(order.id)}`}>
              <Truck className="size-4" /> Order details
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}

function SeparatorMini() {
  return <hr className="my-3 border-border" />
}

function Row({ title, value, mono }: { title: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{title}</dt>
      <dd className={cn('font-medium text-foreground', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}