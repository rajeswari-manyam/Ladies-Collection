import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
  type ApiCategory,
} from '@/services/category.service'
import {
  createSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  updateSubcategory,
  updateSubcategoryStatus,
  type ApiSubcategory,
} from '@/services/subcategory.service'
import {
  approveVendor,
  getAllVendors,
  getVendorById,
  rejectVendor,
  updateVendorStatus,
  type ApiVendorProfile,
} from '@/services/vendor.service'
import {
  approveProduct,
  deleteProduct,
  getAllAdminProducts,
  productRefId,
  rejectProduct,
  updateProduct,
  updateProductStatus,
  type ApiProduct,
  type UpdateProductInput,
} from '@/services/product.service'
import {
  createVariant,
  deleteVariant,
  getVariants,
  updateVariant,
  updateVariantStock,
  type ApiProductVariant,
  type CreateVariantInput,
} from '@/services/variant.service'
import { useAdminStore } from '@/store/appStore'
import { getAdminOrders, updateOrderStatus as updateOrderStatusApi } from '@/services/order.service'
import { toAdminOrder } from '@/features/admin/orders/adapter'
import { toApiOrderStatus } from '@/features/vendor/orders/adapter'
import { toPortalShipment } from '@/features/vendor/shipping/adapter'
import {
  getVendorShipments,
  updateShipmentStatus as updateShipmentStatusApi,
  type ShipmentStatus as ApiShipmentStatus,
} from '@/services/shipment.service'

export interface UpdateShipmentStatusArgs {
  id: string
  status: ApiShipmentStatus
  location?: string
  description?: string
}
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
import { payments, shipmentStatusOrder } from '@/features/admin/payments/data/payments'
import { products } from '@/features/admin/products/data/products'
import { settings } from '@/features/admin/settings/data/settings'
import { notifications, settlements } from '@/features/admin/settlements/data/settlements'
import { vendors as staticVendors } from '@/features/admin/vendors/data/vendors'
import type { Category, OrderStatus, Product, Vendor } from '@/features/admin/types'
import type {
  PaymentStatus,
  ProductStatus,
  SettlementStatus,
  ShipmentStatus,
  Subcategory,
} from '@/types'

function adminToken(): string {
  return useAdminStore.getState().session?.token ?? ''
}

function hexToHue(hex?: string, fallback = 336): number {
  if (!hex) return fallback
  const raw = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(raw)) return fallback
  const r = parseInt(raw.slice(0, 2), 16) / 255
  const g = parseInt(raw.slice(2, 4), 16) / 255
  const b = parseInt(raw.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let h
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  const hue = Math.round((h as number) * 60)
  return hue < 0 ? hue + 360 : hue
}

