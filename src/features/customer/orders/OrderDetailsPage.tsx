import { Link, Navigate, useParams } from 'react-router-dom'
import { MapPin, Package, Phone, Truck } from 'lucide-react'
import { orderById } from '@/features/customer/data/account'
import { storeProductById } from '@/features/customer/products/data/products'
import { useAuthStore } from '@/store/appStore'
import { StoreOrderStatusBadge } from '@/features/customer/orders/components/store-status-badge'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatINR, formatDateTime } from '@/utils'

export function OrderDetailsPage() {
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

  const isActive = !['delivered', 'cancelled'].includes(order.status)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/shop/orders/mine" className="text-sm font-medium text-primary hover:underline">← My orders</Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 font-serif text-3xl font-bold tracking-tight text-foreground">
            {order.orderNumber}
            <StoreOrderStatusBadge status={order.status} />
          </h1>
        </div>
        {isActive && (
          <Button asChild size="sm" className="rounded-full">
            <Link to={`/shop/orders/${encodeURIComponent(order.id)}/track`}>
              <Truck className="size-3.5" /> Track order
            </Link>
          </Button>
        )}
      </div>

      <p className="mt-2 text-sm text-muted-foreground">Placed on {formatDateTime(order.placedAt)} · {order.paymentMethod}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5">
            <p className="font-serif text-lg font-bold text-foreground">Items</p>
            <div className="mt-3 space-y-3">
              {order.items.map((item, i) => {
                const product = storeProductById(item.productId)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <ProductArt hue={product?.hue ?? 336} pattern={product?.pattern ?? 1} label={item.name} className="size-16 shrink-0 rounded-2xl" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/shop/products/${item.productId}`} className="line-clamp-1 font-semibold text-foreground hover:text-primary">{item.name}</Link>
                      <p className="text-xs text-muted-foreground">Size {item.size} · Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatINR(item.unitPrice * item.quantity)}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <p className="font-serif text-lg font-bold text-foreground">Delivery address</p>
            <div className="mt-3 flex items-start gap-3">
              <MapPin className="mt-1 size-4 shrink-0 text-primary" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{session.profile.name}</p>
                <p>{order.addressLine1}</p>
                <p>{order.addressCity} — {order.addressPin}</p>
                <p className="mt-1 flex items-center gap-1.5"><Phone className="size-3.5" /> {session.profile.mobile}</p>
              </div>
            </div>
            {order.carrier && (
              <p className="mt-3 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                {order.carrier} · ID <span className="font-mono font-medium text-foreground">{order.trackingNumber || '—'}</span>
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-card p-5">
          <p className="font-serif text-lg font-bold text-foreground">Payment summary</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground"><dt>Item total (MRP)</dt><dd>{formatINR(order.subtotal + order.discount)}</dd></div>
            <div className="flex justify-between text-foreground"><dt>Discount</dt><dd className="font-semibold text-emerald-600">− {formatINR(order.discount)}</dd></div>
            <div className="flex justify-between text-muted-foreground"><dt>Delivery</dt><dd>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</dd></div>
            {order.codFee && order.codFee > 0 && (
              <div className="flex justify-between text-muted-foreground"><dt>COD handling fee</dt><dd>{formatINR(order.codFee)}</dd></div>
            )}
          </dl>
          <Separator className="my-4" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-foreground">Total paid</span>
            <span className="font-serif text-xl font-bold text-primary">{formatINR(order.total)}</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">Ref: {order.paymentId}</p>
        </aside>
      </div>
    </div>
  )
}