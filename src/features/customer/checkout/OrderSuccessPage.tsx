import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Loader2, MapPin, PackageCheck } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { useOrder, useOrders } from '@/features/customer/hooks'
import { OrderItemDiscount } from '@/features/customer/orders/components/order-item-discount'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatINR, formatDateTime } from '@/utils'

export function OrderSuccessPage() {
  const location = useLocation()
  const session = useAuthStore((s) => s.session)
  const passedId = (location.state as { orderId?: string } | null)?.orderId
  const { data: list } = useOrders()
  // Fall back to the newest order so a refresh or direct link still resolves.
  const orderId = passedId ?? list?.orders?.[0]?._id
  const { data: order, isLoading } = useOrder(orderId)

  const firstName = session?.profile.name.split(' ')[0] ?? 'there'
  const email = session?.profile.email

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

      {isLoading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading order…
        </div>
      )}

      {order && (
        <>
          <div className="mt-8 space-y-3 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{order.items.length} item(s)</p>
              <p className="text-xs text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
            </div>
            <Separator />
            {order.items.map((item) => (
              <div key={item._id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Link to={`/shop/products/${item.productId}`} className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary">
                    {item.productName}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">SKU {item.sku} · Qty {item.quantity}</p>
                  <OrderItemDiscount item={item} className="text-[11px]" />
                </div>
                <span className="text-sm font-semibold text-foreground">{formatINR(item.itemTotal)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="font-serif text-xl font-bold text-primary">{formatINR(order.grandTotal)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Delivering to <span className="font-semibold text-foreground">{order.shippingAddress?.addressLine1}</span>, {order.shippingAddress?.city} — {order.shippingAddress?.pincode}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-2.5">
            <Button asChild size="lg" className="w-full rounded-2xl">
              <Link to={`/shop/orders/${encodeURIComponent(order._id)}/track`}>
                <PackageCheck className="size-4" />
                Track order
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full rounded-2xl">
              <Link to="/shop/orders/mine">My orders</Link>
            </Button>
          </div>
          {email && (
            <p className="mt-5 text-center text-xs text-muted-foreground">
              A confirmation email has been sent to <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
        </>
      )}

      {!order && !isLoading && (
        <Button asChild className="mt-8 w-full rounded-2xl">
          <Link to="/shop/orders/mine">Go to my orders</Link>
        </Button>
      )}
    </div>
  )
}
