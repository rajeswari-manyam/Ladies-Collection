import type {
  CategorySale,
  DashboardKpis,
  RevenuePoint,
  SalesPoint,
  VendorPerformance,
} from '@/features/admin/types'
import { orders } from '@/features/admin/orders/data/orders'
import { products } from '@/features/admin/products/data/products'
import { vendors } from '@/features/admin/vendors/data/vendors'

export const dashboardKpis: DashboardKpis = {
  revenue: 845750,
  revenueDelta: 12.4,
  orders: 326,
  ordersDelta: 8.1,
  vendors: 42,
  vendorsDelta: 3.7,
  products: 1248,
  productsDelta: 5.2,
}

export const bestSellingCategory = 'Dresses'
export const avgRating = 4.7

export const revenueSeries: RevenuePoint[] = [
  { month: 'Oct', revenue: 584000, orders: 249 },
  { month: 'Nov', revenue: 641000, orders: 273 },
  { month: 'Dec', revenue: 746000, orders: 320 },
  { month: 'Jan', revenue: 615000, orders: 262 },
  { month: 'Feb', revenue: 590000, orders: 251 },
  { month: 'Mar', revenue: 676000, orders: 283 },
  { month: 'Apr', revenue: 647000, orders: 271 },
  { month: 'May', revenue: 723000, orders: 296 },
  { month: 'Jun', revenue: 704000, orders: 289 },
  { month: 'Jul', revenue: 766000, orders: 305 },
  { month: 'Aug', revenue: 793000, orders: 312 },
  { month: 'Sep', revenue: 845750, orders: 326 },
]

export const salesVsFees: SalesPoint[] = [
  { label: 'Oct', disbursed: 502000, fees: 37300 },
  { label: 'Nov', disbursed: 552000, fees: 41000 },
  { label: 'Dec', disbursed: 641000, fees: 47600 },
  { label: 'Jan', disbursed: 528000, fees: 39200 },
  { label: 'Feb', disbursed: 507000, fees: 37600 },
  { label: 'Mar', disbursed: 581000, fees: 43200 },
  { label: 'Apr', disbursed: 556000, fees: 41200 },
  { label: 'May', disbursed: 621000, fees: 46100 },
  { label: 'Jun', disbursed: 605000, fees: 45000 },
  { label: 'Jul', disbursed: 659000, fees: 48900 },
  { label: 'Aug', disbursed: 682000, fees: 50500 },
  { label: 'Sep', disbursed: 726000, fees: 53900 },
]

export const ordersSeries: { label: string; orders: number }[] = [
  { label: 'Oct', orders: 249 },
  { label: 'Nov', orders: 273 },
  { label: 'Dec', orders: 320 },
  { label: 'Jan', orders: 262 },
  { label: 'Feb', orders: 251 },
  { label: 'Mar', orders: 283 },
  { label: 'Apr', orders: 271 },
  { label: 'May', orders: 296 },
  { label: 'Jun', orders: 289 },
  { label: 'Jul', orders: 305 },
  { label: 'Aug', orders: 312 },
  { label: 'Sep', orders: 326 },
]

export const categorySales: CategorySale[] = [
  { name: 'Dresses', value: 38 },
  { name: 'Lingerie', value: 22 },
  { name: 'Bags', value: 16 },
  { name: 'Tops', value: 12 },
  { name: 'Jewelry', value: 7 },
  { name: 'Other', value: 5 },
]

export const vendorPerformance: VendorPerformance[] = vendors
  .filter((v) => v.status === 'active')
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5)
  .map((v) => ({ vendor: v.brand, revenue: v.revenue }))

export const topProducts = products
  .filter((p) => p.status === 'active')
  .sort((a, b) => b.sold - a.sold)
  .slice(0, 6)

export const shippedToday = orders.filter((o) => o.status === 'shipped').length
export const pendingOrdersCount = 28
export const lowStockCount = 16
export const pendingSettlementsValue = 124500
export const pendingPayouts = 2
export const lifetimeGmv = 8458000
export const grossMargin = 0.32
export const monthlyRevenue = revenueSeries.map((point) => ({ month: point.month, revenue: point.revenue }))