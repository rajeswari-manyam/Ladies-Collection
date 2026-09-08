import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Package, Search, Truck } from 'lucide-react'
import { customerOrders } from '@/features/customer/data/account'
import { useAuthStore } from '@/store/appStore'
import { storeProductById } from '@/features/customer/products/data/products'
import { StoreOrderStatusBadge } from '@/features/customer/orders/components/store-status-badge'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatINR, formatDateTime } from '@/utils'
import type { StoreOrderStatus } from '@/features/customer/types'

type Tab = 'active' | 'delivered' | 'cancelled' | 'all'

const ACTIVE: StoreOrderStatus[] = ['placed', 'confirmed', 'shipped', 'in-transit', 'out-for-delivery']

export function MyOrdersPage() {
  const session = useAuthStore((s) => s.session)
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')

  const orders = useMemo(() => {
    const term = query.trim().toLowerCase()
    return customerOrders
      .filter((o) => {
        if (tab === 'active' && !ACTIVE.includes(o.status)) return false
        if (tab === 'delivered' && o.status !== 'delivered') return false
        if (tab === 'cancelled' && o.status !== 'cancelled') return false
        if (term) {
          const productNames = o.items.map((i) => i.name).join(' ').toLowerCase()
          if (!o.orderNumber.toLowerCase().includes(term) && !productNames.includes(term)) return false
        }
        return true
      })
      .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))
  }, [tab, query])

  if (!session) return <Navigate to="/shop/login?redirect=/shop/orders/mine" replace />

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">My orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{session.profile.name} · {customerOrders.length} orders in this account</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order no. or product" className="pl-9" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All ({customerOrders.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({customerOrders.filter((o) => ACTIVE.includes(o.status)).length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({customerOrders.filter((o) => o.status === 'delivered').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({customerOrders.filter((o) => o.status === 'cancelled').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {orders.length === 0 ? (
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
            const firstProduct = storeProductById(order.items[0]?.productId ?? '')
            const active = ACTIVE.includes(order.status)
            return (
              <div key={order.id} className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-foreground">{order.orderNumber}</span>
                    <StoreOrderStatusBadge status={order.status} />
                  </div>
                  <span className="text-xs text-muted-foreground">Placed {formatDateTime(order.placedAt)}</span>
                </div>
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <ProductArt hue={firstProduct?.hue ?? 336} pattern={firstProduct?.pattern ?? 1} label={order.items[0]?.name ?? 'Order'} className="size-16 shrink-0 rounded-2xl" />
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-serif text-sm font-bold text-foreground">{order.items[0]?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} line item(s) · {order.items.reduce((n, i) => n + i.quantity, 0)} pc(s)
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Deliver to {order.addressCity} · ETA {order.estDelivery}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4 sm:ml-auto sm:mt-0 sm:flex-col sm:items-end">
                    <p className="text-base font-bold text-foreground">{formatINR(order.total)}</p>
                    <div className="flex gap-2">
                      {active && (
                        <Button asChild size="sm" variant="outline" className="rounded-full">
                          <Link to={`/shop/orders/${encodeURIComponent(order.id)}/track`}>
                            <Truck className="size-3.5" /> Track
                          </Link>
                        </Button>
                      )}
                      <Button asChild size="sm" className="rounded-full">
                        <Link to={`/shop/orders/${encodeURIComponent(order.id)}`}>Details</Link>
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