import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CreditCard, Eye, Search, Undo2, Wallet } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { useCustomerPayments } from '@/features/customer/hooks'
import { toPaymentView } from '@/services/finance.adapter'
import { PaymentStatusChip } from '@/components/common/status-chips'
import { RefundStatusBadge } from '@/components/common/finance-badges'
import { Amount, DateField } from '@/components/common/finance-fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { isRefundOpen, isRefundSettled } from '@/components/common/finance-status'

type Tab = 'all' | 'paid' | 'refunded' | 'refund_pending'

/**
 * The customer's payment history. Every column is a field the payments endpoint
 * returns — the amount shown is what the gateway captured and the refund column
 * is what the API has already returned, never a difference computed here.
 */
export function PaymentsPage() {
  const session = useAuthStore((s) => s.session)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useCustomerPayments()

  const all = useMemo(() => (data?.items ?? []).map(toPaymentView), [data])
  const counts = useMemo(
    () => ({
      all: all.length,
      paid: all.filter((p) => !p.hasRefund).length,
      refunded: all.filter((p) => isRefundSettled(p.refundStatus)).length,
      refund_pending: all.filter((p) => p.hasRefund && isRefundOpen(p.refundStatus)).length,
    }),
    [all],
  )

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return all.filter((payment) => {
      if (tab === 'paid' && payment.hasRefund) return false
      if (tab === 'refunded' && !isRefundSettled(payment.refundStatus)) return false
      if (tab === 'refund_pending' && !(payment.hasRefund && isRefundOpen(payment.refundStatus))) return false
      if (!term) return true
      return (
        (payment.orderNumber ?? '').toLowerCase().includes(term) ||
        (payment.paymentId ?? '').toLowerCase().includes(term) ||
        (payment.paymentMethod ?? '').toLowerCase().includes(term)
      )
    })
  }, [all, tab, search])

  if (!session) return <Navigate to="/shop/login?redirect=/shop/payments" replace />

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.profile.name} · every payment made on this account
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order no. or payment id"
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({counts.paid})</TabsTrigger>
          <TabsTrigger value="refund_pending">Refund pending ({counts.refund_pending})</TabsTrigger>
          <TabsTrigger value="refunded">Refunded ({counts.refunded})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          Loading your payments…
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-3xl border border-dashed border-destructive/40 bg-card/60 px-6 py-16 text-center">
          <CreditCard className="mx-auto size-10 text-destructive" />
          <p className="mt-3 font-serif text-lg font-semibold text-foreground">
            Could not load your payments
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
          <Button variant="soft" className="mt-5 rounded-full" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
          <Wallet className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-lg font-semibold text-foreground">No payment history found.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Payments appear here as soon as you complete a purchase.
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/shop/collections">Browse the collection</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((payment) => (
            <article
              key={payment.id}
              className="overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {payment.orderNumber ?? '—'}
                  </span>
                  <PaymentStatusChip status={payment.paymentStatus} />
                  {payment.hasRefund && <RefundStatusBadge status={payment.refundStatus} />}
                </div>
                <span className="text-xs text-muted-foreground">
                  Paid <DateField value={payment.paymentDate} withTime className="text-xs" />
                </span>
              </div>

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Order date</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      <DateField value={payment.orderDate} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Method</dt>
                    <dd className="mt-0.5 text-sm font-medium capitalize text-foreground">
                      {payment.paymentMethod ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Amount paid</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">
                      <Amount value={payment.amountPaid} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Refund amount</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">
                      {payment.hasRefund ? (
                        <Amount value={payment.refundAmount} />
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Undo2 className="size-3.5" /> None
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>

                <Button
                  asChild
                  size="sm"
                  variant={payment.hasRefund ? 'outline' : 'default'}
                  className="rounded-full sm:ml-auto"
                >
                  <Link to={`/shop/payments/${encodeURIComponent(payment.routeId)}`}>
                    <Eye className="size-3.5" /> View details
                  </Link>
                </Button>
              </div>

              {payment.hasRefund && payment.refundDate && (
                <p className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
                  Refunded on <DateField value={payment.refundDate} withTime className="text-xs" />
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
