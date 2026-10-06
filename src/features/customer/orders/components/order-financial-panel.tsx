import { Link } from 'react-router-dom'
import { Eye, Wallet } from 'lucide-react'
import type { Order } from '@/services/order.service'
import type { Refund } from '@/services/refund.service'
import { toRefundView } from '@/services/finance.adapter'
import { RefundStatusBadge } from '@/components/common/finance-badges'
import { Amount, DateField } from '@/components/common/finance-fields'
import { PaymentStatusChip } from '@/components/common/status-chips'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * The customer's financial view of an order: what they paid, what came back and
 * what they ended up charged.
 *
 * Every figure is a value the payment or refund endpoint reported. When the
 * backend does not report a net amount the row reads "—" rather than the client
 * subtracting the refund itself.
 *
 * Deliberately limited to those figures. Vendor base price, vendor net price,
 * vendor payable, admin commission and settlement amounts are internal and are
 * never rendered here.
 */
export function OrderFinancialPanel({
  order,
  refunds,
  amountPaid,
  finalAmountCharged,
}: {
  order: Order
  refunds: Refund[]
  /** Captured amount, from the payment record. Null while the order is unpaid. */
  amountPaid: number | null
  /** Backend-reported net of payment and refund, when the API supplies one. */
  finalAmountCharged: number | null
}) {
  const latestRefund = toRefundView(refunds[0])
  const hasRefund = refunds.length > 0

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <p className="font-serif text-lg font-bold text-foreground">Payment & refund</p>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Order total</dt>
          <dd className="font-medium text-foreground">
            <Amount value={order.grandTotal} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Amount paid</dt>
          <dd className="font-medium text-foreground">
            {amountPaid !== null ? (
              <Amount value={amountPaid} />
            ) : (
              <span className="text-muted-foreground">Not paid yet</span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Refund amount</dt>
          <dd className="font-medium text-foreground">
            {hasRefund ? <Amount value={latestRefund.refundAmount} /> : <Amount value={null} />}
          </dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">Final amount charged</span>
        <span className="font-serif text-xl font-bold text-primary">
          {finalAmountCharged !== null ? (
            <Amount value={finalAmountCharged} />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">—</span>
          )}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PaymentStatusChip status={order.paymentStatus} />
        {hasRefund && <RefundStatusBadge status={latestRefund.refundStatus} />}
      </div>

      {hasRefund && latestRefund.refundCompletedAt && (
        <p className="mt-3 text-xs text-muted-foreground">
          Refunded on <DateField value={latestRefund.refundCompletedAt} withTime className="text-xs" />
        </p>
      )}

      {hasRefund ? (
        <Button asChild size="sm" variant="outline" className="mt-4 rounded-full">
          <Link to={`/shop/refunds/${encodeURIComponent(latestRefund.routeId)}`}>
            <Eye className="size-3.5" /> View refund
          </Link>
        </Button>
      ) : (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wallet className="size-3.5" /> No refund on this order
        </p>
      )}
    </section>
  )
}
