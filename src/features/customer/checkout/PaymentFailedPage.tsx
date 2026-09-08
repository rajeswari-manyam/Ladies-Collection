import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCcw, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaymentFailedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-10 text-destructive" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-foreground">Payment failed</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn't complete your payment. Your bank was not charged and your bag is safe —
        you can try again any time.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-left text-sm">
        <p className="font-semibold text-foreground">Possible reasons</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
          <li>Insufficient balance in the payment method</li>
          <li>Entered card details were rejected (demo card)</li>
          <li>Network interrupted before the bank confirmed</li>
        </ul>
      </div>

      <div className="mt-7 flex flex-col gap-2.5">
        <Button asChild size="lg" className="w-full rounded-2xl">
          <Link to="/shop/checkout">
            <RefreshCcw className="size-4" />
            Retry payment
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full rounded-2xl">
          <Link to="/shop/cart">
            <ShoppingBag className="size-4" />
            Review bag
          </Link>
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Need help? Contact support at <span className="font-medium text-primary">support@ladiescollection.demo</span>
        </p>
      </div>
    </div>
  )
}