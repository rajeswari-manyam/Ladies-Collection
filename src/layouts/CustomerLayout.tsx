import { Outlet, ScrollRestoration } from 'react-router-dom'
import { StoreHeader } from '@/layouts/CustomerHeader'
import { StoreFooter } from '@/layouts/CustomerFooter'

export function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollRestoration />
      <StoreHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
    </div>
  )
}