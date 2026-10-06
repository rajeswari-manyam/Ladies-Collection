export type CustomerTier = 'platinum' | 'gold' | 'silver' | 'bronze'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  country: string
  tier: CustomerTier
  orders: number
  totalSpent: number
  lastOrder: string
  joined: string
  status: 'active' | 'dormant' | 'blocked'
}

export interface Vendor {
  id: string
  name: string
  brand: string
  email: string
  phone: string
  category: string
  location: string
  rating: number
  ordersCount: number
  productsCount: number
  revenue: number
  commissionRate: number
  status: 'active' | 'pending' | 'suspended'
  joined: string
  logoHue: number
  verificationStatus?: string
  gstNumber?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
  featured: boolean
  hue: number
}

export interface Subcategory {
  id: string
  categoryId: string
  name: string
  slug: string
  productCount: number
}

export type ProductStatus = 'active' | 'draft' | 'archived' | 'out-of-stock'

export interface Product {
  id: string
  name: string
  brand: string
  description: string
  price: number
  compareAtPrice: number | null
  categoryId: string
  subcategoryId: string
  vendorId: string
  color: string
  rating: number
  reviews: number
  sold: number
  stock: number
  status: ProductStatus
  featured: boolean
  tags: string[]
  createdAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  size: string
  color: string
  sku: string
  price: number
  stock: number
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'captured' | 'pending' | 'failed' | 'refunded'

export interface OrderItem {
  productId: string
  variantId: string
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  vendorId: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  createdAt: string
  updatedAt: string
  city: string
}

export interface Payment {
  id: string
  paymentId: string
  orderId: string
  orderNumber: string
  customer: string
  method: 'card' | 'cash' | 'paypal' | 'wallet'
  amount: number
  fee: number
  status: PaymentStatus
  createdAt: string
}

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in-transit'
  | 'out-for-delivery'
  | 'delivered'
  | 'returned'
  | 'failed'


export interface Shipment {
  id: string
  shipmentId: string
  orderId: string
  orderNumber: string
  carrier: string
  trackingNumber: string
  origin: string
  destination: string
  status: ShipmentStatus
  estDelivery: string | null
  createdAt: string
}

export type SettlementStatus = 'pending' | 'processed' | 'paid' | 'failed'

export interface Settlement {
  id: string
  settlementId: string
  vendorId: string
  vendor: string
  period: string
  orders: number
  grossSales: number
  commissionRate: number
  commission: number
  refunds: number
  fees: number
  netAmount: number
  payoutMethod: string
  status: SettlementStatus
  processedAt: string | null
  createdAt: string
}

export type NotificationType = 'order' | 'customer' | 'vendor' | 'payout' | 'inventory' | 'system'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export interface DashboardKpis {
  revenue: number
  revenueDelta: number
  orders: number
  ordersDelta: number
  vendors: number
  vendorsDelta: number
  products: number
  productsDelta: number
}

export interface RevenuePoint {
  month: string
  revenue: number
  orders: number
}

export interface SalesPoint {
  label: string
  disbursed: number
  fees: number
}

export interface CategorySale {
  name: string
  value: number
}

export interface VendorPerformance {
  vendor: string
  revenue: number
}

// -------- Customer storefront --------

export interface StoreVendor {
  id: string
  brand: string
  name: string
  location: string
  rating: number
  productsCount: number
  hue: number
  blurb: string
}

export interface StoreProductSize {
  size: string
  stock: number
}

export interface StoreProduct {
  id: string
  name: string
  brand: string
  description: string
  care: string
  categoryId: string
  categoryName: string
  vendorId: string
  vendorName: string
  mrp: number
  price: number
  rating: number
  ratingCount: number
  sizes: StoreProductSize[]
  colors: string[]
  tags: string[]
  hue: number
  pattern: number
  inBestsellers: boolean
  inNewArrivals: boolean
  createdAt: string
}

export interface StoreReview {
  id: string
  productId: string
  author: string
  rating: number
  title: string
  body: string
  createdAt: string
}

export interface CartItem {
  productId: string
  size: string
  color: string
  quantity: number
  unitPrice: number
}

export type StoreOrderStatus =
  | 'placed'
  | 'confirmed'
  | 'shipped'
  | 'in-transit'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'

export const STORE_ORDER_STATUSES: StoreOrderStatus[] = [
  'placed',
  'confirmed',
  'shipped',
  'in-transit',
  'out-for-delivery',
  'delivered',
  'cancelled',
]

export interface StoreOrderItem {
  productId: string
  name: string
  size: string
  color: string
  quantity: number
  unitPrice: number
}

export interface TrackStep {
  label: string
  at: string
  done: boolean
}

export interface StoreOrder {
  id: string
  orderNumber: string
  items: StoreOrderItem[]
  subtotal: number
  discount: number
  shipping: number
  codFee?: number
  total: number
  status: StoreOrderStatus
  paymentMethod: string
  paymentId: string
  placedAt: string
  addressId: string
  addressLine1: string
  addressCity: string
  addressPin: string
  carrier: string
  trackingNumber: string
  estDelivery: string
  trackSteps: TrackStep[]
}

export interface StoreAddress {
  id: string
  label: string
  name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface StoreProfile {
  id: string
  name: string
  email: string
  mobile: string
  city?: string
  joined: string
  membersTier: string
  ordersCount: number
  wishlistCount: number
  coupons: number
  hue: number
}

export type StoreNotificationType = 'order' | 'promo' | 'account' | 'offer'

export interface StoreNotification {
  id: string
  type: StoreNotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}