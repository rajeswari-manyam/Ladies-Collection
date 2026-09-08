import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, MoreHorizontal, Package, ReceiptText, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useOrders, useUpdateOrderStatus, useCustomers } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import { formatCurrency, formatDateTime } from '@/utils'
import type { Order, OrderStatus } from '@/features/admin/types'

const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export function OrdersPage() {
  const navigate = useNavigate()
  const { data: orders, isLoading, isError, refetch } = useOrders()
  const { data: customers } = useCustomers()
  const updateStatus = useUpdateOrderStatus()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const customerNames = useMemo(() => {
    const map = new Map(customers?.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? 'Guest'
  }, [customers])

  const selected = orders?.find((o) => o.id === selectedId)

  const rows = useMemo(() => {
    let list = orders ?? []
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          customerNames(o.customerId).toLowerCase().includes(q) ||
          o.items.some((it) => it.productName.toLowerCase().includes(q)),
      )
    }
    return list
  }, [orders, statusFilter, search, customerNames])

  const setStatus = (id: string, status: OrderStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success('Order updated', { description: `Order moved to “${status.replace('-', ' ')}”.` }),
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  const columns = useMemo<AppColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.orderNumber}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        accessorKey: 'customerId',
        header: 'Customer',
        cell: ({ row }) => <span>{customerNames(row.original.customerId)}</span>,
      },
      {
        accessorKey: 'items',
        header: 'Items',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.items[0]?.productName}
            {row.original.items.length > 1 && <span> +{row.original.items.length - 1}</span>}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.total)}</span>,
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => <PaymentStatusBadge status={row.original.paymentStatus} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
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
              <DropdownMenuLabel>Order actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/orders/${row.original.id}`)}>
                <Eye />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedId(row.original.id)}>
                <ReceiptText />
                Quick summary
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {statusOptions.map((s) => (
                <DropdownMenuItem
                  key={s}
                  disabled={s === row.original.status}
                  onClick={() => setStatus(row.original.id, s)}
                >
                  <Package className="size-4" />
                  Mark {s.replace('-', ' ')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [customerNames],
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
        title="Orders"
        description="Track, review and update orders placed across all vendors."
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No orders found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
              <Input
                placeholder="Search order, customer or product…"
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
                      {s[0].toUpperCase() + s.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{rows.length} order(s)</p>
          </div>
        }
      />

      {selected && (
        <OrderDetailSheet
          order={selected}
          customerName={customerNames(selected.customerId)}
          onClose={() => setSelectedId(null)}
          onStatus={(s) => setStatus(selected.id, s)}
          statusActionPending={updateStatus.isPending}
        />
      )}
    </div>
  )
}

interface OrderDetailProps {
  order: Order
  customerName: string
  onClose: () => void
  onStatus: (s: OrderStatus) => void
  statusActionPending: boolean
}

function OrderDetailSheet({ order, customerName, onClose, onStatus, statusActionPending }: OrderDetailProps) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blush-100 text-primary">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <SheetTitle>{order.orderNumber}</SheetTitle>
              <SheetDescription>
                Placed {formatDateTime(order.createdAt)} · {customerName}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
            <Badge variant="outline" className="capitalize">{order.paymentMethod}</Badge>
            <Badge variant="outline">{order.city}</Badge>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Update status
            </p>
            <Select value={order.status} onValueChange={(v) => onStatus(v as OrderStatus)} disabled={statusActionPending}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-primary">
                  {item.quantity}×
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                </div>
                <p className="shrink-0 text-sm font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>−{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="size-4" />
            Shipping destination: <span className="font-medium text-foreground">{order.city}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}