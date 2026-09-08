import { Link } from 'react-router-dom'
import { ArrowUpRight, Banknote, IndianRupee, Percent, ReceiptText, TrendingUp } from 'lucide-react'
import { useVendorEarnings } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard, StatCardSkeleton } from '@/components/common/stat-card'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/state'
import { formatCurrency, formatDate } from '@/utils'

export function VendorEarningsPage() {
  const { data: earnings, isLoading, isError, refetch } = useVendorEarnings()

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payouts"
        title="Earnings"
        description="Your share of sales after marketplace commission, before payout fees and GST."
      />

      {isLoading || !earnings ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            index={0}
            icon={<IndianRupee className="size-4.5" />}
            data={{ label: 'Current Earnings', value: earnings.currentEarnings, delta: 6.4, format: 'currency', hint: 'available to settle' }}
          />
          <StatCard
            index={1}
            icon={<Banknote className="size-4.5" />}
            data={{ label: 'Lifetime Earnings', value: earnings.lifetimeEarnings, delta: 4.8, format: 'currency', hint: 'net of all payouts' }}
          />
          <StatCard
            index={2}
            icon={<TrendingUp className="size-4.5" />}
            data={{ label: 'This Month', value: earnings.thisMonth, delta: 3.2, format: 'currency', hint: 'current payout period' }}
          />
          <StatCard
            index={3}
            icon={<Percent className="size-4.5" />}
            data={{ label: 'Commission', value: Math.round(earnings.commissionRate * 100), delta: 0, hint: 'marketplace rate' }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly revenue</CardTitle>
            <CardDescription>Gross merchandise value shipped for your store, last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !earnings ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <RevenueChart data={earnings.monthly} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout details</CardTitle>
            <CardDescription>How your earnings are calculated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">Next payout</p>
                <p className="text-xs text-muted-foreground">Bi-weekly (15th & 30th)</p>
              </div>
              <Badge variant="rose">Upcoming</Badge>
            </div>
            <div className="flex items-start justify-between gap-3 border-t border-border pt-4">
              <div>
                <p className="font-medium">Current settlement</p>
                <p className="text-xs text-muted-foreground">Pending settlement FT-STL-2609A</p>
                <p className="mt-1 font-semibold text-primary">{formatCurrency(earnings?.currentSettlement ?? 0)}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/vendor/settlements/vstl-01">
                  Details
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="flex items-start justify-between gap-3 border-t border-border pt-4">
              <div>
                <p className="font-medium">Avg. order value</p>
                <p className="text-xs text-muted-foreground">Across fulfilled orders</p>
              </div>
              <span className="font-medium">{formatCurrency(earnings?.avgOrderValue ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ReceiptText className="size-4 text-muted-foreground" />
            Payout ledger
          </CardTitle>
          <CardDescription>Every payout credited to your HDFC account.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !earnings ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : earnings.ledger.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No payouts yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {earnings.ledger.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{row.period}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.settlementId} · paid {formatDate(row.paidAt)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">+{formatCurrency(row.net)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}