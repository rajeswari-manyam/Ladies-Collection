import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { usePayOrder } from '@/features/customer/hooks'
import { Button } from '@/components/ui/button'
import type { Order } from '@/services/order.service'

/** Payment states that still need to be paid. */
function isPayable(order: Order): boolean {
  if (order.orderStatus === 'cancelled') return false
  return order.paymentStatus === 'pending' || order.paymentStatus === 'failed'
}

export function PayNowButton({ order, className, label = 'Pay now' }: { order: Order; className?: string; label?: string }) {
  const navigate = useNavigate()
  const pay = usePayOrder()
  const [open, setOpen] = useState(false)

  if (!isPayable(order)) return null

  function handlePay() {
    pay.mutate(order._id, {
      onSuccess: (updated) => {
        toast.success('Payment received', { description: `Order ${updated.orderNumber}` })
        navigate('/shop/payment/success', { state: { orderId: updated._id } })
      },
      onError: (err) => {
        toast.error('Payment failed', { description: err.message })
        setOpen(false)
      },
    })
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className={className}
        aria-label={`${label} for order ${order.orderNumber}`}
      >
        <CreditCard className="size-4" />
        {label}
      </Button>
    )
  }

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-foreground">Pay {formatAmount(order.grandTotal)} for {order.orderNumber}?</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePay} disabled={pay.isPending}>
          {pay.isPending ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
          {pay.isPending ? 'Processing…' : `Pay ${formatAmount(order.grandTotal)}`}
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)} disabled={pay.isPending}>
          Not now
        </Button>
      </div>
    </div>
  )
}

function formatAmount(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}
