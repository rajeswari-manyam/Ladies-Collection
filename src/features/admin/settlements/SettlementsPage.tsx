import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, Eye, MoreHorizontal, Wallet, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSettlements, useUpdateSettlementStatus } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { SettlementStatusBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import { formatCurrency, formatDateTime } from '@/utils'
import type { Settlement, SettlementStatus } from '@/features/admin/types'

const statusOptions: SettlementStatus[] = ['pending', 'processed', 'paid', 'failed']

export function SettlementsPage() {
  const navigate = useNavigate()
  const { data: settlements, isLoading, isError, refetch } = useSettlements()
  const updateStatus = useUpdateSettlementStatus()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const rows = useMemo(() => {
    let list = settlements ?? []
    if (statusFilter !== 'all') list = list.filter((s) => s.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.settlementId.toLowerCase().includes(q) ||
          s.vendor.toLowerCase().includes(q) ||
          s.period.toLowerCase().includes(q),
      )
    }
    return list
  }, [settlements, statusFilter, search])

  const summary = useMemo(() => {
    const totalNet = (settlements ?? []).reduce((s, x) => s + x.netAmount, 0)
    const totalCommission = (settlements ?? []).reduce((s, x) => s + x.commission, 0)
    const pending = (settlements ?? []).filter((s) => s.status === 'pending' || s.status === 'processed')
    const pendingAmount = pending.reduce((s, x) => s + x.netAmount, 0)
    return { totalNet, totalCommission, pending: pending.length, pendingAmount }
  }, [settlements])

  const changeStatus = (id: string, status: SettlementStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success('Settlement updated', {
            description: `Status changed to “${status}”. (Demo simulation.)`,
          }),
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  const columns = useMemo<AppColumnDef<Settlement>[]>(
    () => [
      {
        accessorKey: 'settlementId',
        header: 'Settlement',
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-sm font-medium">{row.original.settlementId}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        accessorKey: 'vendor',
        header: 'Vendor',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.vendor}</p>
            <p className="text-xs text-muted-foreground">{row.original.period}</p>
          </div>
        ),
      },
      {
        accessorKey: 'orders',
        header: 'Orders',
        cell: ({ row }) => <span className="font-medium">{row.original.orders}</span>,
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
          <div>
            <p className="text-muted-foreground">{formatCurrency(row.original.commission)}</p>
            <p className="text-xs text-muted-foreground/70">@ {(row.original.commissionRate * 100).toFixed(0)}%</p>
          </div>
        ),
      },
      {
        accessorKey: 'netAmount',
        header: 'Net payout',
        cell: ({ row }) => <span className="font-semibold text-primary">{formatCurrency(row.original.netAmount)}</span>,
      },
      {
        accessorKey: 'payoutMethod',
        header: 'Method',
        cell: ({ row }) => <Badge variant="outline">{row.original.payoutMethod}</Badge>,
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/settlements/${row.original.id}`)}>
                <Eye />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Change status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((s) => (
                <DropdownMenuItem
                  key={s}
                  disabled={s === row.original.status}
                  onClick={() => changeStatus(row.original.id, s)}
                >
                  {s === 'paid' ? <CheckCircle2 /> : s === 'failed' ? <XCircle /> : <Clock3 />}
                  {s[0].toUpperCase() + s.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
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
        description="Bi-weekly vendor payouts, commissions and fees for every settlement cycle."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blush-100 text-primary">
              <Wallet className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total disbursed</p>
              <p className="font-serif text-xl font-semibold">{formatCurrency(summary.totalNet)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Clock3 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending payouts</p>
              <p className="font-serif text-xl font-semibold">
                {summary.pending} · {formatCurrency(summary.pendingAmount, true)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Badge className="text-lg">%</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commission collected</p>
              <p className="font-serif text-xl font-semibold">{formatCurrency(summary.totalCommission)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No settlements found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
              <Input
                placeholder="Search settlement, vendor or period…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{rows.length} settlement(s)</p>
          </div>
        }
      />
    </div>
  )
}