function hueToHex(hue: number): string {
  const normalized = ((hue % 360) + 360) % 360
  const c = 0.7
  const x = c * (1 - Math.abs(((normalized / 60) % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (normalized < 60) {
    r = c
    g = x
  } else if (normalized < 120) {
    r = x
    g = c
  } else if (normalized < 180) {
    g = c
    b = x
  } else if (normalized < 240) {
    g = x
    b = c
  } else if (normalized < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const to = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase()
}

function toFrontendCategory(item: ApiCategory): Category {
  return {
    id: item._id,
    name: item.name,
    slug: item.slug ?? item.name.trim().toLowerCase().replace(/\s+/g, '-'),
    description: item.description ?? '',
    image: item.image ?? item.slug ?? '',
    productCount: 0,
    featured: item.isFeatured ?? false,
    hue: hexToHue(item.accentColor),
  }
}

function toFrontendSubcategory(item: ApiSubcategory): Subcategory {
  const categoryId = typeof item.categoryId === 'string' ? item.categoryId : (item.categoryId?._id ?? '')
  return {
    id: item._id,
    categoryId,
    name: item.name,
    slug: item.slug ?? item.name.trim().toLowerCase().replace(/\s+/g, '-'),
    productCount: 0,
  }
}

function toAdminVendor(item: ApiVendorProfile): Vendor {
  const address = item.businessAddress
  const apiStatus = item.status?.toLowerCase()
  return {
    id: item._id,
    name: item.businessName,
    brand: item.businessName,
    email: item.email,
    phone: item.mobile,
    category: '',
    location: address ? `${address.city}, ${address.state}`.trim() : '—',
    rating: 0,
    ordersCount: 0,
    productsCount: 0,
    revenue: 0,
    commissionRate: 0,
    status: apiStatus === 'active' ? 'active' : apiStatus === 'inactive' || apiStatus === 'suspended' ? 'suspended' : 'pending',
    joined: item.createdAt?.slice(0, 10) ?? '',
    logoHue: 336,
    verificationStatus: item.verificationStatus,
    gstNumber: item.gstNumber,
  }
}

function toAdminProductUi(item: ApiProduct): Product {
  return {
    id: item._id,
    name: item.name,
    brand: item.brand,
    description: item.description,
    price: 0,
    compareAtPrice: null,
    categoryId: productRefId(item.categoryId),
    subcategoryId: productRefId(item.subCategoryId),
    vendorId: productRefId(item.vendorId),
    color: '',
    rating: 0,
    reviews: 0,
    sold: 0,
    stock: 0,
    status: item.status === 'active' ? 'active' : 'draft',
    featured: false,
    tags: [],
    createdAt: item.createdAt ?? '',
  }
}

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
      staticVendors,
    }),
  })
}

export function useProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      try {
        const page = await getAllAdminProducts(adminToken(), { page: 1, limit: 100 })
        return page.products.length > 0 ? page.products.map(toAdminProductUi) : products
      } catch {
        return products
      }
    },
  })
}

export function useOrders(status?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', status ?? 'all'],
    queryFn: async () => {
      try {
        const page = await getAdminOrders(adminToken(), status)
        return page.orders.map(toAdminOrder)
      } catch {
        return []
      }
    },
  })
}

export function useCustomers() {
  return useQuery({ queryKey: ['admin', 'customers'], queryFn: async () => customers })
}

export function useVendors() {
  return useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: async () => {
      const page = await getAllVendors(adminToken(), { page: 1, limit: 100 })
      return page.vendors.length > 0 ? page.vendors.map(toAdminVendor) : staticVendors
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const [catItems, subItems] = await Promise.all([
        getAllCategories({ page: 1, limit: 100 }),
        getAllSubcategories({ page: 1, limit: 100 }),
      ])
      return {
        categories: catItems.map(toFrontendCategory),
        subcategories: subItems.subCategories.map(toFrontendSubcategory),
      }
    },
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
      const created = await createCategory(adminToken(), {
        name: payload.name.trim(),
        description: payload.description?.trim(),
        isFeatured: payload.featured,
        accentColor: hueToHex(payload.hue ?? 336),
      })
      return toFrontendCategory(created)
    },
  })
}

export function useUpdateCategory() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: { name: string; description?: string; featured?: boolean; hue?: number }
    }) => {
      const updated = await updateCategory(adminToken(), id, {
        name: payload.name.trim(),
        description: payload.description?.trim(),
        isFeatured: payload.featured,
        accentColor: hueToHex(payload.hue ?? 336),
      })
      return toFrontendCategory(updated)
    },
  })
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteCategory(adminToken(), id)
      return id
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
  return useQuery({
    queryKey: ['admin', 'shipments'],
    queryFn: async () => {
      try {
        const page = await getVendorShipments(adminToken())
        return page.shipments.map(toPortalShipment)
      } catch {
        return []
      }
    },
  })
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, location, description }: UpdateShipmentStatusArgs) => {
      await updateShipmentStatusApi(adminToken(), id, { shipmentStatus: status, location, description })
      return { id, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'shipments'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })
}

