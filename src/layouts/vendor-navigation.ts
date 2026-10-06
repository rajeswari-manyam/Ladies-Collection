import {
  Banknote,
  Boxes,
  LayoutDashboard,
  Package,
  ReceiptIndianRupee,
  ShoppingBag,
  Store,
  Truck,
  Undo2,
  UserRound,
  Wallet,
} from 'lucide-react'
import type { NavItem, NavSection } from '@/layouts/admin-navigation'

export const vendorNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', to: '/vendor', icon: LayoutDashboard }],
  },
  {
    title: 'Catalog',
    items: [
      { title: 'Products', to: '/vendor/products', icon: Store },
      { title: 'Product Variants', to: '/vendor/product-variants', icon: Boxes },
      { title: 'Inventory', to: '/vendor/inventory', icon: Package },
    ],
  },
  {
    title: 'Orders & Fulfilment',
    items: [
      { title: 'Orders', to: '/vendor/orders', icon: ShoppingBag },
      { title: 'Shipping', to: '/vendor/shipping', icon: Truck },
      { title: 'Returns', to: '/vendor/returns', icon: Undo2 },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Earnings', to: '/vendor/earnings', icon: ReceiptIndianRupee },
      { title: 'Settlements', to: '/vendor/settlements', icon: Wallet },
      { title: 'Refunds', to: '/vendor/refunds', icon: Banknote },
    ],
  },
  {
    title: 'Account',
    items: [
      { title: 'Business Setup', to: '/vendor/business-setup', icon: Store },
      { title: 'Profile', to: '/vendor/profile', icon: UserRound },
    ],
  },
]

export function resolveVendorTitle(pathname: string) {
  if (pathname === '/vendor') return 'Dashboard'
  if (pathname === '/vendor/products') return 'Products'
  if (pathname === '/vendor/products/add') return 'Add Product'
  if (/^\/vendor\/products\/[\w-]+\/edit$/.test(pathname)) return 'Edit Product'
  if (pathname === '/vendor/product-variants') return 'Product Variants'
  if (pathname === '/vendor/inventory') return 'Inventory'
  if (pathname === '/vendor/orders') return 'Orders'
  if (/^\/vendor\/orders\/[\w-]+$/.test(pathname)) return 'Order Details'
  if (pathname === '/vendor/shipping') return 'Shipping'
  if (pathname === '/vendor/returns') return 'Returns'
  if (/^\/vendor\/returns\/[\w-]+$/.test(pathname)) return 'Return Details'
  if (pathname === '/vendor/earnings') return 'Earnings'
  if (pathname === '/vendor/settlements') return 'Settlements'
  if (/^\/vendor\/settlements\/[\w-]+$/.test(pathname)) return 'Settlement Details'
  if (pathname === '/vendor/refunds') return 'Refunds'
  if (/^\/vendor\/refunds\/[\w-]+$/.test(pathname)) return 'Refund Details'
  if (pathname === '/vendor/business-setup') return 'Business Setup'
  if (pathname === '/vendor/profile') return 'Profile'
  return 'Fashion Trends'
}

export type { NavItem }