import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Boxes,
  Clock3,
  IndianRupee,
  PackageCheck,
  ShoppingBag,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { useVendorDashboard, useVendorOrders, useVendorProducts } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { StatCard, StatCardSkeleton } from '@/components/common/stat-card'
import { SalesChart } from '@/components/charts/sales-chart'
import { OrdersChart } from '@/components/charts/orders-chart'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { CategoryDonut } from '@/components/charts/category-donut'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/state'
import { OrderStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate, formatNumber, timeAgo } from '@/utils'
import type { VendorOrder } from '@/features/vendor/data/vendor-portal'

const alerts = [
  { label: 'Pending orders', to: '/vendor/orders', icon: Clock3, tint: 'text-amber-600 bg-amber-500/10' },
  { label: 'Low-stock items', to: '/vendor/inventory', icon: TriangleAlert, tint: 'text-rose-600 bg-rose-500/10' },
  { label: 'Current settlement', to: '/vendor/settlements', icon: Wallet, tint: 'text-primary bg-blush-100' },
] as const

export function VendorDashboardPage() {
  const { data: dash, isLoading, isError, refetch } = useVendorDashboard()
  const { data: orders, isLoading: ordersLoading } = useVendorOrders()
  const { data: products } = useVendorProducts()

  const recentOrders = useMemo(
    () =>
      orders
        ? [...orders]
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .slice(0, 6)
        : [],
    [orders],
  )

  const recentProducts = useMemo(
    () => (products ? [...products].slice(0, 5) : []),
    [products],
  )

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  const kpis = dash?.kpis

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Good morning, Priya"
        description={`Here is what is happening across your catalog on ${formatDate(new Date())}.`}
        actions={<Badge variant="rose">Fashion Trends · VEN-1024</Badge>}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        kpis && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              icon={<ShoppingBag className="size-4.5" />}
              data={{ label: 'Total Products', value: kpis.totalProducts, delta: 9.2, format: 'number', hint: 'vs last month' }}
            />
            <StatCard
              index={1}
              icon={<PackageCheck className="size-4.5" />}
              data={{ label: 'Total Orders', value: kpis.totalOrders, delta: 7.8, format: 'number', hint: 'vs last month' }}
            />
            <StatCard
              index={2}
              icon={<IndianRupee className="size-4.5" />}
              data={{ label: 'Current Earnings', value: kpis.currentEarnings, delta: 6.4, format: 'currency', hint: 'available balance' }}
            />
            <StatCard
              index={3}
              icon={<Wallet className="size-4.5" />}
              data={{ label: 'Current Settlement', value: kpis.currentSettlement, delta: -4.1, format: 'currency', hint: 'next payout' }}
            />
          </div>
        )
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {alerts.map((alert, i) => (
          <Link key={alert.label} to={alert.to} className="group">
            <Card className="flex items-center gap-3 p-4 transition-colors hover:border-blush-300">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${alert.tint}`}>
                <alert.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{alert.label}</p>
                <p className="truncate font-serif text-xl font-semibold tracking-tight">
                  {i === 0
                    ? (dash ? formatNumber(dash.kpis.pendingOrders) : '—')
                    : i === 1
                      ? (dash ? formatNumber(dash.kpis.lowStock) : '—')
                      : (dash ? formatCurrency(dash.kpis.currentSettlement) : '—')}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Earnings</CardTitle>
              <CardDescription>Net payout to you vs commission charged, last 12 months</CardDescription>
            </div>
            <Badge variant="rose" className="mt-1">
              <IndianRupee className="size-3" />
              {dash ? formatCurrency(dash.kpis.currentEarnings, true) : '—'} this month
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-72 w-full" /> : dash ? <SalesChart data={dash.salesVsFees} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catalog mix</CardTitle>
            <CardDescription>Share of your sales by category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-52 w-full" /> : dash ? <CategoryDonut data={dash.categorySales} /> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Orders received per month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-72 w-full" /> : dash ? <OrdersChart data={dash.ordersSeries} /> : null}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Gross merchandise value, last 12 months</CardDescription>
            </div>
            <Badge variant="rose" className="mt-1">+6.4% MoM</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : dash ? (
              <RevenueChart data={dash.revenueSeries} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top products</CardTitle>
              <CardDescription>Your latest listings</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/vendor/products">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {recentProducts.map((p) => (
                <div key={p._id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand || 'Unbranded'}</p>
                  </div>
                  <Badge
                    variant={p.approvalStatus === 'approved' ? 'success' : p.approvalStatus === 'rejected' ? 'destructive' : 'warning'}
                    className="capitalize shrink-0"
                  >
                    {p.approvalStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest activity on your storefront</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/vendor/orders">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentOrders.map((order: VendorOrder) => (
                  <div key={order.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <Link to={`/vendor/orders/${order.id}`} className="truncate text-sm font-medium hover:text-primary">
                        {order.orderNumber}
                        <span className="text-muted-foreground"> · {order.customer}</span>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && (
                          <span className="text-muted-foreground"> +{order.items.length - 1} more</span>
                        )}{' '}
                        · {timeAgo(order.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                    <span className="w-20 shrink-0 text-right font-medium">{formatCurrency(order.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-4 rounded-2xl border border-blush-200 bg-gradient-to-br from-blush-50 to-white p-5 text-sm"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-primary">
            <Boxes className="size-5" />
          </span>
          <div>
            <p className="font-medium text-primary">Demo vendor workspace</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Everything here is mock data for Fashion Trends — no live orders, payments or inventory are connected.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}