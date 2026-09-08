import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Clock3,
  Download,
  IndianRupee,
  PackageCheck,
  ShoppingBag,
  Store,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDashboard, useOrders, useProducts } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { StatCard, StatCardSkeleton } from '@/components/common/stat-card'
import { SalesChart } from '@/components/charts/sales-chart'
import { OrdersChart } from '@/components/charts/orders-chart'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { CategoryDonut } from '@/components/charts/category-donut'
import { VendorChart } from '@/components/charts/vendor-chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/state'
import { OrderStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate, formatNumber, timeAgo } from '@/utils'
import type { Order } from '@/features/admin/types'

const alerts = [
  { label: 'Pending orders', to: '/orders', icon: Clock3, tint: 'text-amber-600 bg-amber-500/10' },
  { label: 'Low-stock products', to: '/inventory', icon: TriangleAlert, tint: 'text-rose-600 bg-rose-500/10' },
  { label: 'Pending settlements', to: '/settlements', icon: Wallet, tint: 'text-primary bg-blush-100' },
] as const

export function DashboardPage() {
  const { data: dash, isLoading, isError, refetch } = useDashboard()
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: products } = useProducts()

  const recentOrders = useMemo(
    () =>
      orders
        ? [...orders]
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .slice(0, 6)
        : [],
    [orders],
  )

  const topSelling = useMemo(
    () => (products ? [...products].sort((a, b) => b.sold - a.sold).slice(0, 5) : []),
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
        title="Good morning, Adriana"
        description={`Here is what is happening across your marketplace on ${formatDate(new Date())}.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Report exported', { description: 'mock-export-sales-sep.csv queued for download.' })}
          >
            <Download className="size-4" />
            Export report
          </Button>
        }
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
              icon={<IndianRupee className="size-4.5" />}
              data={{ label: 'Total Sales', value: kpis.revenue, delta: kpis.revenueDelta, format: 'currency', hint: 'vs last month' }}
            />
            <StatCard
              index={1}
              icon={<PackageCheck className="size-4.5" />}
              data={{ label: 'Total Orders', value: kpis.orders, delta: kpis.ordersDelta, format: 'number', hint: 'vs last month' }}
            />
            <StatCard
              index={2}
              icon={<Store className="size-4.5" />}
              data={{ label: 'Total Vendors', value: kpis.vendors, delta: kpis.vendorsDelta, format: 'number', hint: 'vs last month' }}
            />
            <StatCard
              index={3}
              icon={<ShoppingBag className="size-4.5" />}
              data={{ label: 'Total Products', value: kpis.products, delta: kpis.productsDelta, format: 'number', hint: 'vs last month' }}
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
                    ? (dash ? formatNumber(dash.pendingOrdersCount) : '—')
                    : i === 1
                      ? (dash ? formatNumber(dash.lowStockCount) : '—')
                      : (dash ? formatCurrency(dash.pendingSettlementsValue) : '—')}
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
              <CardTitle>Sales</CardTitle>
              <CardDescription>Disbursed to vendors vs marketplace fees, last 12 months</CardDescription>
            </div>
            <Badge variant="rose" className="mt-1">
              <IndianRupee className="size-3" />
              {dash ? formatCurrency(dash.kpis.revenue, true) : '—'} this month
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : dash ? (
              <SalesChart data={dash.salesVsFees} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Share of catalog GMV</CardDescription>
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
            <CardDescription>Orders placed per month</CardDescription>
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
            <Badge variant="rose" className="mt-1">+12.4% YoY</Badge>
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
          <CardHeader>
            <CardTitle>Vendor Performance</CardTitle>
            <CardDescription>By lifetime revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : dash ? <VendorChart data={dash.vendorPerformance} /> : null}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top products</CardTitle>
              <CardDescription>Best sellers across the marketplace</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {topSelling.map((p) => (
                <div key={p.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">{formatCurrency(p.price)}</p>
                    <p className="text-xs text-muted-foreground">{formatNumber(p.sold)} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest activity across vendors</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">
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
                {recentOrders.map((order: Order) => (
                  <div key={order.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <Link to={`/orders/${order.id}`} className="truncate text-sm font-medium hover:text-primary">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && (
                          <span className="text-muted-foreground"> +{order.items.length - 1} more</span>
                        )}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {order.orderNumber} · {timeAgo(order.createdAt)}
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 rounded-2xl border border-blush-200 bg-gradient-to-br from-blush-50 to-white p-5 text-sm"
        >
          <div>
            <p className="font-medium text-primary">Current month</p>
            <p className="mt-1 font-serif text-3xl font-semibold tracking-tight">
              {dash ? formatCurrency(dash.kpis.revenue) : '—'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Lifetime GMV {dash ? formatCurrency(dash.lifetimeGmv) : '—'} · margin{' '}
              {dash ? `${Math.round(dash.grossMargin * 100)}%` : '—'}
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This portal runs entirely on realistic mock data — no backend APIs, live payments, or real customer or vendor
            information are used anywhere in this build.
          </p>
        </motion.div>
      </div>
    </div>
  )
}