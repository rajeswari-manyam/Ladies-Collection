import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote } from 'lucide-react'
import { useVendorSettlement, useVendorProfile } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { SettlementStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate } from '@/utils'

export function VendorSettlementDetailsPage() {
  const { id = '' } = useParams()
  const { data: settlement, isLoading } = useVendorSettlement(id)
  const { data: profile } = useVendorProfile()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-56" />
      </div>
    )
  }

  if (!settlement) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Settlement not found"
          description="This payout cycle could not be located."
          action={
            <Button variant="outline" asChild>
              <Link to="/vendor/settlements">All settlements</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const breakdown = [
    { label: 'Gross sales', value: settlement.grossSales, negative: false },
    { label: `Marketplace commission (${Math.round(settlement.commissionRate * 100)}%)`, value: settlement.commission, negative: true },
    { label: 'Refunds', value: settlement.refunds, negative: true },
    { label: 'Payment & service fees', value: settlement.fees, negative: true },
  ]

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
        title={settlement.settlementId}
        description={`Payout cycle ${settlement.period} · ${settlement.orders} orders`}
        actions={<SettlementStatusBadge status={settlement.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
            <CardDescription>Net payout after deductions for this cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {breakdown.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={row.negative ? 'font-medium text-rose-500' : 'font-medium'}>
                  {row.negative ? '−' : ''}{formatCurrency(row.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Net payout</span>
              <span>{formatCurrency(settlement.netAmount)}</span>
            </div>
            {settlement.processedAt && (
              <p className="text-xs text-muted-foreground">
                Processed on {formatDate(settlement.processedAt)} via {settlement.payoutMethod}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Banknote className="size-4 text-muted-foreground" />
              Payout account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{profile?.bank?.holder ?? 'Fashion Trends — Priya Sharma'}</p>
            <p>{profile?.bank?.bank ?? 'HDFC Bank'} · {profile?.bank?.account ?? '•••• 4921'}</p>
            <p className="text-muted-foreground">IFSC {profile?.bank?.ifsc ?? 'HDFC0000421'}</p>
            <div className="border-t border-border pt-3 text-xs text-muted-foreground">
              <p>Method · {settlement.payoutMethod}</p>
              <p>Cycle · {settlement.period}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}