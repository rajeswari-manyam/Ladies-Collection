import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Truck } from 'lucide-react'
import { useVendorShipments } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utils'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ShipmentStatusBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import type { VendorShipment } from '@/features/vendor/data/vendor-portal'

export function VendorShippingPage() {
  const navigate = useNavigate()
  const { data: shipments, isLoading, isError, refetch } = useVendorShipments()
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    let list = shipments ?? []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.orderNumber.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q),
      )
    }
    return list
  }, [shipments, search])

  const columns = useMemo<AppColumnDef<VendorShipment>[]>(
    () => [
      {
        accessorKey: 'shipmentId',
        header: 'Shipment',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Truck className="size-4 text-primary" />
            </div>
            <div>
              <span className="font-mono text-sm font-semibold">{row.original.shipmentId}</span>
              <p className="text-xs text-muted-foreground">Created {formatDateTime(row.original.createdAt)}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.orderNumber}</span>,
      },
      {
        accessorKey: 'carrier',
        header: 'Courier',
        cell: ({ row }) => <span className="capitalize">{row.original.carrier}</span>,
      },
      {
        accessorKey: 'trackingNumber',
        header: 'Tracking',
        cell: ({ row }) => (
          <code className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {row.original.trackingNumber}
          </code>
        ),
      },
      {
        accessorKey: 'estDelivery',
        header: 'ETA',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDateTime(row.original.estDelivery)}</span>,
      },
      {
        accessorKey: 'destination',
        header: 'Destination',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm capitalize">
            {row.original.destination}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ShipmentStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/vendor/orders/${row.original.orderId}`)}>
            <Eye className="size-4" />
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
        eyebrow="Fulfilment"
        title="Shipping"
        description="Track every package dispatched from Fashion Trends, from pickup to delivery."
        actions={<Badge variant="secondary">{shipments?.length ?? 0} shipments</Badge>}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No shipments found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by tracking #, courier, order or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md flex-1"
            />
            <p className="text-xs text-muted-foreground">{rows.length} shipment(s)</p>
          </div>
        }
      />
    </div>
  )
}