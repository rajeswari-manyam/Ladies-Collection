import { useNavigate } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import type { RefundRecord, ReturnRecord } from '@/features/returns/types'
import { Amount, DateField, MonoField } from '@/components/common/finance-fields'
import { ProductThumb } from '@/components/common/artwork'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ReturnActionMenu, type ReturnAction } from '@/features/returns/components/action-menu'
import { ReturnReasonBadge, ReturnStageBadge, RefundStageBadge } from '@/features/returns/components/badges'
import { returnReasonLabel } from '@/features/returns/workflow'
import { RefundActionMenu, type RefundListAction } from '@/features/returns/components/refund-action-menu'

/**
 * Desktop tables for the return and refund lists.
 *
 * `Table` already scrolls horizontally, so wide viewports get every column while
 * smaller ones keep the whole row reachable. The mobile card lists take over
 * below `md`.
 */

/** Columns each portal has no use for: admin has no product image column, vendor has no vendor column. */
const ADMIN_HIDDEN_RETURN_COLUMNS = new Set(['image'])
const VENDOR_HIDDEN_RETURN_COLUMNS = new Set(['vendor'])
const VENDOR_HIDDEN_REFUND_COLUMNS = new Set(['vendor', 'orderAmount', 'reason'])

function ProductCell({ record }: { record: ReturnRecord }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <ProductThumb seed={record.product.name} color={`hsl(${record.product.hue} 60% 55%)`} className="size-9 rounded-lg" />
      <div className="min-w-0">
        <p className="max-w-[14rem] truncate text-sm font-medium text-foreground">{record.product.name}</p>
        <p className="text-xs text-muted-foreground">
          {record.product.variant} · {record.product.size}
        </p>
      </div>
    </div>
  )
}

export function ReturnTable({
  records,
  scope,
  refunds,
  onAction,
  returnBasePath,
  refundBasePath,
  pageSize = 8,
}: {
  records: ReturnRecord[]
  scope: 'vendor' | 'admin'
  refunds: RefundRecord[]
  onAction: (action: ReturnAction, record: ReturnRecord) => void
  returnBasePath: string
  refundBasePath: string
  pageSize?: number
}) {
  const navigate = useNavigate()
  const refundStageOf = (returnId: string) => refunds.find((refund) => refund.returnId === returnId)?.stage ?? null

  const columns: AppColumnDef<ReturnRecord>[] = [
    {
      id: 'returnId',
      accessorFn: (row) => row.returnId,
      header: 'Return ID',
      cell: ({ row }) => (
        <button
          type="button"
          className="font-mono text-sm font-medium text-primary hover:underline"
          onClick={() => navigate(`${returnBasePath}/${row.original.id}`)}
        >
          {row.original.returnId}
        </button>
      ),
    },
    {
      id: 'orderNumber',
      accessorFn: (row) => row.orderNumber,
      header: 'Order ID',
      cell: ({ row }) => <span className="font-medium">{row.original.orderNumber}</span>,
    },
    {
      id: 'customer',
      accessorFn: (row) => row.customer.name,
      header: 'Customer',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="max-w-[10rem] truncate text-sm text-foreground">{row.original.customer.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.customer.phone}</p>
        </div>
      ),
    },
    {
      id: 'vendor',
      accessorFn: (row) => row.vendor.name,
      header: 'Vendor',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="max-w-[10rem] truncate text-sm text-foreground">{row.original.vendor.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.vendor.id}</p>
        </div>
      ),
    },
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => <ProductCell record={row.original} />,
    },
    {
      id: 'image',
      header: 'Product image',
      cell: ({ row }) => (
        <ProductThumb
          seed={row.original.product.name}
          color={`hsl(${row.original.product.hue} 60% 55%)`}
          className="size-10"
        />
      ),
    },
    {
      id: 'quantity',
      accessorFn: (row) => row.quantity,
      header: 'Quantity',
      cell: ({ row }) => <span className="font-medium">{row.original.quantity}</span>,
    },
    {
      id: 'reason',
      accessorFn: (row) => row.reason,
      header: 'Return reason',
      cell: ({ row }) => <ReturnReasonBadge reason={row.original.reason} />,
    },
    {
      id: 'requestedAt',
      accessorFn: (row) => new Date(row.requestedAt).getTime(),
      header: 'Requested date',
      cell: ({ row }) => <DateField value={row.original.requestedAt} />,
    },
    {
      id: 'eligibleUntil',
      accessorFn: (row) => new Date(row.eligibleUntil).getTime(),
      header: 'Eligible until',
      cell: ({ row }) => <DateField value={row.original.eligibleUntil} />,
    },
    {
      id: 'refundAmount',
      accessorFn: (row) => row.refundAmount,
      header: scope === 'admin' ? 'Amount' : 'Refund amount',
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          <Amount value={row.original.refundAmount} />
        </span>
      ),
    },
    {
      id: 'stage',
      accessorFn: (row) => row.stage,
      header: 'Status',
      cell: ({ row }) => <ReturnStageBadge stage={row.original.stage} />,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <ReturnActionMenu
          record={row.original}
          scope={scope}
          refundStage={refundStageOf(row.original.returnId)}
          onAction={onAction}
          refundBasePath={refundBasePath}
        />
      ),
    },
  ]

  const visible =
    scope === 'admin'
      ? columns.filter((column) => !ADMIN_HIDDEN_RETURN_COLUMNS.has(column.id ?? ''))
      : columns.filter((column) => !VENDOR_HIDDEN_RETURN_COLUMNS.has(column.id ?? ''))

  return <DataTable columns={visible} data={records} pageSize={pageSize} emptyTitle="No returns found" />
}

