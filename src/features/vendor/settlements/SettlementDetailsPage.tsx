import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote, Lock } from 'lucide-react'
import { useVendorSettlement, useVendorProfile } from '@/features/vendor/hooks'
import { timelineFromSettlement } from '@/services/finance.adapter'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { SettlementStatusBadge } from '@/components/common/status-badge'
import { FinanceTimeline } from '@/components/common/finance-timeline'
import { Amount, DateField, DetailGrid, MonoField, TextField } from '@/components/common/finance-fields'
import { DeadlineNote } from '@/components/common/finance-cards'

/**
 * A single vendor settlement.
 *
 * Every figure is the API's: the seller's net, the platform's share, the refund
 * impact, the adjustment and the final payable are all read, never recomputed.
 * A vendor gets no edit controls here — the payable and payout state are set by
 * the admin, so the screen states that rather than offering an affordance that
 * would be rejected.
 */
export function VendorSettlementDetailsPage() {
  const { id = '' } = useParams()
  const { data: settlement, isLoading, isError, refetch } = useVendorSettlement(id)
  const { data: profile } = useVendorProfile()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-56" />
      </div>
    )
  }

  if (isError || !settlement) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Settlement not found"
          description="This payout record could not be loaded."
          action={
            <Button variant="outline" asChild>
              <Link to="/vendor/settlements">All settlements</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const stages = timelineFromSettlement(settlement, settlement.orderDate)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
        <Link to="/vendor/settlements">
          <ArrowLeft className="size-4" />
          All settlements
        </Link>
      </Button>

      <PageHeader
        eyebrow="Payouts"
        title={settlement.settlementNumber ?? settlement._id}
        description={`Order ${settlement.orderNumber ?? '—'} · ${settlement.productName ?? 'Multiple items'}`}
        actions={<SettlementStatusBadge status={settlement.settlementStatus} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Amount breakdown</CardTitle>
              <CardDescription>As recorded by the platform for this order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Order value</span>
                <span className="font-medium">
                  <Amount value={settlement.customerPaidAmount} />
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Your sales</span>
                <span className="font-medium">
                  <Amount value={settlement.vendorNetAmount} />
                </span>
              </div>
              {settlement.vendorDiscountAmount > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Discounts</span>
                  <span className="font-medium text-rose-600">
                    <Amount value={settlement.vendorDiscountAmount} />
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Refund impact</span>
                <span className="font-medium">
                  <Amount value={settlement.refundAmount} />
                </span>
              </div>
              {settlement.vendorAdjustment !== 0 && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Adjustment</span>
                  <span
                    className={
                      settlement.vendorAdjustment < 0
                        ? 'font-medium text-rose-600'
                        : 'font-medium text-emerald-700'
                    }
                  >
                    <Amount value={settlement.vendorAdjustment} signed />
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-base font-semibold">Final payable</span>
                <span className="font-serif text-xl font-bold text-primary">
                  <Amount value={settlement.vendorPayableAmount} />
                </span>
              </div>
              <p className="flex items-start gap-2 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                Payable amounts are set by the platform. If something looks wrong, contact support rather than
                editing it here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settlement progress</CardTitle>
              <CardDescription>Delivered through to payout.</CardDescription>
            </CardHeader>
            <CardContent>
              <FinanceTimeline steps={stages} emptyLabel="No settlement activity recorded yet." />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order & return</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailGrid
                columns={1}
                items={[
                  { label: 'Order number', value: <MonoField value={settlement.orderNumber} /> },
                  { label: 'Order date', value: <DateField value={settlement.orderDate} /> },
                  { label: 'Delivered', value: <DateField value={settlement.deliveredAt} withTime /> },
                  {
                    label: 'Return window',
                    value: <DateField value={settlement.returnEligibleUntil} withTime />,
                  },
                  {
                    label: 'Return status',
                    value: <TextField value={settlement.refundStatus} />,
                  },
                ]}
              />
              <DeadlineNote until={settlement.returnEligibleUntil} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Banknote className="size-4 text-muted-foreground" />
                Payout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <DetailGrid
                columns={1}
                items={[
                  { label: 'Account holder', value: <TextField value={profile?.bank?.holder} /> },
                  { label: 'Bank', value: <TextField value={profile?.bank?.bank} /> },
                  { label: 'Account', value: <MonoField value={profile?.bank?.account} /> },
                  { label: 'IFSC', value: <MonoField value={profile?.bank?.ifsc} /> },
                  { label: 'Method', value: <TextField value={settlement.payoutMethod ?? profile?.payoutMethod} /> },
                  {
                    label: 'Transaction reference',
                    value: <MonoField value={settlement.transactionReference} />,
                  },
                  { label: 'Paid on', value: <DateField value={settlement.settlementPaidAt} withTime /> },
                ]}
              />
              {settlement.failureReason && (
                <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {settlement.failureReason}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
