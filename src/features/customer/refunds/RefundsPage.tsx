import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, Search, Undo2 } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { useCustomerRefunds } from '@/features/customer/hooks'
import { toRefundView } from '@/services/finance.adapter'
import { RefundStatusBadge } from '@/components/common/finance-badges'
import { Amount, DateField, MonoField, TextField } from '@/components/common/finance-fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  isRefundOpen,
  isRefundSettled,
  refundStatusText,
} from '@/components/common/finance-status'

type Tab = 'all' | 'open' | 'completed'

/**
 * The customer's refund history. Statuses arrive in the API's own vocabulary and
 * are shown as friendly labels; the label map never changes the stored value.
 */
export function RefundsPage() {
  const session = useAuthStore((s) => s.session)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useCustomerRefunds()

  const all = useMemo(() => (data?.items ?? []).map(toRefundView), [data])
  const counts = useMemo(
    () => ({
      all: all.length,
      open: all.filter((r) => isRefundOpen(r.refundStatus)).length,
      completed: all.filter((r) => isRefundSettled(r.refundStatus)).length,
    }),
    [all],
  )

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return all.filter((refund) => {
      if (tab === 'open' && !isRefundOpen(refund.refundStatus)) return false
      if (tab === 'completed' && !isRefundSettled(refund.refundStatus)) return false
      if (!term) return true
      return (
        (refund.orderNumber ?? '').toLowerCase().includes(term) ||
        (refund.refundNumber ?? '').toLowerCase().includes(term) ||
        (refund.productName ?? '').toLowerCase().includes(term) ||
        (refund.refundReference ?? '').toLowerCase().includes(term)
      )
    })
  }, [all, tab, search])

  if (!session) return <Navigate to="/shop/login?redirect=/shop/refunds" replace />

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Refunds</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.profile.name} · refunds raised against your orders
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, product or reference"
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="open">In progress ({counts.open})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          Loading your refunds…
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-3xl border border-dashed border-destructive/40 bg-card/60 px-6 py-16 text-center">
          <Undo2 className="mx-auto size-10 text-destructive" />
          <p className="mt-3 font-serif text-lg font-semibold text-foreground">
            Could not load your refunds
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
          <Undo2 className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-lg font-semibold text-foreground">No refunds found.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Refunds appear here once you request a return or cancel an order.
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/shop/orders/mine">View my orders</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((refund) => (
            <article
              key={refund.id}
              className="overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {refund.orderNumber ?? '—'}
                  </span>
                  <RefundStatusBadge status={refund.refundStatus} />
                </div>
                <span className="text-xs text-muted-foreground">
                  Requested <DateField value={refund.refundRequestedAt} withTime className="text-xs" />
                </span>
              </div>

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  <div className="col-span-2 sm:col-span-1">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Refund ID</dt>
                    <dd className="mt-0.5">
                      <MonoField value={refund.refundNumber} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Product</dt>
                    <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
                      <TextField value={refund.productName} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Original payment</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      <Amount value={refund.originalPaymentAmount} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Refund amount</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">
                      <Amount value={refund.refundAmount} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Refund reason</dt>
                    <dd className="mt-0.5 text-sm font-medium capitalize text-foreground">
                      <TextField value={refund.refundReason} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reference</dt>
                    <dd className="mt-0.5">
                      <MonoField value={refund.refundReference} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Initiated</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      <DateField value={refund.refundInitiatedAt} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Completed</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      <DateField value={refund.refundCompletedAt} />
                    </dd>
                  </div>
                </dl>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full sm:ml-auto"
                >
                  <Link to={`/shop/refunds/${encodeURIComponent(refund.routeId)}`}>
                    <Eye className="size-3.5" /> View details
                  </Link>
                </Button>
              </div>

              {refund.refundStatus && !isRefundOpen(refund.refundStatus) && !isRefundSettled(refund.refundStatus) && (
                <p className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
                  {refundStatusText(refund.refundStatus)}
                  {refund.failureReason ? ` — ${refund.failureReason}` : ''}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