export function RefundTable({
  records,
  scope,
  onAction,
  refundBasePath,
  returnBasePath,
  pageSize = 8,
}: {
  records: RefundRecord[]
  scope: 'vendor' | 'admin'
  onAction: (action: RefundListAction, record: RefundRecord) => void
  refundBasePath: string
  returnBasePath: string
  pageSize?: number
}) {
  const navigate = useNavigate()

  const columns: AppColumnDef<RefundRecord>[] = [
    {
      id: 'refundId',
      accessorFn: (row) => row.refundId,
      header: 'Refund ID',
      cell: ({ row }) => (
        <button
          type="button"
          className="font-mono text-sm font-medium text-primary hover:underline"
          onClick={() => navigate(`${refundBasePath}/${row.original.id}`)}
        >
          {row.original.refundId}
        </button>
      ),
    },
    {
      id: 'orderNumber',
      accessorFn: (row) => row.orderNumber,
      header: 'Order ID',
      cell: ({ row }) => <span className="font-medium">{row.original.orderNumber}</span>,
    },
    {
      id: 'returnId',
      accessorFn: (row) => row.returnId,
      header: 'Return ID',
      cell: ({ row }) => <MonoField value={row.original.returnId} />,
    },
    {
      id: 'customer',
      accessorFn: (row) => row.customer.name,
      header: 'Customer',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="max-w-[10rem] truncate text-sm text-foreground">{row.original.customer.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.customer.email}</p>
        </div>
      ),
    },
    {
      id: 'vendor',
      accessorFn: (row) => row.vendor.name,
      header: 'Vendor',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="max-w-[10rem] truncate text-sm text-foreground">{row.original.vendor.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.vendor.id}</p>
        </div>
      ),
    },
    {
      id: 'orderAmount',
      accessorFn: (row) => row.originalOrderAmount,
      header: 'Order amount',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          <Amount value={row.original.originalOrderAmount} />
        </span>
      ),
    },
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <ProductThumb
            seed={row.original.productName}
            color={`hsl(${row.original.productHue} 60% 55%)`}
            className="size-9 rounded-lg"
          />
          <p className="max-w-[13rem] truncate text-sm font-medium text-foreground">{row.original.productName}</p>
        </div>
      ),
    },
    {
      id: 'refundAmount',
      accessorFn: (row) => row.refundAmount,
      header: 'Refund amount',
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          <Amount value={row.original.refundAmount} />
        </span>
      ),
    },
    {
      id: 'method',
      accessorFn: (row) => row.method,
      header: 'Refund method',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <CreditCard className="size-3.5 text-muted-foreground" />
          {row.original.method}
        </span>
      ),
    },
    {
      id: 'reason',
      accessorFn: (row) => row.reason,
      header: 'Refund reason',
      cell: ({ row }) => <span className="text-sm">{returnReasonLabel(row.original.reason)}</span>,
    },
    {
      id: 'requestedAt',
      accessorFn: (row) => new Date(row.requestedAt).getTime(),
      header: 'Requested date',
      cell: ({ row }) => <DateField value={row.original.requestedAt} />,
    },
    {
      id: 'processedAt',
      accessorFn: (row) => new Date(row.processedAt ?? 0).getTime(),
      header: 'Processed date',
      cell: ({ row }) => <DateField value={row.original.processedAt} />,
    },
    {
      id: 'stage',
      accessorFn: (row) => row.stage,
      header: 'Status',
      cell: ({ row }) => <RefundStageBadge stage={row.original.stage} />,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RefundActionMenu
          record={row.original}
          scope={scope}
          returnBasePath={returnBasePath}
          onAction={onAction}
        />
      ),
    },
  ]

  const visible =
    scope === 'admin' ? columns : columns.filter((column) => !VENDOR_HIDDEN_REFUND_COLUMNS.has(column.id ?? ''))

  return <DataTable columns={visible} data={records} pageSize={pageSize} emptyTitle="No refunds found" />
}
