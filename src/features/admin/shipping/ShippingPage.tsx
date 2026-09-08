import { useMemo, useState } from 'react'
import { MapPin, PackageCheck, Plane, RefreshCcw, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useShipments } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ShipmentStatusBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import { formatDate, formatDateTime } from '@/utils'
import type { Shipment, ShipmentStatus } from '@/features/admin/types'

const statuses: ShipmentStatus[] = ['pending', 'in-transit', 'out-for-delivery', 'delivered', 'failed']

export function ShipmentsPage() {
  const { data: shipments, isLoading, isError, refetch } = useShipments()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const rows = useMemo(() => {
    let list = shipments ?? []
    if (statusFilter !== 'all') list = list.filter((s) => s.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.shipmentId.toLowerCase().includes(q) ||
          s.trackingNumber.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.orderNumber.toLowerCase().includes(q),
      )
    }
    return list
  }, [shipments, statusFilter, search])

  const countByStatus = useMemo(() => {
    const base: Record<string, number> = { pending: 0, 'in-transit': 0, 'out-for-delivery': 0, delivered: 0, failed: 0 }
    for (const s of shipments ?? []) base[s.status] += 1
    return base
  }, [shipments])

  const columns = useMemo<AppColumnDef<Shipment>[]>(
    () => [
      {
        accessorKey: 'shipmentId',
        header: 'Shipment',
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-sm font-medium">{row.original.shipmentId}</p>
            <p className="text-xs text-muted-foreground">{row.original.orderNumber}</p>
          </div>
        ),
      },
      {
        accessorKey: 'carrier',
        header: 'Carrier',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-3.5 text-muted-foreground" />
            {row.original.carrier}
          </span>
        ),
      },
      {
        accessorKey: 'trackingNumber',
        header: 'Tracking',
        cell: ({ row }) => (
          <code className="rounded-md bg-muted px-2 py-1 text-xs">{row.original.trackingNumber}</code>
        ),
      },
      {
        accessorKey: 'origin',
        header: 'Route',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{row.original.origin}</span>
            <span className="mx-0.5 text-xs">→</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{row.original.destination}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ShipmentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'estDelivery',
        header: 'Estimated delivery',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{formatDate(row.original.estDelivery)}</p>
            <p className="text-xs text-muted-foreground">shipped {formatDateTime(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: () => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toast.info('Tracking refreshed', { description: 'No new events in the mock courier feed.' })}
          >
            <RefreshCcw className="size-3.5" />
          </Button>
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
        eyebrow="Fulfilment"
        title="Shipments"
        description="Live view of parcels moving from vendor studios to customers."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statuses.map((s) => (
          <Card key={s}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                {s === 'delivered' ? <PackageCheck className="size-4.5" /> : <Plane className="size-4.5" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs capitalize text-muted-foreground">{s.replace('-', ' ')}</p>
                <p className="font-serif text-lg font-semibold leading-tight">{countByStatus[s]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No shipments found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
              <Input
                placeholder="Search shipment, tracking or carrier…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{rows.length} shipment(s)</p>
          </div>
        }
      />
    </div>
  )
}