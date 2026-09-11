import { useMutation, useQuery } from '@tanstack/react-query'
import { categories } from '@/features/admin/categories/data/categories'
import { customers } from '@/features/admin/customers/data/customers'
import {
  bestSellingCategory,
  avgRating,
  categorySales,
  dashboardKpis,
  lifetimeGmv,
  ordersSeries,
  pendingOrdersCount,
  pendingPayouts,
  pendingSettlementsValue,
  revenueSeries,
  salesVsFees,
  shippedToday,
  topProducts,
  vendorPerformance,
} from '@/features/admin/dashboard/data/dashboard'
import { orders, orderStatusOrder } from '@/features/admin/orders/data/orders'
import { payments, shipments, shipmentStatusOrder } from '@/features/admin/payments/data/payments'
import { productApprovals } from '@/features/admin/products/data/product-approvals'
import { productVariants, products } from '@/features/admin/products/data/products'
import { settings } from '@/features/admin/settings/data/settings'
import { notifications, settlements } from '@/features/admin/settlements/data/settlements'
import { subcategories } from '@/features/admin/subcategories/data/subcategories'
import { vendors } from '@/features/admin/vendors/data/vendors'
import type { Category, OrderStatus } from '@/features/admin/types'
import type { PaymentStatus, ProductStatus, SettlementStatus, ShipmentStatus } from '@/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => ({
      kpis: dashboardKpis,
      pendingOrdersCount,
      lowStockCount: 16,
      pendingSettlementsValue,
      pendingPayouts,
      lifetimeGmv,
      grossMargin: 0.32,
      avgRating,
      bestSellingCategory,
      revenueSeries,
      salesVsFees,
      ordersSeries,
      categorySales,
      vendorPerformance,
      topProducts,
      shippedToday,
      orders,
      products,
      vendors,
    }),
  })
}

export function useProducts() {
  return useQuery({ queryKey: ['admin', 'products'], queryFn: async () => products })
}

export function useOrders() {
  return useQuery({ queryKey: ['admin', 'orders'], queryFn: async () => orders })
}

export function useCustomers() {
  return useQuery({ queryKey: ['admin', 'customers'], queryFn: async () => customers })
}

export function useVendors() {
  return useQuery({ queryKey: ['admin', 'vendors'], queryFn: async () => vendors })
}

export function useCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => ({ categories: [...categories], subcategories: [...subcategories] }),
  })
}

export function useAddCategory() {
  return useMutation({
    mutationFn: async (payload: {
      name: string
      description?: string
      featured?: boolean
      hue?: number
    }) => {
      const slug = payload.name.trim().toLowerCase().replace(/\s+/g, '-')
      const next: Category = {
        id: `cat-${slug}-${Date.now().toString(36)}`,
        name: payload.name.trim(),
        slug,
        description: payload.description?.trim() ?? '',
        image: slug,
        productCount: 0,
        featured: payload.featured ?? false,
        hue: payload.hue ?? 336,
      }
      categories.push(next)
      return next
    },
  })
}

export function useNotifications() {
  return useQuery({ queryKey: ['admin', 'notifications'], queryFn: async () => notifications })
}

export function usePayments() {
  return useQuery({ queryKey: ['admin', 'payments'], queryFn: async () => payments })
}

export function useShipments() {
  return useQuery({ queryKey: ['admin', 'shipments'], queryFn: async () => shipments })
}

export function useSettlements() {
  return useQuery({ queryKey: ['admin', 'settlements'], queryFn: async () => settlements })
}

export function useSettings() {
  return useQuery({ queryKey: ['admin', 'settings'], queryFn: async () => settings })
}

export function useProductApprovals() {
  return useQuery({ queryKey: ['admin', 'approvals'], queryFn: async () => productApprovals })
}

export function useProductVariants() {
  return useQuery({ queryKey: ['admin', 'product-variants'], queryFn: async () => productVariants })
}

export function useAddProduct() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => ({ ok: true, payload }),
  })
}

export function useAddSubcategory() {
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string; categoryId: string; productCount?: number }) => ({
      ok: true,
      payload,
    }),
  })
}

export function useUpdateProductPricing() {
  return useMutation({
    mutationFn: async (payload: {
      id: string
      price: number
      compareAtPrice?: number | null
      stock?: number
      featured?: boolean
      tags?: string[]
    }) => ({
      ok: true,
      payload,
    }),
  })
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const item = orders.find((order) => order.id === id)
      if (item) item.status = status
      return { id, status }
    },
  })
}

export function useUpdateSettlementStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SettlementStatus }) => {
      const item = settlements.find((settlement) => settlement.id === id)
      if (item) item.status = status
      return { id, status }
    },
  })
}

export function useToggleVendorStatus() {
  return useMutation({
    mutationFn: async (id: string) => {
      const item = vendors.find((vendor) => vendor.id === id)
      const nextStatus = item && item.status === 'suspended' ? 'active' : 'suspended'
      if (item) item.status = nextStatus
      return { id, status: nextStatus }
    },
  })
}

export function useApproveProduct() {
  return useMutation({
    mutationFn: async (id: string) => {
      const item = productApprovals.find((approval) => approval.id === id)
      if (item) item.status = 'approved'
      return id
    },
  })
}

export function useRejectProduct() {
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const item = productApprovals.find((approval) => approval.id === id)
      if (item) {
        item.status = 'rejected'
        item.reason = reason
      }
      return { id, reason }
    },
  })
}

export function useUpdateVariantStock() {
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const item = productVariants.find((variant) => variant.id === id)
      if (item) item.stock = stock
      return { id, stock }
    },
  })
}

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: async (id: string) => {
      const item = notifications.find((notification) => notification.id === id)
      if (item) item.read = true
      return id
    },
  })
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: async () => {
      notifications.forEach((notification) => {
        notification.read = true
      })
      return true
    },
  })
}

export const adminHookExports = {
  orderStatusOrder,
  shipmentStatusOrder,
}

export type { OrderStatus, PaymentStatus, ProductStatus, ShipmentStatus }
