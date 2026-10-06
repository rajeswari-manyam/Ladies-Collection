import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Eye, Truck } from 'lucide-react'
import { useVendorOrders, useVendorShipments } from '@/features/vendor/hooks'
import { CreateShipmentDialog } from '@/features/vendor/shipping/components/create-shipment-dialog'
import { RequestPickupDialog } from '@/features/vendor/shipping/components/request-pickup-dialog'
import { ShipmentStatusDialog } from '@/features/vendor/shipping/components/shipment-status-dialog'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utils'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ShipmentStatusBadge } from '@/components/common/status-badge'
import { isTerminalShipment } from '@/components/common/workflow-status'
import { ErrorState } from '@/components/common/state'
import type { VendorShipment } from '@/features/vendor/data/vendor-portal'

export function VendorShippingPage() {
  const navigate = useNavigate()
  const { data: shipments, isLoading, isError, refetch } = useVendorShipments()
  const { data: orders } = useVendorOrders()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [statusTarget, setStatusTarget] = useState<VendorShipment | null>(null)
  const [pickupTarget, setPickupTarget] = useState<{ shipment: VendorShipment; date: string } | null>(null)

  // Default pickup date is tomorrow; computed on click to keep render pure.
  const openPickup = (s: VendorShipment) =>
    setPickupTarget({ shipment: s, date: new Date(Date.now() + 86400000).toISOString().slice(0, 10) })

  // The shipment API does not echo a delivery address, so borrow the city from
  // the related order. Without this the ETA/destination column is dead weight.
  const cityByOrder = useMemo(
    () => new Map((orders ?? []).map((o) => [o.id, o.city])),
    [orders],
  )

  const rows = useMemo(() => {
    let list = (shipments ?? []).map((s) => ({
      ...s,
      destination: cityByOrder.get(s.orderId) ?? '—',
    }))
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
  }, [shipments, cityByOrder, search])

  // The vendor id on the shipment must be the one that owns the order's items,
  // not the signed-in user's id — the two are different in this API.
  const vendorId = useMemo(
    () => (orders ?? []).flatMap((o) => o.items.map((i) => i.vendorId)).find(Boolean),
    [orders],
  )

  // Orders that can still be booked, so the picker only offers real work.
  const shippableOrders = useMemo(
    () =>
      (orders ?? [])
        .filter((o) => !o.status.includes('cancelled') && o.status !== 'delivered')
        .filter((o) => !(shipments ?? []).some((s) => s.orderId === o.id))
        .map((o) => ({ id: o.id, label: `${o.orderNumber} · ${o.customer || o.city}` })),
    [orders, shipments],
  )

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
        cell: ({ row }) => {
          const s = row.original
          const closed = isTerminalShipment(s.apiStatus ?? s.status)
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Request courier pickup"
                disabled={closed}
                onClick={() => openPickup(s)}
              >
                <CalendarClock className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Update status"
                disabled={closed}
                onClick={() => setStatusTarget(s)}
              >
                <Truck className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" title="View order" onClick={() => navigate(`/vendor/orders/${s.orderId}`)}>
                <Eye className="size-4" />
              </Button>
            </div>
          )
        },
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
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{shipments?.length ?? 0} shipments</Badge>
            <Button className="rounded-full" onClick={() => setCreating(true)}>
              <Truck className="size-4" /> Create shipment
            </Button>
          </div>
        }
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

      <CreateShipmentDialog
        open={creating}
        onClose={() => setCreating(false)}
        orders={shippableOrders}
        vendorId={vendorId}
      />
      {statusTarget && (
        <ShipmentStatusDialog
          open
          shipmentId={statusTarget.id}
          currentStatus={statusTarget.status}
          onClose={() => setStatusTarget(null)}
        />
      )}
      {pickupTarget && (
        <RequestPickupDialog
          open
          shipmentId={pickupTarget.shipment.id}
          defaultPickupDate={pickupTarget.date}
          onClose={() => setPickupTarget(null)}
        />
      )}
    </div>
  )
}