export function useSettlements() {
  return useQuery({ queryKey: ['admin', 'settlements'], queryFn: async () => settlements })
}

export function useSettings() {
  return useQuery({ queryKey: ['admin', 'settings'], queryFn: async () => settings })
}

export function useProductApprovals() {
  return useQuery({
    queryKey: ['admin', 'approvals'],
    queryFn: async () => {
      try {
        const page = await getAllAdminProducts(adminToken(), { page: 1, limit: 100 })
        return page.products
      } catch {
        return [] as ApiProduct[]
      }
    },
  })
}

export function useProductVariants() {
  return useQuery({
    queryKey: ['admin', 'product-variants'],
    queryFn: async () => {
      try {
        return await getVariants(adminToken())
      } catch {
        return [] as ApiProductVariant[]
      }
    },
  })
}

export function useAddVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateVariantInput) => {
      const created = await createVariant(adminToken(), input)
      queryClient.invalidateQueries({ queryKey: ['admin', 'product-variants'] })
      return created
    },
  })
}

export function useUpdateVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Parameters<typeof updateVariant>[2] }) => {
      const updated = await updateVariant(adminToken(), id, patch)
      queryClient.invalidateQueries({ queryKey: ['admin', 'product-variants'] })
      return updated
    },
  })
}

export function useDeleteVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteVariant(adminToken(), id)
      queryClient.invalidateQueries({ queryKey: ['admin', 'product-variants'] })
      return result
    },
  })
}

export function useAddProduct() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => ({ ok: true, payload }),
  })
}

export function useAddSubcategory() {
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string; categoryId: string; productCount?: number }) => {
      const created = await createSubcategory(adminToken(), {
        categoryId: payload.categoryId,
        name: payload.name.trim(),
        slug: payload.slug,
      })
      return toFrontendSubcategory(created)
    },
  })
}

export function useUpdateSubcategory() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: { name: string; slug: string; categoryId: string }
    }) => {
      const updated = await updateSubcategory(adminToken(), id, {
        categoryId: payload.categoryId,
        name: payload.name.trim(),
        slug: payload.slug,
      })
      return toFrontendSubcategory(updated)
    },
  })
}

export function useDeleteSubcategory() {
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteSubcategory(adminToken(), id)
      return id
    },
  })
}

export function useUpdateSubcategoryStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updated = await updateSubcategoryStatus(adminToken(), id, status)
      return toFrontendSubcategory(updated)
    },
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      await updateOrderStatusApi(adminToken(), id, { orderStatus: toApiOrderStatus(status) })
      return { id, status }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
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
      const current = await getVendorById(adminToken(), id)
      const nextStatus = current.status?.toLowerCase() === 'active' ? 'suspended' : 'active'
      const updated = await updateVendorStatus(adminToken(), id, nextStatus)
      return { id, status: updated.status }
    },
  })
}

export function useApproveVendor() {
  return useMutation({
    mutationFn: async (id: string) => {
      const updated = await approveVendor(adminToken(), id)
      return toAdminVendor(updated)
    },
  })
}

export function useRejectVendor() {
  return useMutation({
    mutationFn: async (id: string) => {
      const updated = await rejectVendor(adminToken(), id)
      return toAdminVendor(updated)
    },
  })
}

export function useApproveProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await approveProduct(adminToken(), id)
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] }),
  })
}

export function useRejectProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; reason: string }) => {
      await rejectProduct(adminToken(), id)
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] }),
  })
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateProductStatus(adminToken(), id, status)
      return { id, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] })
    },
  })
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: UpdateProductInput }) => {
      const updated = await updateProduct(adminToken(), id, patch)
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      return updated
    },
  })
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteProduct(adminToken(), id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] })
    },
  })
}

export function useUpdateVariantStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const updated = await updateVariantStock(adminToken(), id, stock)
      return { id, stock: updated.stock }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'product-variants'] }),
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
