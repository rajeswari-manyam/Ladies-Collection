import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Wallet } from 'lucide-react'
import { useVendorSettlements } from '@/features/vendor/hooks'
import { useVendorDashboard } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { SettlementStatusBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import type { VendorSettlement } from '@/features/vendor/data/vendor-portal'

export function VendorSettlementsPage() {
  const navigate = useNavigate()
  const { data: settlements, isLoading, isError, refetch } = useVendorSettlements()
  const { data: dash } = useVendorDashboard()

  const pending = useMemo(() => (settlements ?? []).find((s) => s.status === 'pending'), [settlements])
  const currentSettlement = dash?.kpis.currentSettlement ?? pending?.netAmount ?? 0

  const columns = useMemo<AppColumnDef<VendorSettlement>[]>(
    () => [
      {
        accessorKey: 'settlementId',
        header: 'Settlement',
        cell: ({ row }) => (
          <div>
            <span className="font-mono text-sm font-semibold">{row.original.settlementId}</span>
            <p className="text-xs text-muted-foreground">{row.original.period}</p>
          </div>
        ),
      },
      {
        accessorKey: 'orders',
        header: 'Orders',
        cell: ({ row }) => <span>{row.original.orders}</span>,
      },
      {
        accessorKey: 'grossSales',
        header: 'Gross sales',
        cell: ({ row }) => <span>{formatCurrency(row.original.grossSales)}</span>,
      },
      {
        accessorKey: 'commission',
        header: 'Commission',
        cell: ({ row }) => (
          <span className="text-rose-600 dark:text-rose-400">−{formatCurrency(row.original.commission)}</span>
        ),
      },
      {
        accessorKey: 'netAmount',
        header: 'Net payout',
        cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.netAmount)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <SettlementStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/vendor/settlements/${row.original.id}`)}
            className="gap-1 text-muted-foreground"
          >
            View
            <ArrowUpRight className="size-3.5" />
          </Button>
        ),
      },
    ],
    [navigate],
  )

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
        title="Settlements"
        description="Your bi-weekly payout cycles — gross sales, commission and net amounts credited per period."
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blush-100">
            <Wallet className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Pending settlement (next payout)</p>
            <p className="font-serif text-2xl font-semibold tracking-tight">{formatCurrency(currentSettlement)}</p>
          </div>
        </div>
        <Button variant="soft" size="sm" onClick={() => navigate('/vendor/earnings')}>
          View payout details
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={settlements ?? []}
        loading={isLoading}
        emptyTitle="No settlements found"
        pageSize={8}
      />
    </div>
  )
}