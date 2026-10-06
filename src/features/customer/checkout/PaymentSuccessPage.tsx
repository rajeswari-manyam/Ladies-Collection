import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { getOrder } from '@/services/order.service'
import type { Order } from '@/services/order.service'
import { toApiError } from '@/services/http'
import { Button } from '@/components/ui/button'
import { formatINR, formatDateTime } from '@/utils'

export function PaymentSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const orderId = (location.state as { orderId?: string } | null)?.orderId
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!orderId || !session) return
    let active = true
    getOrder(session.token, orderId)
      .then((data) => {
        if (active) setOrder(data)
      })
      .catch((err) => {
        if (active) setOrder(null)
        toApiError(err)
      })
    return () => {
      active = false
    }
  }, [orderId, session])

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="size-10 text-emerald-600" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-foreground">Payment successful</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {order
          ? `We received ${formatINR(order.grandTotal)} for order ${order.orderNumber}.`
          : 'Your payment has been processed successfully.'}
      </p>

      {order && (
        <div className="mt-6 space-y-2 rounded-3xl border border-border bg-card p-5 text-left text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Order number</span><span className="font-semibold text-foreground">{order.orderNumber}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Amount paid</span><span className="font-semibold text-foreground">{formatINR(order.grandTotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Payment status</span><span className="font-semibold capitalize text-foreground">{order.paymentStatus}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Order status</span><span className="font-semibold capitalize text-foreground">{order.orderStatus}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Placed at</span><span className="font-medium text-foreground">{formatDateTime(order.createdAt)}</span></div>
        </div>
      )}

      <div className="mt-7 flex flex-col gap-2.5">
        <Button size="lg" className="w-full rounded-2xl" onClick={() => navigate('/shop/order/success', { state: { orderId: order?._id } })}>
          <Package className="size-4" />
          View order confirmation
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full rounded-2xl">
          <Link to="/shop/collections">Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}
