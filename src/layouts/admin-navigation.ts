import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Wallet,
} from 'lucide-react'

export interface NavItem {
  title: string
  to: string
  icon: LucideIcon
  badge?: 'cart'
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    title: 'Catalog',
    items: [
      { title: 'Categories', to: '/categories', icon: LayoutGrid },
      { title: 'Sub-Categories', to: '/sub-categories', icon: Layers },
      { title: 'Products', to: '/products', icon: ShoppingBag },
      { title: 'Product Approval', to: '/product-approval', icon: ShieldCheck },
      { title: 'Product Variants', to: '/product-variants', icon: Boxes },
      { title: 'Pricing & Options', to: '/pricing-options', icon: Tags },
    ],
  },
  {
    title: 'Sellers',
    items: [{ title: 'Vendors', to: '/vendors', icon: Store }],
  },
  {
    title: 'Orders & Payments',
    items: [
      { title: 'Orders', to: '/orders', icon: Package },
      { title: 'Payments', to: '/payments', icon: CreditCard },
      { title: 'Shipping & Tracking', to: '/shipments', icon: Truck },
    ],
  },
  {
    title: 'Payouts',
    items: [{ title: 'Vendor Settlements', to: '/settlements', icon: Wallet }],
  },
  {
    title: 'Insights & System',
    items: [
      { title: 'Reports', to: '/reports', icon: BarChart3 },
      { title: 'Notifications', to: '/notifications', icon: Bell },
      { title: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

export const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/categories': 'Categories',
  '/sub-categories': 'Sub-Categories',
  '/products': 'Products',
  '/product-approval': 'Product Approval',
  '/product-variants': 'Product Variants',
  '/pricing-options': 'Pricing & Additional Options',
  '/inventory': 'Inventory',
  '/vendors': 'Vendors',
  '/orders': 'Orders',
  '/payments': 'Payments',
  '/shipments': 'Shipping & Tracking',
  '/settlements': 'Vendor Settlements',
  '/customers': 'Customers',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/about': 'About',
}

const detailPrefixes: Record<string, string> = {
  '/vendors/': 'Vendor Details',
  '/orders/': 'Order Details',
  '/settlements/': 'Settlement Details',
}

export function resolveTitle(pathname: string) {
  for (const [prefix, label] of Object.entries(detailPrefixes)) {
    if (pathname.startsWith(prefix)) return label
  }
  return routeTitles[pathname] ?? 'Ladies Collection'
}