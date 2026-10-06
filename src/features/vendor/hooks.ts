import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  payoutLedger,
  vendorDashboard,
  vendorProfile,
  type VendorNotification,
  type VendorProfile,
} from '@/features/vendor/data/vendor-portal'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getVendorProducts,
  updateProduct,
  updateProductStatus,
  type CreateProductInput,
  type UpdateProductInput,
} from '@/services/product.service'
import { getAllCategories } from '@/services/category.service'
import { getAllSubcategories } from '@/services/subcategory.service'
import {
  getVendorDashboard,
  getVendorProfile,
  registerVendor,
  updateVendorBankDetails,
  updateVendorProfile as updateVendorProfileApi,
  type ApiVendorProfile,
  type VendorRegisterInput,
} from '@/services/vendor.service'
import { useVendorStore } from '@/store/appStore'
import {
  getVendorSettlementById,
  getVendorSettlements,
  getVendorSettlementSummary,
  type SettlementQuery,
} from '@/services/settlement.service'
import { getOrderById, getVendorOrders, updateOrderStatus } from '@/services/order.service'
import { toApiOrderStatus, toVendorOrder } from '@/features/vendor/orders/adapter'
import { toVendorShipment } from '@/features/vendor/shipping/adapter'
import {
  createShipment,
  getShipmentsByOrder,
  getVendorShipments,
  requestPickup,
  updateShipmentStatus,
  type CreateShipmentInput,
  type RequestPickupInput,
  type ShipmentStatus,
} from '@/services/shipment.service'

export interface UpdateShipmentStatusArgs {
  id: string
  status: ShipmentStatus
  location?: string
  description?: string
}
import type { OrderStatus, ProductStatus } from '@/features/vendor/types'
import {
  createVariant,
  deleteVariant,
  getVariants,
  updateVariant,
  updateVariantStock,
  variantRefId,
  type ApiProductVariant,
  type CreateVariantInput,
} from '@/services/variant.service'

function vendorToken(): string {
  return useVendorStore.getState().session?.token ?? ''
}

function toVendorProfileShape(api: ApiVendorProfile): VendorProfile {
  const a = api.businessAddress
  return {
    id: api._id,
    businessName: api.businessName,
    vendorName: api.ownerName,
    email: api.email,
    phone: api.mobile,
    country: a?.country ?? '',
    state: a?.state ?? '',
    city: a?.city ?? '',
    category: '—',
    joined: api.createdAt?.slice(0, 10) ?? '',
    rating: 0,
    reviews: 0,
    gstin: api.gstNumber,
    status: api.status === 'active' ? 'active' : 'pending',
    payoutMethod: 'Bank transfer',
    payoutFrequency: '—',
    hue: 336,
    bank: {
      bank: api.bankDetails?.bankName ?? '—',
      account: api.bankDetails?.accountNumber ?? '',
      ifsc: api.bankDetails?.ifscCode ?? '',
      holder: api.bankDetails?.accountHolderName ?? '',
    },
  }
}

export function useVendorDashboard() {
  return useQuery({
    queryKey: ['vendor', 'dashboard'],
    queryFn: async () => {
      try {
        const dash = await getVendorDashboard(vendorToken())
        return {
          ...vendorDashboard,
          kpis: {
            ...vendorDashboard.kpis,
            totalProducts: dash.totalProducts,
            totalOrders: dash.totalOrders,
            currentEarnings: dash.totalRevenue,
          },
        }
      } catch {
        return vendorDashboard
      }
    },
  })
}

export function useVendorOrders() {
  return useQuery({
    queryKey: ['vendor', 'orders'],
    queryFn: async () => {
      try {
        const page = await getVendorOrders(vendorToken())
        return page.orders.map(toVendorOrder)
      } catch {
        return []
      }
    },
  })
}

export function useVendorProducts() {
  return useQuery({
    queryKey: ['vendor', 'products'],
    queryFn: async () => {
      try {
        const page = await getVendorProducts(vendorToken(), { page: 1, limit: 100 })
        return page.products
      } catch {
        return []
      }
    },
  })
}

export function useCatalogOptions() {
  return useQuery({
    queryKey: ['vendor', 'catalog-options'],
    queryFn: async () => {
      const [catItems, subItems] = await Promise.all([
        getAllCategories({ page: 1, limit: 100 }),
        getAllSubcategories({ page: 1, limit: 100 }),
      ])
      return {
        categories: catItems,
        subcategories: subItems.subCategories.map((s) => ({
          ...s,
          categoryId: typeof s.categoryId === 'string' ? s.categoryId : s.categoryId?._id ?? '',
        })),
      }
    },
  })
}

export function useVendorProfile() {
  return useQuery({
    queryKey: ['vendor', 'profile'],
    queryFn: async () => {
      try {
        return toVendorProfileShape(await getVendorProfile(vendorToken()))
      } catch {
        return vendorProfile
      }
    },
  })
}

