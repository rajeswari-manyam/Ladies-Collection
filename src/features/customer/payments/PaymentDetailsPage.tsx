import { Link, Navigate, useParams } from 'react-router-dom'
import { CreditCard, Undo2 } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { useCustomerPayment } from '@/features/customer/hooks'
import { toPaymentView } from '@/services/finance.adapter'
import { PaymentStatusChip } from '@/components/common/status-chips'
import { RefundStatusBadge } from '@/components/common/finance-badges'
import { Amount, DateField, DetailGrid, MonoField, TextField } from '@/components/common/finance-fields'
import { Button } from '@/components/ui/button'

/**
 * Full record for one payment. Amounts and timestamps are printed exactly as
 * the payments endpoint returned them; nothing on this screen is derived.
 */
export function PaymentDetailsPage() {
  const { paymentId } = useParams()
  const session = useAuthStore((s) => s.session)
  const { data, isLoading, isError, error, refetch } = useCustomerPayment(paymentId)

  if (!session) return <Navigate to="/shop/login?redirect=/shop/payments" replace />

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-4 py-24 text-sm text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        Loading payment…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CreditCard className="mx-auto size-10 text-destructive" />
        <p className="mt-3 font-serif text-2xl font-semibold text-foreground">Payment not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'We could not find that payment.'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="soft" className="rounded-full" onClick={() => refetch()}>
            Retry
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/shop/payments">Back to payments</Link>
          </Button>
        </div>
      </div>
    )
  }

  const payment = toPaymentView(data)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <Link to="/shop/payments" className="text-sm font-medium text-primary hover:underline">
        ← Payments
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {payment.orderNumber ?? 'Payment'}
        </h1>
        <PaymentStatusChip status={payment.paymentStatus} />
        {payment.hasRefund && <RefundStatusBadge status={payment.refundStatus} />}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        <MonoField value={payment.paymentId} /> · paid{' '}
        <DateField value={payment.paymentDate} withTime className="inline" />
      </p>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <p className="font-serif text-lg font-bold text-foreground">Payment</p>
        <DetailGrid
          className="mt-3"
          items={[
            { label: 'Payment ID', value: <MonoField value={payment.paymentId} /> },
            { label: 'Order number', value: <TextField value={payment.orderNumber} /> },
            { label: 'Order date', value: <DateField value={payment.orderDate} /> },
            { label: 'Payment date', value: <DateField value={payment.paymentDate} withTime /> },
            {
              label: 'Payment method',
              value: <span className="capitalize">{payment.paymentMethod ?? '—'}</span>,
            },
            {
              label: 'Amount paid',
              value: <Amount value={payment.amountPaid} className="font-semibold" />,
            },
            { label: 'Payment status', value: <PaymentStatusChip status={payment.paymentStatus} /> },
          ]}
        />
      </section>

      <section className="mt-5 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-serif text-lg font-bold text-foreground">Refund</p>
          {payment.hasRefund ? (
            <RefundStatusBadge status={payment.refundStatus} />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Undo2 className="size-3.5" /> No refund on this payment
            </span>
          )}
        </div>
        <DetailGrid
          className="mt-3"
          items={[
            {
              label: 'Refund amount',
              value: <Amount value={payment.refundAmount} className="font-semibold" />,
            },
            { label: 'Refund status', value: <RefundStatusBadge status={payment.refundStatus} /> },
            { label: 'Refund requested date', value: <DateField value={payment.refundRequestedAt} /> },
            { label: 'Refund initiated date', value: <DateField value={payment.refundInitiatedAt} /> },
            { label: 'Refund completed date', value: <DateField value={payment.refundDate} /> },
            {
              label: 'Refund transaction reference',
              value: <MonoField value={payment.refundTransactionReference} />,
            },
          ]}
        />

        {payment.hasRefund && payment.refundId && (
          <Button asChild size="sm" variant="outline" className="mt-4 rounded-full">
            <Link to={`/shop/refunds/${encodeURIComponent(payment.refundId)}`}>
              View refund details
            </Link>
          </Button>
        )}
      </section>
    </div>
  )
}
