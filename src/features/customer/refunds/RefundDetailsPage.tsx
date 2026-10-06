import { Link, Navigate, useParams } from 'react-router-dom'
import { Undo2 } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { useCustomerRefund, useOrderReturns } from '@/features/customer/hooks'
import { toRefundView, timelineFromRefund, refId } from '@/services/finance.adapter'
import { RefundStatusBadge } from '@/components/common/finance-badges'
import { FinanceTimeline } from '@/components/common/finance-timeline'
import {
  Amount,
  DateField,
  DetailGrid,
  MonoField,
  TextField,
} from '@/components/common/finance-fields'
import { PaymentStatusChip } from '@/components/common/status-chips'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * Order / Payment / Refund breakdown for one refund, plus the refund timeline.
 * The timeline only shows stages the returns and refund APIs actually stamped.
 */
export function RefundDetailsPage() {
  const { refundId } = useParams()
  const session = useAuthStore((s) => s.session)
  const { data, isLoading, isError, error, refetch } = useCustomerRefund(refundId)
  const orderId = refId(data?.orderId)
  const { data: returns } = useOrderReturns(orderId || undefined)

  if (!session) return <Navigate to="/shop/login?redirect=/shop/refunds" replace />

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-4 py-24 text-sm text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        Loading refund…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Undo2 className="mx-auto size-10 text-destructive" />
        <p className="mt-3 font-serif text-2xl font-semibold text-foreground">Refund not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'We could not find that refund.'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="soft" className="rounded-full" onClick={() => refetch()}>
            Retry
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/shop/refunds">Back to refunds</Link>
          </Button>
        </div>
      </div>
    )
  }

  const refund = toRefundView(data)
  const returnRecord =
    returns?.find((record) => record.refundId === refund.id || record._id === refund.returnId) ?? null
  const timeline = timelineFromRefund(data, returnRecord)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <Link to="/shop/refunds" className="text-sm font-medium text-primary hover:underline">
        ← Refunds
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {refund.refundNumber ?? refund.id}
        </h1>
        <RefundStatusBadge status={refund.refundStatus} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Refund for order{' '}
        {orderId ? (
          <Link to={`/shop/orders/${encodeURIComponent(orderId)}`} className="font-medium text-primary hover:underline">
            {refund.orderNumber ?? orderId}
          </Link>
        ) : (
          refund.orderNumber ?? '—'
        )}
      </p>

      {refund.failureReason && (
        <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {refund.failureReason}
        </p>
      )}

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <p className="font-serif text-lg font-bold text-foreground">Order</p>
        <DetailGrid
          className="mt-3"
          items={[
            { label: 'Order number', value: <TextField value={refund.orderNumber} /> },
            { label: 'Order date', value: <DateField value={refund.orderDate} /> },
            { label: 'Product', value: <TextField value={refund.productName} /> },
            { label: 'Vendor', value: <TextField value={refund.vendorName} /> },
            {
              label: 'Quantity',
              value: <span className="tabular-nums">{refund.quantity || '—'}</span>,
            },
          ]}
        />
      </section>

      <section className="mt-5 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <p className="font-serif text-lg font-bold text-foreground">Payment</p>
        <DetailGrid
          className="mt-3"
          items={[
            {
              label: 'Original amount',
              value: <Amount value={refund.originalPaymentAmount} className="font-semibold" />,
            },
            { label: 'Payment method', value: <TextField value={data.paymentMethod ?? null} /> },
            {
              label: 'Payment date',
              value: <DateField value={data.paymentDate ?? data.createdAt} withTime />,
            },
            { label: 'Payment status', value: <PaymentStatusChip status={data.paymentStatus ?? null} /> },
          ]}
        />
      </section>

      <section className="mt-5 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <p className="font-serif text-lg font-bold text-foreground">Refund</p>
        <DetailGrid
          className="mt-3"
          items={[
            {
              label: 'Refund amount',
              value: <Amount value={refund.refundAmount} className="font-semibold" />,
            },
            { label: 'Refund status', value: <RefundStatusBadge status={refund.refundStatus} /> },
            {
              label: 'Refund reason',
              value: <span className="capitalize">{refund.refundReason ?? '—'}</span>,
            },
            { label: 'Refund requested date', value: <DateField value={refund.refundRequestedAt} /> },
            { label: 'Refund initiated date', value: <DateField value={refund.refundInitiatedAt} /> },
            { label: 'Refund completed date', value: <DateField value={refund.refundCompletedAt} /> },
            { label: 'Refund reference', value: <MonoField value={refund.refundReference} /> },
          ]}
        />
      </section>

      <section className="mt-5 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <p className="font-serif text-lg font-bold text-foreground">Refund progress</p>
        <Separator className="my-4" />
        <FinanceTimeline steps={timeline} />
      </section>
    </div>
  )
}
