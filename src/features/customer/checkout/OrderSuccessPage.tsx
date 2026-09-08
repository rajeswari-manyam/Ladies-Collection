import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, MapPin, PackageCheck } from 'lucide-react'
import { orderById } from '@/features/customer/data/account'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { storeProductById } from '@/features/customer/products/data/products'
import { useAuthStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatINR, formatDateTime } from '@/utils'

export function OrderSuccessPage() {
  const location = useLocation()
  const session = useAuthStore((s) => s.session)
  const orderId = (location.state as { orderId?: string } | null)?.orderId
  const order = orderId ? orderById(orderId) : undefined
  const firstName = session?.profile.name.split(' ')[0] ?? 'Ananya'
  const email = session?.profile.email ?? 'ananya@example.com'

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-foreground">Order confirmed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {order ? `Thanks, ${firstName}! Order ${order.orderNumber} has been placed successfully.` : 'Your order has been placed successfully.'}
        </p>
      </div>

      {order && (
        <>
          <div className="mt-8 space-y-3 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{order.items.length} item(s)</p>
              <p className="text-xs text-muted-foreground">Placed {formatDateTime(order.placedAt)}</p>
            </div>
            <Separator />
            {order.items.map((item) => {
              const product = storeProductById(item.productId)
              return (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                  <ProductArt hue={product?.hue ?? 336} pattern={product?.pattern ?? 1} label={item.name} className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/shop/products/${item.productId}`} className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary">{item.name}</Link>
                    <p className="text-[11px] text-muted-foreground">{item.size} · Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatINR(item.unitPrice * item.quantity)}</span>
                </div>
              )
            })}
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">Total paid</span>
              <span className="font-serif text-xl font-bold text-primary">{formatINR(order.total)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Delivering to <span className="font-semibold text-foreground">{order.addressLine1}</span>, {order.addressCity} — {order.addressPin} · ETA <span className="font-semibold text-foreground">{order.estDelivery}</span>
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-2.5">
            <Button asChild size="lg" className="w-full rounded-2xl">
              <Link to={`/shop/orders/${encodeURIComponent(order.id)}/track`}>
                <PackageCheck className="size-4" />
                Track order
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full rounded-2xl">
              <Link to="/shop/orders/mine">My orders</Link>
            </Button>
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            A confirmation email has been sent to <span className="font-medium text-foreground">{email}</span>
          </p>
        </>
      )}

      {!order && (
        <Button asChild className="mt-8 w-full rounded-2xl">
          <Link to="/shop/orders/mine">Go to my orders</Link>
        </Button>
      )}
    </div>
  )
}