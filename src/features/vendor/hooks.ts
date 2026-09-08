import { useMutation, useQuery } from '@tanstack/react-query'
import {
  payoutLedger,
  vendorDashboard,
  vendorOrders,
  vendorProductVariants,
  vendorProducts,
  vendorProfile,
  vendorSettlements,
  vendorShipments,
} from '@/features/vendor/data/vendor-portal'
import type { OrderStatus, ProductStatus } from '@/features/vendor/types'

export function useVendorDashboard() {
  return useQuery({ queryKey: ['vendor', 'dashboard'], queryFn: async () => vendorDashboard })
}

export function useVendorOrders() {
  return useQuery({ queryKey: ['vendor', 'orders'], queryFn: async () => vendorOrders })
}

export function useVendorProducts() {
  return useQuery({ queryKey: ['vendor', 'products'], queryFn: async () => vendorProducts })
}

export function useVendorProfile() {
  return useQuery({ queryKey: ['vendor', 'profile'], queryFn: async () => vendorProfile })
}

export function useVendorProductVariants() {
  return useQuery({ queryKey: ['vendor', 'product-variants'], queryFn: async () => vendorProductVariants })
}

export function useVendorShipments() {
  return useQuery({ queryKey: ['vendor', 'shipments'], queryFn: async () => vendorShipments })
}

export function useVendorSettlements() {
  return useQuery({ queryKey: ['vendor', 'settlements'], queryFn: async () => vendorSettlements })
}

export function useVendorEarnings() {
  return useQuery({
    queryKey: ['vendor', 'earnings'],
    queryFn: async () => ({
      ledger: payoutLedger,
      total: payoutLedger.reduce((sum, row) => sum + row.net, 0),
      currentEarnings: vendorDashboard.kpis.currentEarnings,
      lifetimeEarnings: 1243500,
      thisMonth: 24500,
      commissionRate: 0.12,
      monthly: vendorDashboard.revenueSeries,
      currentSettlement: vendorDashboard.kpis.currentSettlement,
      avgOrderValue: 2740,
    }),
  })
}

export function useVendorOrder(id: string) {
  return useQuery({
    queryKey: ['vendor', 'order', id],
    queryFn: async () => vendorOrders.find((order) => order.id === id) ?? null,
  })
}

export function useVendorProduct(id: string) {
  return useQuery({
    queryKey: ['vendor', 'product', id],
    queryFn: async () => vendorProducts.find((product) => product.id === id) ?? null,
  })
}

export function useVendorSettlement(id: string) {
  return useQuery({
    queryKey: ['vendor', 'settlement', id],
    queryFn: async () => vendorSettlements.find((settlement) => settlement.id === id) ?? null,
  })
}

export function useVendorNotifications() {
  return useQuery({
    queryKey: ['vendor', 'notifications'],
    queryFn: async () => [
      {
        id: 'vn-1',
        title: 'New order received',
        message: 'A new order has been placed for a Banarasi Silk Saree.',
        read: false,
        createdAt: '2026-09-07T11:40:00',
      },
      {
        id: 'vn-2',
        title: 'Low stock alert',
        message: 'Your Organza Embroidered Lehenga is almost sold out.',
        read: true,
        createdAt: '2026-09-06T16:20:00',
      },
    ],
  })
}

export function useUpdateVendorOrderStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const item = vendorOrders.find((order) => order.id === id)
      if (item) item.status = status
      return { id, status }
    },
  })
}

export function useSetVendorProductStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProductStatus }) => {
      const item = vendorProducts.find((product) => product.id === id)
      if (item) item.status = status
      return { id, status }
    },
  })
}

export function useUpdateVendorVariantStock() {
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const item = vendorProductVariants.find((variant) => variant.id === id)
      if (item) item.stock = stock
      return { id, stock }
    },
  })
}

export function useCreateVendorProduct() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => ({ ok: true, payload }),
  })
}

export function useUpdateVendorProduct() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => ({ ok: true, payload }),
  })
}

export function useMarkVendorNotificationRead() {
  return useMutation({
    mutationFn: async (id: string) => {
      const items = await useVendorNotifications().data
      if (items) {
        const item = items.find((notification) => notification.id === id)
        if (item) item.read = true
      }
      return id
    },
  })
}

export function useMarkAllVendorNotificationsRead() {
  return useMutation({
    mutationFn: async () => {
      const items = await useVendorNotifications().data
      if (items) {
        items.forEach((notification) => {
          notification.read = true
        })
      }
      return true
    },
  })
}

export type { OrderStatus, ProductStatus }