/** Fields the marketplace needs before a seller can list a product. */
const SETUP_FIELDS = [
  { label: 'Business name', value: (p: ApiVendorProfile) => p.businessName },
  { label: 'Owner name', value: (p: ApiVendorProfile) => p.ownerName },
  { label: 'Email', value: (p: ApiVendorProfile) => p.email },
  { label: 'Mobile', value: (p: ApiVendorProfile) => p.mobile },
  { label: 'GST number', value: (p: ApiVendorProfile) => p.gstNumber },
  { label: 'PAN number', value: (p: ApiVendorProfile) => p.panNumber },
  { label: 'Address', value: (p: ApiVendorProfile) => p.businessAddress?.addressLine1 },
  { label: 'City', value: (p: ApiVendorProfile) => p.businessAddress?.city },
  { label: 'State', value: (p: ApiVendorProfile) => p.businessAddress?.state },
  { label: 'Pincode', value: (p: ApiVendorProfile) => p.businessAddress?.pincode },
]

/**
 * Whether the seller profile is filled in enough to trade, plus which fields are
 * still missing. Unlike `useVendorProfile` this never falls back to mock data —
 * a mock fallback would report a complete profile for an empty account.
 */
export function useVendorSetupStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'setup-status'],
    queryFn: async () => {
      let profile: ApiVendorProfile
      try {
        profile = await getVendorProfile(vendorToken())
      } catch {
        // No seller profile at all — treat every field as outstanding.
        return { complete: false, missing: SETUP_FIELDS.map((f) => f.label), unreachable: true }
      }
      const missing = SETUP_FIELDS.filter((f) => !f.value(profile)?.trim()).map((f) => f.label)
      return { complete: missing.length === 0, missing, unreachable: false }
    },
  })

  return {
    isLoading,
    isComplete: data?.complete ?? false,
    missing: data?.missing ?? [],
    /** True when the profile could not be read at all, so the gate should not block. */
    unreachable: data?.unreachable ?? false,
  }
}

export function useRegisterVendor() {
  return useMutation({
    mutationFn: async (input: VendorRegisterInput) => toVendorProfileShape(await registerVendor(vendorToken(), input)),
  })
}

/**
 * Saves the seller profile. Accounts always have one after sign-up, but profiles
 * created before that existed only appear on first save.
 */
export function useSaveVendorProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: VendorRegisterInput) => {
      try {
        return await updateVendorProfileApi(vendorToken(), input)
      } catch (err) {
        if (err instanceof Error && /vendor profile not found/i.test(err.message)) {
          return registerVendor(vendorToken(), input)
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor'] }),
  })
}

export function useUpdateVendorProfile() {
  return useMutation({
    mutationFn: async (input: Parameters<typeof updateVendorProfileApi>[1]) =>
      toVendorProfileShape(await updateVendorProfileApi(vendorToken(), input)),
  })
}

export function useUpdateVendorBankDetails() {
  return useMutation({
    mutationFn: async (input: Parameters<typeof updateVendorBankDetails>[1]) =>
      toVendorProfileShape(await updateVendorBankDetails(vendorToken(), input)),
  })
}

export function useVendorProductVariants() {
  return useQuery({
    queryKey: ['vendor', 'product-variants'],
    queryFn: async () => {
      try {
        const [list, page] = await Promise.all([
          getVariants(vendorToken()),
          getVendorProducts(vendorToken(), { page: 1, limit: 100 }),
        ])
        const productIds = new Set(page.products.map((p) => p._id))
        return list.filter((v) => productIds.has(variantRefId(v.productId)))
      } catch {
        return [] as ApiProductVariant[]
      }
    },
  })
}

export function useCreateVendorVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateVariantInput) => {
      const created = await createVariant(vendorToken(), input)
      queryClient.invalidateQueries({ queryKey: ['vendor', 'product-variants'] })
      return created
    },
  })
}

export function useUpdateVendorVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Parameters<typeof updateVariant>[2] }) => {
      const updated = await updateVariant(vendorToken(), id, patch)
      queryClient.invalidateQueries({ queryKey: ['vendor', 'product-variants'] })
      return updated
    },
  })
}

export function useDeleteVendorVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteVariant(vendorToken(), id)
      queryClient.invalidateQueries({ queryKey: ['vendor', 'product-variants'] })
      return result
    },
  })
}

