import { useMemo, useState } from 'react'
import { Download, FileBarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDashboard } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/state'
import { SalesChart } from '@/components/charts/sales-chart'
import { OrdersChart } from '@/components/charts/orders-chart'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { VendorChart } from '@/components/charts/vendor-chart'
import { formatCurrency, formatNumber } from '@/utils'

const RANGES = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
]

export function ReportsPage() {
  const { data: dash, isLoading, isError, refetch } = useDashboard()
  const [tab, setTab] = useState('sales')
  const [range, setRange] = useState('12')

  const months = Number(range)

  const sales = useMemo(() => (dash ? dash.salesVsFees.slice(-months) : []), [dash, months])
  const revenue = useMemo(() => (dash ? dash.revenueSeries.slice(-months) : []), [dash, months])
  const orders = useMemo(() => (dash ? dash.ordersSeries.slice(-months) : []), [dash, months])

  const totals = useMemo(() => {
    if (!dash) return null
    const slice = dash.revenueSeries.slice(-months)
    return {
      revenue: slice.reduce((s, p) => s + p.revenue, 0),
      orders: slice.reduce((s, p) => s + p.orders, 0),
    }
  }, [dash, months])

  const exportChart = (name: string) =>
    toast.success(`${name} report exported`, { description: `mock-export-${name.toLowerCase().replace(/\s+/g, '-')}.csv queued for download.` })

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
        eyebrow="Insights"
        title="Reports"
        description="Downloadable performance reports across sales, orders, vendors and customers."
        actions={
          <Button variant="outline" size="sm" onClick={() => exportChart('Marketplace')}>
            <Download className="size-4" />
            Export current
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading || !dash ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Gross sales (period)</p>
                <p className="mt-1 font-serif text-2xl font-semibold">{formatCurrency(totals?.revenue ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Orders (period)</p>
                <p className="mt-1 font-serif text-2xl font-semibold">{formatNumber(totals?.orders ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Avg order value</p>
                <p className="mt-1 font-serif text-2xl font-semibold">
                  {formatCurrency(totals && totals.orders ? totals.revenue / totals.orders : 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <TabsContent value="sales">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Sales snapshot</CardTitle>
                    <CardDescription>Disbursed to vendors vs marketplace fees</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportChart('Sales')}>
                    <FileBarChart2 className="size-4" />
                    CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <SalesChart data={sales} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Orders report</CardTitle>
                    <CardDescription>Orders placed per month</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportChart('Orders')}>
                    <FileBarChart2 className="size-4" />
                    CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <OrdersChart data={orders} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Revenue trending</CardTitle>
                    <CardDescription>GMV with order counts by month</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportChart('Revenue')}>
                    <FileBarChart2 className="size-4" />
                    CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenue} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendors">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Vendor performance</CardTitle>
                    <CardDescription>Lifetime revenue by partner brand</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportChart('Vendors')}>
                    <FileBarChart2 className="size-4" />
                    CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <VendorChart data={dash.vendorPerformance} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}