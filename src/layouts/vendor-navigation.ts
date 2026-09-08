import {
  Boxes,
  LayoutDashboard,
  Package,
  ReceiptIndianRupee,
  ShoppingBag,
  Store,
  Truck,
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
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Earnings', to: '/vendor/earnings', icon: ReceiptIndianRupee },
      { title: 'Settlements', to: '/vendor/settlements', icon: Wallet },
    ],
  },
  {
    title: 'Account',
    items: [{ title: 'Profile', to: '/vendor/profile', icon: UserRound }],
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
  if (pathname === '/vendor/earnings') return 'Earnings'
  if (pathname === '/vendor/settlements') return 'Settlements'
  if (/^\/vendor\/settlements\/[\w-]+$/.test(pathname)) return 'Settlement Details'
  if (pathname === '/vendor/profile') return 'Profile'
  return 'Fashion Trends'
}

export type { NavItem }