/** Shared invalidation so shipment writes refresh every view that shows them. */
function invalidateShipmentQueries(queryClient: ReturnType<typeof useQueryClient>, orderId?: string) {
  queryClient.invalidateQueries({ queryKey: ['vendor', 'shipments'] })
  queryClient.invalidateQueries({ queryKey: ['vendor', 'order-shipments'] })
    queryClient.invalidateQueries({ queryKey: ['customer', 'order-shipments'] })
    queryClient.invalidateQueries({ queryKey: ['customer', 'order-shipments-map'] })
  queryClient.invalidateQueries({ queryKey: ['customer', 'tracking'] })
  if (orderId) {
    queryClient.invalidateQueries({ queryKey: ['vendor', 'order-shipments', orderId] })
    queryClient.invalidateQueries({ queryKey: ['customer', 'order-shipments', orderId] })
  }
}

export function useVendorShipments() {
  return useQuery({
    queryKey: ['vendor', 'shipments'],
    queryFn: async () => {
      try {
        const page = await getVendorShipments(vendorToken())
        return page.shipments.map(toVendorShipment)
      } catch {
        return []
      }
    },
  })
}

/** Shipments for one order, used to decide whether a Dispatch button is needed. */
export function useOrderShipmentsForVendor(orderId?: string) {
  return useQuery({
    queryKey: ['vendor', 'order-shipments', orderId],
    queryFn: () => getShipmentsByOrder(vendorToken(), orderId!),
    enabled: Boolean(orderId),
    retry: false,
  })
}

export function useCreateShipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateShipmentInput) => createShipment(vendorToken(), input),
    onSuccess: (_res, input) => {
      invalidateShipmentQueries(queryClient, input.orderId)
    },
  })
}

export function useRequestPickup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: RequestPickupInput) => requestPickup(vendorToken(), input),
    onSuccess: (res) => invalidateShipmentQueries(queryClient, res.data.orderId as string),
  })
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, location, description }: UpdateShipmentStatusArgs) => {
      await updateShipmentStatus(vendorToken(), id, { shipmentStatus: status, location, description })
      return { id, status }
    },
    onSuccess: () => invalidateShipmentQueries(queryClient),
  })
}

// ── Settlements ──────────────────────────────────────────────────────────────
//
// Settlements come from the API rather than the static portal data: the vendor's
// own rows, plus the dashboard totals the summary endpoint reports. Nothing on
// these screens is totalled in the browser.

function invalidateVendorSettlements(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['vendor', 'settlements'] })
  queryClient.invalidateQueries({ queryKey: ['vendor', 'settlement-summary'] })
  queryClient.invalidateQueries({ queryKey: ['vendor', 'settlement'] })
}

export function useVendorSettlements(query: SettlementQuery = {}) {
  const token = vendorToken()
  return useQuery({
    queryKey: ['vendor', 'settlements', query],
    queryFn: () => getVendorSettlements(token, query),
  })
}

/** Dashboard totals, as reported by `/getvendorsettlementsummary`. */
export function useVendorSettlementSummary(query: SettlementQuery = {}) {
  const token = vendorToken()
  return useQuery({
    queryKey: ['vendor', 'settlement-summary', query],
    queryFn: () => getVendorSettlementSummary(token, query),
  })
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
    queryFn: async () => {
      try {
        return toVendorOrder(await getOrderById(vendorToken(), id))
      } catch {
        return null
      }
    },
  })
}

export function useVendorProduct(id: string) {
  return useQuery({
    queryKey: ['vendor', 'product', id],
    queryFn: async () => {
      try {
        return await getProductById(id)
      } catch {
        return null
      }
    },
  })
}

export function useVendorSettlement(id: string) {
  const token = vendorToken()
  return useQuery({
    queryKey: ['vendor', 'settlement', id],
    queryFn: () => getVendorSettlementById(token, id),
    enabled: Boolean(token && id),
  })
}

export { invalidateVendorSettlements }

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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      await updateOrderStatus(vendorToken(), id, { orderStatus: toApiOrderStatus(status) })
      return { id, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['vendor', 'order'] })
    },
  })
}

export function useSetVendorProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateProductStatus(vendorToken(), id, status)
      return { id, status }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] }),
  })
}

export function useUpdateVendorVariantStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const updated = await updateVariantStock(vendorToken(), id, stock)
      return { id, stock: updated.stock }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor', 'product-variants'] }),
  })
}

export function useCreateVendorProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const created = await createProduct(vendorToken(), input)
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] })
      return created
    },
  })
}

export function useUpdateVendorProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: UpdateProductInput }) => {
      const updated = await updateProduct(vendorToken(), id, patch)
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] })
      return updated
    },
  })
}

export function useDeleteVendorProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProduct(vendorToken(), id)
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] })
      return result
    },
  })
}

export function useMarkVendorNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const items = queryClient.getQueryData<VendorNotification[]>(['vendor', 'notifications'])
      if (items) {
        const item = items.find((notification) => notification.id === id)
        if (item) item.read = true
      }
      return id
    },
  })
}

export function useMarkAllVendorNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const items = queryClient.getQueryData<VendorNotification[]>(['vendor', 'notifications'])
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
