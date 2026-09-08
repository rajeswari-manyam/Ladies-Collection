import { useMemo, useState } from 'react'
import { CreditCard, Download, Wallet, Banknote, CircleDollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { usePayments } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { PaymentStatusBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import { formatCurrency, formatDateTime } from '@/utils'
import type { Payment } from '@/features/admin/types'

const methodIcon: Record<Payment['method'], React.ComponentType<{ className?: string }>> = {
  card: CreditCard,
  paypal: CircleDollarSign,
  wallet: Wallet,
  cash: Banknote,
}

export function PaymentsPage() {
  const { data: payments, isLoading, isError, refetch } = usePayments()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const rows = useMemo(() => {
    let list = payments ?? []
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.paymentId.toLowerCase().includes(q) ||
          p.orderNumber.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q),
      )
    }
    return list
  }, [payments, statusFilter, search])

  const totals = useMemo(() => {
    const captured = (payments ?? []).filter((p) => p.status === 'captured')
    const gross = captured.reduce((s, p) => s + p.amount, 0)
    const fees = captured.reduce((s, p) => s + p.fee, 0)
    return { gross, fees, net: gross - fees }
  }, [payments])

  const columns = useMemo<AppColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: 'paymentId',
        header: 'Payment',
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-sm font-medium">{row.original.paymentId}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => <span className="font-medium">{row.original.orderNumber}</span>,
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => <span>{row.original.customer}</span>,
      },
      {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ row }) => {
          const Icon = methodIcon[row.original.method]
          return (
            <span className="inline-flex items-center gap-1.5 capitalize">
              <Icon className="size-3.5 text-muted-foreground" />
              {row.original.method}
            </span>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{formatCurrency(row.original.amount)}</p>
            <p className="text-xs text-muted-foreground">
              fee {formatCurrency(row.original.fee)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
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
        eyebrow="Sales"
        title="Payments"
        description="Every captured, pending and refunded payment across the marketplace."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Ledger exported', { description: 'payments-export-q3.csv generated.' })}
          >
            <Download className="size-4" />
            Export ledger
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CircleDollarSign className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gross captured</p>
              <p className="font-serif text-xl font-semibold">{formatCurrency(totals.gross)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Badge variant="outline" className="size-11 rounded-xl text-lg">%</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Processing fees</p>
              <p className="font-serif text-xl font-semibold">{formatCurrency(totals.fees)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blush-100 text-primary">
              <Wallet className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net received</p>
              <p className="font-serif text-xl font-semibold">{formatCurrency(totals.net)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No payments found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
              <Input
                placeholder="Search payment, order or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="captured">Captured</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{rows.length} payment(s)</p>
          </div>
        }
      />
    </div>
  )
}