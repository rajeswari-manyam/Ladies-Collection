import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Wallet } from 'lucide-react'
import {
  useVendorSettlements,
  useVendorSettlementSummary,
} from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { SettlementStatusBadge } from '@/components/common/status-badge'
import { ErrorState, EmptyState } from '@/components/common/state'
import { MoneyStatCard, MoneyStatSkeleton } from '@/components/common/finance-cards'
import { Amount, DateField, MonoField } from '@/components/common/finance-fields'
import { SETTLEMENT_STATUS_OPTIONS } from '@/types/finance.types'
import type { Settlement } from '@/services/settlement.service'

/**
 * Vendor settlements.
 *
 * Read-only by design: a seller sees the amounts the API reported for their own
 * rows but has no control over the payable, the platform's share or the payout
 * state. All four action buttons live on the admin screen instead.
 */
export function VendorSettlementsPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>('all')
  const [orderNumber, setOrderNumber] = useState('')

  const query = useMemo(
    () => ({
      settlementStatus: status === 'all' ? undefined : status,
      orderNumber: orderNumber.trim() || undefined,
    }),
    [status, orderNumber],
  )

  const { data, isLoading, isError, refetch } = useVendorSettlements(query)
  const { data: summary, isLoading: summaryLoading } = useVendorSettlementSummary(query)

  const columns = useMemo<AppColumnDef<Settlement>[]>(
    () => [
      {
        accessorKey: 'settlementNumber',
        header: 'Settlement',
        cell: ({ row }) => (
          <div>
            <MonoField value={row.original.settlementNumber} className="font-semibold" />
            <p className="text-xs text-muted-foreground">
              Order <MonoField value={row.original.orderNumber} />
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'settlementStatus',
        header: 'Status',
        cell: ({ row }) => <SettlementStatusBadge status={row.original.settlementStatus} />,
      },
      {
        accessorKey: 'customerPaidAmount',
        header: 'Order value',
        cell: ({ row }) => <Amount value={row.original.customerPaidAmount} />,
      },
      {
        accessorKey: 'vendorNetAmount',
        header: 'Your sales',
        cell: ({ row }) => <Amount value={row.original.vendorNetAmount} />,
      },
      {
        accessorKey: 'refundAmount',
        header: 'Refund impact',
        cell: ({ row }) =>
          row.original.refundAmount ? (
            <Amount value={row.original.refundAmount} signed className="text-rose-600" />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'vendorPayableAmount',
        header: 'Final payable',
        cell: ({ row }) => <Amount value={row.original.vendorPayableAmount} className="font-semibold" />,
      },
      {
        accessorKey: 'settlementPaidAt',
        header: 'Paid on',
        cell: ({ row }) => <DateField value={row.original.settlementPaidAt} withTime />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/vendor/settlements/${row.original._id}`)}
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
        description="Your payout records, with the amounts the platform has recorded for each order."
      />

      {summaryLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MoneyStatSkeleton />
          <MoneyStatSkeleton />
          <MoneyStatSkeleton />
          <MoneyStatSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MoneyStatCard
            stat={{
              label: 'Total payable',
              value: summary?.totalVendorPayable ?? 0,
              hint: 'Across every settlement',
              icon: <Wallet className="size-4" />,
            }}
          />
          <MoneyStatCard
            stat={{
              label: 'Pending',
              value: summary?.pendingSettlement ?? 0,
              hint: summary?.pendingCount ? `${summary.pendingCount} settlements` : undefined,
              tone: 'muted',
            }}
          />
          <MoneyStatCard
            stat={{
              label: 'Eligible',
              value: summary?.eligibleSettlement ?? 0,
              hint: summary?.eligibleCount ? `${summary.eligibleCount} settlements` : undefined,
              tone: 'positive',
            }}
          />
          <MoneyStatCard
            stat={{
              label: 'Paid',
              value: summary?.paidSettlement ?? 0,
              hint: summary?.paidCount ? `${summary.paidCount} settlements` : undefined,
              tone: 'positive',
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          placeholder="Filter by order number"
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SETTLEMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data && data.items.length === 0 && !isLoading ? (
        <EmptyState
          title="No settlements yet"
          description="Once an order is delivered, its settlement will appear here."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          emptyTitle="No settlements found"
          pageSize={8}
        />
      )}
    </div>
  )
}
