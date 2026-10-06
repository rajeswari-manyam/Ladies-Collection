import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Package, Search, Truck, Loader2, Store } from 'lucide-react'
import { useAuthStore } from '@/store/appStore'
import { useOrders, useOrderShipmentsMap } from '@/features/customer/hooks'
import { orderItemCount } from '@/services/order.service'
import { OrderStatusChip, PaymentStatusChip } from '@/components/common/status-chips'
import { OrderProgressBar } from '@/features/customer/orders/components/order-progress-timeline'
import { OrderShipmentStatus } from '@/features/customer/orders/components/order-shipment-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatINR, formatDateTime } from '@/utils'

type Tab = 'active' | 'delivered' | 'cancelled' | 'all'

/**
 * Statuses the order API can actually store. Anything not terminal counts as
 * active, so newly added backend statuses are not silently misfiled.
 */
const TERMINAL = ['delivered', 'cancelled', 'refunded']

const isActiveOrder = (status: string) => !TERMINAL.includes(status)

export function MyOrdersPage() {
  const session = useAuthStore((s) => s.session)
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const { data, isLoading } = useOrders()
  const { data: shipmentsByOrder } = useOrderShipmentsMap(useMemo(() => (data?.orders ?? []).map((o) => o._id), [data]))

  const all = useMemo(() => data?.orders ?? [], [data])
  const counts = useMemo(
    () => ({
      all: all.length,
      active: all.filter((o) => isActiveOrder(o.orderStatus)).length,
      delivered: all.filter((o) => o.orderStatus === 'delivered').length,
      cancelled: all.filter((o) => o.orderStatus === 'cancelled').length,
    }),
    [all],
  )

  const orders = useMemo(() => {
    const term = query.trim().toLowerCase()
    return all
      .filter((o) => {
        if (tab === 'active' && !isActiveOrder(o.orderStatus)) return false
        if (tab === 'delivered' && o.orderStatus !== 'delivered') return false
        if (tab === 'cancelled' && o.orderStatus !== 'cancelled') return false
        if (term) {
          const names = o.items.map((i) => i.productName).join(' ').toLowerCase()
          if (!o.orderNumber.toLowerCase().includes(term) && !names.includes(term)) return false
        }
        return true
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [all, tab, query])

  if (!session) return <Navigate to="/shop/login?redirect=/shop/orders/mine" replace />

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">My orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.profile.name} · {counts.all} orders in this account
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order no. or product" className="pl-9" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({counts.cancelled})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading your orders…
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
          <Package className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-lg font-semibold text-foreground">No orders here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Browse the collection and place your first order.</p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/shop/collections">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const active = isActiveOrder(order.orderStatus)
            const vendorCount = new Set((order.items ?? []).map((i) => i.vendorId).filter(Boolean)).size
            return (
              <div key={order._id} className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">{order.orderNumber}</span>
                    <OrderStatusChip status={order.orderStatus} />
                    <PaymentStatusChip status={order.paymentStatus} />
                  </div>
                  <span className="text-xs text-muted-foreground">Placed {formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-serif text-sm font-bold text-foreground">{order.items[0]?.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} line item(s) · {orderItemCount(order)} pc(s)
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Deliver to {order.shippingAddress?.city} — {order.shippingAddress?.pincode}
                    </p>
                    {vendorCount > 1 && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                        <Store className="size-3" /> Ships in {vendorCount} parcels from {vendorCount} vendors
                      </p>
                    )}
                    <OrderProgressBar order={order} className="mt-2.5 max-w-md" />
                    <OrderShipmentStatus shipments={shipmentsByOrder?.[order._id]} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4 sm:ml-auto sm:mt-0 sm:flex-col sm:items-end">
                    <p className="text-base font-bold text-foreground">{formatINR(order.grandTotal)}</p>
                    <div className="flex gap-2">
                      {active && (
                        <Button asChild size="sm" variant="outline" className="rounded-full">
                          <Link to={`/shop/orders/${encodeURIComponent(order._id)}/track`}>
                            <Truck className="size-3.5" /> Track
                          </Link>
                        </Button>
                      )}
                      <Button asChild size="sm" className="rounded-full">
                        <Link to={`/shop/orders/${encodeURIComponent(order._id)}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
