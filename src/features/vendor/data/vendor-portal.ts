import type {
  CategorySale,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  SettlementStatus,
  ShipmentStatus,
} from '@/features/vendor/types'

export interface VendorProfile {
  id: string
  businessName: string
  vendorName: string
  email: string
  phone: string
  country: string
  state: string
  city: string
  category: string
  joined: string
  rating: number
  reviews: number
  gstin: string
  status: 'active' | 'pending' | 'suspended'
  payoutMethod: string
  payoutFrequency: string
  hue: number
  bank: {
    bank: string
    account: string
    ifsc: string
    holder: string
  }
}

export interface VendorProduct {
  id: string
  name: string
  category: string
  color: string
  description: string
  price: number
  mrp: number | null
  stock: number
  status: ProductStatus
  rating: number
  reviews: number
  sold: number
  tags: string[]
  featured: boolean
  createdAt: string
}

export interface VendorProductVariant {
  id: string
  productId: string
  name: string
  size: string
  color: string
  sku: string
  price: number
  stock: number
}

export interface VendorOrderItem {
  productId: string
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
}

export interface VendorOrder {
  id: string
  orderNumber: string
  customer: string
  city: string
  items: VendorOrderItem[]
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
}

export interface VendorShipment {
  id: string
  shipmentId: string
  orderId: string
  orderNumber: string
  carrier: string
  trackingNumber: string
  origin: string
  destination: string
  status: ShipmentStatus
  estDelivery: string
  createdAt: string
}

export interface VendorSettlement {
  id: string
  settlementId: string
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

export interface PayoutLedgerRow {
  id: string
  settlementId: string
  period: string
  net: number
  paidAt: string
}

export interface VendorDashboard {
  kpis: {
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    currentEarnings: number
    currentSettlement: number
    lowStock: number
  }
  salesVsFees: { label: string; disbursed: number; fees: number }[]
  ordersSeries: { label: string; orders: number }[]
  revenueSeries: { month: string; revenue: number; orders: number }[]
  categorySales: CategorySale[]
  monthlyCommission: { label: string; commission: number }[]
}

export const VENDOR_ID = 'VEN-1024'
export const LOW_STOCK_THRESHOLD = 15
export const TOTAL_PRODUCTS = 86
export const TOTAL_ORDERS = 124
export const PENDING_ORDERS = 12

export const vendorProfile: VendorProfile = {
  id: VENDOR_ID,
  businessName: 'Fashion Trends',
  vendorName: 'Priya Sharma',
  email: 'priya@fashiontrends.demo',
  phone: '+91 98200 11442',
  country: 'India',
  state: 'Maharashtra',
  city: 'Mumbai',
  category: 'Dresses & Ethnic Wear',
  joined: '2024-03-18',
  rating: 4.6,
  reviews: 812,
  gstin: '27AAHCF5821K1ZN',
  status: 'active',
  payoutMethod: 'Bank transfer',
  payoutFrequency: 'Bi-weekly',
  hue: 336,
  bank: {
    bank: 'HDFC Bank',
    account: '•••• 4921',
    ifsc: 'HDFC0000421',
    holder: 'Fashion Trends — Priya Sharma',
  },
}

const product = (
  id: string,
  name: string,
  category: string,
  color: string,
  price: number,
  mrp: number | null,
  stock: number,
  status: ProductStatus,
  sold: number,
  rating: number,
  reviews: number,
  tags: string[],
  createdAt: string,
  featured = false,
): VendorProduct => ({
  id,
  name,
  category,
  color,
  description: `${name} — crafted by Fashion Trends with premium fabrics and a flattering fit. Part of the Ladies Collection multi-vendor catalog.`,
  price,
  mrp,
  stock,
  status,
  rating,
  reviews,
  sold,
  tags,
  featured,
  createdAt,
})

export const vendorProducts: VendorProduct[] = [
  product('vprod-01', 'Banarasi Silk Saree', 'Sarees', 'Maroon & Gold', 4299, 5999, 4, 'active', 214, 4.8, 96, ['banarasi', 'bridal', 'best-seller'], '2026-04-12', true),
  product('vprod-02', 'Georgette Printed Saree', 'Sarees', 'Teal', 1899, 2799, 16, 'active', 388, 4.6, 152, ['georgette', 'printed', 'everyday'], '2025-09-02'),
  product('vprod-03', 'Jaipuri Printed Saree', 'Sarees', 'Mustard', 2199, 2999, 0, 'active', 356, 4.5, 117, ['jaipuri', 'quiet-luxury'], '2025-11-20'),
  product('vprod-04', 'Organza Embroidered Lehenga', 'Ethnic Sets', 'Dusty Pink', 7999, 10999, 6, 'active', 96, 4.8, 41, ['lehenga', 'bridal', 'occasion'], '2026-05-08', true),
  product('vprod-05', 'Sharara Party Set', 'Ethnic Sets', 'Ivory', 5499, 7499, 5, 'active', 84, 4.6, 33, ['sharara', 'party', 'new-arrival'], '2026-08-14'),
  product('vprod-06', 'Festival Lehenga Choli', 'Ethnic Sets', 'Coral', 6899, 8999, 11, 'active', 209, 4.7, 58, ['lehenga', 'festive'], '2025-10-06'),
  product('vprod-07', 'Anarkali Maxi Kurta', 'Kurtas & Tunics', 'Emerald', 2499, 3299, 16, 'active', 305, 4.7, 121, ['anarkali', 'evergreen'], '2026-03-19'),
  product('vprod-08', 'Chikankari Cotton Kurta', 'Kurtas & Tunics', 'White', 1499, 1999, 34, 'active', 472, 4.6, 188, ['chikankari', 'cotton', 'workwear'], '2025-08-25'),
  product('vprod-09', 'Evening Anarkali Gown', 'Dresses', 'Midnight', 5999, 7999, 3, 'active', 128, 4.8, 47, ['gown', 'evening', 'occasion'], '2026-06-21', true),
  product('vprod-10', 'A-Line Midi Dress', 'Dresses', 'Blush Rose', 1699, 2299, 25, 'active', 341, 4.5, 139, ['midi', 'summer'], '2026-07-09'),
  product('vprod-11', 'Midi Wrap Dress', 'Dresses', 'Sage', 1999, 2699, 28, 'archived', 177, 4.4, 74, ['wrap', 'floral'], '2025-12-01'),
  product('vprod-12', 'Banarasi Dupatta', 'Accessories', 'Gold', 899, 1299, 9, 'active', 264, 4.7, 91, ['dupatta', 'banarasi', 'gift'], '2026-02-11'),
  product('vprod-13', 'Embroidered Blouse', 'Accessories', 'Navy', 1299, 1699, 18, 'active', 512, 4.5, 203, ['blouse', 'embroidered', 'best-seller'], '2025-10-29', true),
  product('vprod-14', 'Silk Blend Stole', 'Accessories', 'Mauve', 1099, 1499, 66, 'draft', 0, 0, 0, ['stole', 'winter'], '2026-09-01'),
  product('vprod-15', 'Printed Pajama Set', 'Kurtas & Tunics', 'Lilac', 1149, 1599, 41, 'active', 268, 4.4, 102, ['loungwear', 'printed'], '2026-01-17'),
  product('vprod-16', 'Cotton Anarkali Set', 'Kurtas & Tunics', 'Sky', 2799, 3699, 22, 'draft', 0, 0, 0, ['anarkali', 'cottonset'], '2026-09-03'),
]

export const vendorProductVariants: VendorProductVariant[] = [
  { id: 'vv-001', productId: 'vprod-01', name: 'Maroon & Gold / Free Size', size: 'FS', color: 'Maroon & Gold', sku: 'FT-SAR-001-FS', price: 4299, stock: 4 },
  { id: 'vv-002', productId: 'vprod-02', name: 'Teal / Free Size', size: 'FS', color: 'Teal', sku: 'FT-SAR-002-FS', price: 1899, stock: 16 },
  { id: 'vv-003', productId: 'vprod-03', name: 'Mustard / Free Size', size: 'FS', color: 'Mustard', sku: 'FT-SAR-003-FS', price: 2199, stock: 0 },
  { id: 'vv-004', productId: 'vprod-04', name: 'Dusty Pink / XS', size: 'XS', color: 'Dusty Pink', sku: 'FT-LHG-004-XS', price: 7999, stock: 2 },
  { id: 'vv-005', productId: 'vprod-04', name: 'Dusty Pink / M', size: 'M', color: 'Dusty Pink', sku: 'FT-LHG-004-M', price: 7999, stock: 3 },
  { id: 'vv-006', productId: 'vprod-04', name: 'Dusty Pink / L', size: 'L', color: 'Dusty Pink', sku: 'FT-LHG-004-L', price: 7999, stock: 1 },
  { id: 'vv-007', productId: 'vprod-05', name: 'Ivory / S', size: 'S', color: 'Ivory', sku: 'FT-SHR-005-S', price: 5499, stock: 2 },
  { id: 'vv-008', productId: 'vprod-05', name: 'Ivory / M', size: 'M', color: 'Ivory', sku: 'FT-SHR-005-M', price: 5499, stock: 3 },
  { id: 'vv-009', productId: 'vprod-06', name: 'Coral / S', size: 'S', color: 'Coral', sku: 'FT-LHG-006-S', price: 6899, stock: 4 },
  { id: 'vv-010', productId: 'vprod-06', name: 'Coral / M', size: 'M', color: 'Coral', sku: 'FT-LHG-006-M', price: 6899, stock: 4 },
  { id: 'vv-011', productId: 'vprod-06', name: 'Coral / L', size: 'L', color: 'Coral', sku: 'FT-LHG-006-L', price: 6899, stock: 3 },
  { id: 'vv-012', productId: 'vprod-07', name: 'Emerald / S', size: 'S', color: 'Emerald', sku: 'FT-KUR-007-S', price: 2499, stock: 5 },
  { id: 'vv-013', productId: 'vprod-07', name: 'Emerald / M', size: 'M', color: 'Emerald', sku: 'FT-KUR-007-M', price: 2499, stock: 6 },
  { id: 'vv-014', productId: 'vprod-07', name: 'Emerald / L', size: 'L', color: 'Emerald', sku: 'FT-KUR-007-L', price: 2499, stock: 5 },
  { id: 'vv-015', productId: 'vprod-08', name: 'White / S', size: 'S', color: 'White', sku: 'FT-KUR-008-S', price: 1499, stock: 12 },
  { id: 'vv-016', productId: 'vprod-08', name: 'White / M', size: 'M', color: 'White', sku: 'FT-KUR-008-M', price: 1499, stock: 12 },
  { id: 'vv-017', productId: 'vprod-08', name: 'White / L', size: 'L', color: 'White', sku: 'FT-KUR-008-L', price: 1499, stock: 10 },
  { id: 'vv-018', productId: 'vprod-09', name: 'Midnight / M', size: 'M', color: 'Midnight', sku: 'FT-GWN-009-M', price: 5999, stock: 2 },
  { id: 'vv-019', productId: 'vprod-09', name: 'Midnight / L', size: 'L', color: 'Midnight', sku: 'FT-GWN-009-L', price: 5999, stock: 1 },
  { id: 'vv-020', productId: 'vprod-10', name: 'Blush Rose / S', size: 'S', color: 'Blush Rose', sku: 'FT-DRS-010-S', price: 1699, stock: 9 },
  { id: 'vv-021', productId: 'vprod-10', name: 'Blush Rose / M', size: 'M', color: 'Blush Rose', sku: 'FT-DRS-010-M', price: 1699, stock: 9 },
  { id: 'vv-022', productId: 'vprod-10', name: 'Blush Rose / L', size: 'L', color: 'Blush Rose', sku: 'FT-DRS-010-L', price: 1699, stock: 7 },
  { id: 'vv-023', productId: 'vprod-12', name: 'Gold / One Size', size: 'OS', color: 'Gold', sku: 'FT-DUP-012-OS', price: 899, stock: 9 },
  { id: 'vv-024', productId: 'vprod-13', name: 'Navy / S', size: 'S', color: 'Navy', sku: 'FT-BLS-013-S', price: 1299, stock: 7 },
  { id: 'vv-025', productId: 'vprod-13', name: 'Navy / M', size: 'M', color: 'Navy', sku: 'FT-BLS-013-M', price: 1299, stock: 6 },
  { id: 'vv-026', productId: 'vprod-13', name: 'Navy / L', size: 'L', color: 'Navy', sku: 'FT-BLS-013-L', price: 1299, stock: 5 },
  { id: 'vv-027', productId: 'vprod-15', name: 'Lilac / M', size: 'M', color: 'Lilac', sku: 'FT-PJM-015-M', price: 1149, stock: 21 },
  { id: 'vv-028', productId: 'vprod-15', name: 'Lilac / L', size: 'L', color: 'Lilac', sku: 'FT-PJM-015-L', price: 1149, stock: 20 },
]

const order = (
  id: string,
  orderNumber: string,
  customer: string,
  city: string,
  items: VendorOrderItem[],
  status: OrderStatus,
  paymentStatus: PaymentStatus,
  paymentMethod: string,
  createdAt: string,
): VendorOrder => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discount = subtotal > 2500 ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal > 1500 ? 0 : 49
  const tax = Math.round(((subtotal - discount + shipping) * 0.05) * 100) / 100
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100
  return {
    id,
    orderNumber,
    customer,
    city,
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    status,
    paymentStatus,
    paymentMethod,
    createdAt,
    updatedAt: createdAt,
  }
}

const item = (productId: string, productName: string, variantName: string, quantity: number, unitPrice: number): VendorOrderItem => ({
  productId,
  productName,
  variantName,
  quantity,
  unitPrice,
})

export const vendorOrders: VendorOrder[] = [
  order('vord-501', 'FT-5021', 'Aarti Malhotra', 'New Delhi', [item('vprod-01', 'Banarasi Silk Saree', 'Maroon & Gold / Free Size', 1, 4299)], 'processing', 'captured', 'card', '2026-09-07T11:40:00'),
  order('vord-502', 'FT-5020', 'Neha Kulkarni', 'Pune', [item('vprod-08', 'Chikankari Cotton Kurta', 'White / M', 2, 1499)], 'processing', 'captured', 'UPI', '2026-09-07T09:16:00'),
  order('vord-503', 'FT-5019', 'Sana Iqbal', 'Hyderabad', [item('vprod-05', 'Sharara Party Set', 'Ivory / S', 1, 5499), item('vprod-12', 'Banarasi Dupatta', 'Gold / One Size', 1, 899)], 'pending', 'pending', 'card', '2026-09-06T20:32:00'),
  order('vord-504', 'FT-5018', 'Ritika Sood', 'Chandigarh', [item('vprod-06', 'Festival Lehenga Choli', 'Coral / M', 1, 6899)], 'pending', 'pending', 'wallet', '2026-09-06T16:05:00'),
  order('vord-505', 'FT-5017', 'Meera Nair', 'Kochi', [item('vprod-10', 'A-Line Midi Dress', 'Blush Rose / M', 1, 1699), item('vprod-12', 'Banarasi Dupatta', 'Gold / One Size', 1, 899)], 'shipped', 'captured', 'card', '2026-09-06T12:44:00'),
  order('vord-506', 'FT-5016', 'Kavya Reddy', 'Bengaluru', [item('vprod-13', 'Embroidered Blouse', 'Navy / M', 2, 1299)], 'shipped', 'captured', 'UPI', '2026-09-05T18:27:00'),
  order('vord-507', 'FT-5015', 'Ananya Das', 'Kolkata', [item('vprod-02', 'Georgette Printed Saree', 'Teal / Free Size', 1, 1899)], 'shipped', 'captured', 'card', '2026-09-05T11:50:00'),
  order('vord-508', 'FT-5014', 'Divya Menon', 'Thiruvananthapuram', [item('vprod-07', 'Anarkali Maxi Kurta', 'Emerald / M', 1, 2499), item('vprod-12', 'Banarasi Dupatta', 'Gold / One Size', 1, 899)], 'delivered', 'captured', 'card', '2026-09-04T15:38:00'),
  order('vord-509', 'FT-5013', 'Ishita Verma', 'Lucknow', [item('vprod-04', 'Organza Embroidered Lehenga', 'Dusty Pink / M', 1, 7999)], 'delivered', 'captured', 'card', '2026-09-04T10:12:00'),
  order('vord-510', 'FT-5012', 'Farah Khan', 'Jaipur', [item('vprod-09', 'Evening Anarkali Gown', 'Midnight / L', 1, 5999)], 'delivered', 'captured', 'wallet', '2026-09-03T19:23:00'),
  order('vord-511', 'FT-5011', 'Tanya Kapoor', 'Gurugram', [item('vprod-15', 'Printed Pajama Set', 'Lilac / M', 1, 1149)], 'cancelled', 'refunded', 'UPI', '2026-09-03T13:07:00'),
  order('vord-512', 'FT-5010', 'Rhea Bose', 'Ahmedabad', [item('vprod-13', 'Embroidered Blouse', 'Navy / S', 1, 1299), item('vprod-02', 'Georgette Printed Saree', 'Teal / Free Size', 1, 1899)], 'delivered', 'captured', 'card', '2026-09-02T17:41:00'),
  order('vord-513', 'FT-5009', 'Shreya Ghosh', 'Guwahati', [item('vprod-02', 'Georgette Printed Saree', 'Teal / Free Size', 2, 1899)], 'delivered', 'captured', 'card', '2026-09-02T09:29:00'),
  order('vord-514', 'FT-5008', 'Amrita Joshi', 'Indore', [item('vprod-10', 'A-Line Midi Dress', 'Blush Rose / S', 1, 1699)], 'delivered', 'captured', 'UPI', '2026-09-01T14:55:00'),
  order('vord-515', 'FT-5007', 'Nandini Pillai', 'Chennai', [item('vprod-06', 'Festival Lehenga Choli', 'Coral / S', 1, 6899), item('vprod-03', 'Jaipuri Printed Saree', 'Mustard / Free Size', 1, 2199)], 'delivered', 'captured', 'card', '2026-08-30T12:18:00'),
  order('vord-516', 'FT-5006', 'Sneha Deshmukh', 'Nagpur', [item('vprod-08', 'Chikankari Cotton Kurta', 'White / L', 1, 1499), item('vprod-02', 'Georgette Printed Saree', 'Teal / Free Size', 1, 1899)], 'refunded', 'refunded', 'card', '2026-08-29T10:36:00'),
]

export const vendorShipments: VendorShipment[] = [
  { id: 'vsh-01', shipmentId: 'FT-SH-4412', orderId: 'vord-506', orderNumber: 'FT-5016', carrier: 'BlueDart', trackingNumber: 'BD4532187IN', origin: 'Mumbai, India', destination: 'Bengaluru, India', status: 'in-transit', estDelivery: '2026-09-09', createdAt: '2026-09-06T09:00:00' },
  { id: 'vsh-02', shipmentId: 'FT-SH-4411', orderId: 'vord-507', orderNumber: 'FT-5015', carrier: 'DTDC', trackingNumber: 'DT99K10234', origin: 'Mumbai, India', destination: 'Kolkata, India', status: 'in-transit', estDelivery: '2026-09-10', createdAt: '2026-09-05T12:00:00' },
  { id: 'vsh-03', shipmentId: 'FT-SH-4408', orderId: 'vord-508', orderNumber: 'FT-5014', carrier: 'Delhivery', trackingNumber: 'DH9087612', origin: 'Mumbai, India', destination: 'Thiruvananthapuram, India', status: 'out-for-delivery', estDelivery: '2026-09-08', createdAt: '2026-09-04T16:00:00' },
  { id: 'vsh-04', shipmentId: 'FT-SH-4407', orderId: 'vord-509', orderNumber: 'FT-5013', carrier: 'BlueDart', trackingNumber: 'BD4522901IN', origin: 'Mumbai, India', destination: 'Lucknow, India', status: 'out-for-delivery', estDelivery: '2026-09-08', createdAt: '2026-09-04T11:00:00' },
  { id: 'vsh-05', shipmentId: 'FT-SH-4405', orderId: 'vord-510', orderNumber: 'FT-5012', carrier: 'Ekart', trackingNumber: 'EK77 6810 204', origin: 'Mumbai, India', destination: 'Jaipur, India', status: 'delivered', estDelivery: '2026-09-06', createdAt: '2026-09-03T20:00:00' },
  { id: 'vsh-06', shipmentId: 'FT-SH-4402', orderId: 'vord-512', orderNumber: 'FT-5010', carrier: 'Delhivery', trackingNumber: 'DH9075314', origin: 'Mumbai, India', destination: 'Ahmedabad, India', status: 'delivered', estDelivery: '2026-09-05', createdAt: '2026-09-02T18:00:00' },
  { id: 'vsh-07', shipmentId: 'FT-SH-4401', orderId: 'vord-513', orderNumber: 'FT-5009', carrier: 'DTDC', trackingNumber: 'DT98P22110', origin: 'Mumbai, India', destination: 'Guwahati, India', status: 'delivered', estDelivery: '2026-09-05', createdAt: '2026-09-02T10:00:00' },
  { id: 'vsh-08', shipmentId: 'FT-SH-4398', orderId: 'vord-514', orderNumber: 'FT-5008', carrier: 'BlueDart', trackingNumber: 'BD4518733IN', origin: 'Mumbai, India', destination: 'Indore, India', status: 'delivered', estDelivery: '2026-09-04', createdAt: '2026-09-01T15:00:00' },
]

export const vendorSettlements: VendorSettlement[] = [
  {
    id: 'vstl-01',
    settlementId: 'FT-STL-2609A',
    period: 'Sep 1 – 15, 2026',
    orders: 29,
    grossSales: 38100,
    commissionRate: 0.12,
    commission: 4572,
    refunds: 385,
    fees: 293,
    netAmount: 32850,
    payoutMethod: 'Bank transfer',
    status: 'pending',
    processedAt: null,
    createdAt: '2026-09-16T02:00:00',
  },
  {
    id: 'vstl-02',
    settlementId: 'FT-STL-2608B',
    period: 'Aug 16 – 31, 2026',
    orders: 41,
    grossSales: 51240,
    commissionRate: 0.12,
    commission: 6148.8,
    refunds: 620,
    fees: 402,
    netAmount: 44069.2,
    payoutMethod: 'Bank transfer',
    status: 'processed',
    processedAt: '2026-09-06T09:30:00',
    createdAt: '2026-09-01T02:00:00',
  },
  {
    id: 'vstl-03',
    settlementId: 'FT-STL-2608A',
    period: 'Aug 1 – 15, 2026',
    orders: 38,
    grossSales: 47850,
    commissionRate: 0.12,
    commission: 5742,
    refunds: 430,
    fees: 361,
    netAmount: 41317,
    payoutMethod: 'Bank transfer',
    status: 'paid',
    processedAt: '2026-08-20T10:15:00',
    createdAt: '2026-08-16T02:00:00',
  },
  {
    id: 'vstl-04',
    settlementId: 'FT-STL-2607B',
    period: 'Jul 16 – 31, 2026',
    orders: 33,
    grossSales: 40620,
    commissionRate: 0.12,
    commission: 4874.4,
    refunds: 250,
    fees: 311,
    netAmount: 35184.6,
    payoutMethod: 'Bank transfer',
    status: 'paid',
    processedAt: '2026-08-05T11:00:00',
    createdAt: '2026-08-01T02:00:00',
  },
  {
    id: 'vstl-05',
    settlementId: 'FT-STL-2607A',
    period: 'Jul 1 – 15, 2026',
    orders: 35,
    grossSales: 42890,
    commissionRate: 0.12,
    commission: 5146.8,
    refunds: 380,
    fees: 334,
    netAmount: 37029.2,
    payoutMethod: 'Bank transfer',
    status: 'failed',
    processedAt: '2026-07-26T09:00:00',
    createdAt: '2026-07-16T02:00:00',
  },
  {
    id: 'vstl-06',
    settlementId: 'FT-STL-2606B',
    period: 'Jun 16 – 30, 2026',
    orders: 30,
    grossSales: 36840,
    commissionRate: 0.12,
    commission: 4420.8,
    refunds: 190,
    fees: 272,
    netAmount: 31957.2,
    payoutMethod: 'Bank transfer',
    status: 'paid',
    processedAt: '2026-07-05T10:00:00',
    createdAt: '2026-07-01T02:00:00',
  },
]

export const payoutLedger: PayoutLedgerRow[] = [
  { id: 'ply-01', settlementId: 'FT-STL-2608A', period: 'Aug 1 – 15, 2026', net: 41317, paidAt: '2026-08-20T10:15:00' },
  { id: 'ply-02', settlementId: 'FT-STL-2607B', period: 'Jul 16 – 31, 2026', net: 35184.6, paidAt: '2026-08-05T11:00:00' },
  { id: 'ply-03', settlementId: 'FT-STL-2607A', period: 'Jul 1 – 15, 2026', net: 37029.2, paidAt: '2026-07-26T09:00:00' },
  { id: 'ply-04', settlementId: 'FT-STL-2606B', period: 'Jun 16 – 30, 2026', net: 31957.2, paidAt: '2026-07-05T10:00:00' },
  { id: 'ply-05', settlementId: 'FT-STL-2606A', period: 'Jun 1 – 15, 2026', net: 29680, paidAt: '2026-06-20T09:00:00' },
  { id: 'ply-06', settlementId: 'FT-STL-2605B', period: 'May 16 – 31, 2026', net: 28490, paidAt: '2026-06-05T10:30:00' },
]

const labelOf = (offset: number) => {
  const d = new Date(Date.now() - offset)
  return d.toLocaleString('en-US', { month: 'short' })
}

export const vendorDashboard: VendorDashboard = {
  kpis: {
    totalProducts: TOTAL_PRODUCTS,
    totalOrders: TOTAL_ORDERS,
    pendingOrders: PENDING_ORDERS,
    currentEarnings: 78450,
    currentSettlement: 32850,
    lowStock: 7,
  },
  salesVsFees: [
    { label: labelOf(11), disbursed: 52600, fees: 5080 },
    { label: labelOf(10), disbursed: 59400, fees: 5710 },
    { label: labelOf(9), disbursed: 47200, fees: 4540 },
    { label: labelOf(8), disbursed: 62000, fees: 5960 },
    { label: labelOf(7), disbursed: 56800, fees: 5450 },
    { label: labelOf(6), disbursed: 48100, fees: 4620 },
    { label: labelOf(5), disbursed: 65300, fees: 6270 },
    { label: labelOf(4), disbursed: 61800, fees: 5930 },
    { label: labelOf(3), disbursed: 58200, fees: 5590 },
    { label: labelOf(2), disbursed: 67400, fees: 6470 },
    { label: labelOf(1), disbursed: 72900, fees: 7000 },
    { label: labelOf(0), disbursed: 78450, fees: 7540 },
  ],
  ordersSeries: [
    { label: labelOf(11), orders: 8 },
    { label: labelOf(10), orders: 9 },
    { label: labelOf(9), orders: 7 },
    { label: labelOf(8), orders: 10 },
    { label: labelOf(7), orders: 9 },
    { label: labelOf(6), orders: 7 },
    { label: labelOf(5), orders: 11 },
    { label: labelOf(4), orders: 10 },
    { label: labelOf(3), orders: 9 },
    { label: labelOf(2), orders: 12 },
    { label: labelOf(1), orders: 13 },
    { label: labelOf(0), orders: 14 },
  ],
  revenueSeries: [
    { month: labelOf(11), revenue: 52600, orders: 8 },
    { month: labelOf(10), revenue: 59400, orders: 9 },
    { month: labelOf(9), revenue: 47200, orders: 7 },
    { month: labelOf(8), revenue: 62000, orders: 10 },
    { month: labelOf(7), revenue: 56800, orders: 9 },
    { month: labelOf(6), revenue: 48100, orders: 7 },
    { month: labelOf(5), revenue: 65300, orders: 11 },
    { month: labelOf(4), revenue: 61800, orders: 10 },
    { month: labelOf(3), revenue: 58200, orders: 9 },
    { month: labelOf(2), revenue: 67400, orders: 12 },
    { month: labelOf(1), revenue: 72900, orders: 13 },
    { month: labelOf(0), revenue: 78450, orders: 14 },
  ],
  categorySales: [
    { name: 'Sarees', value: 34 },
    { name: 'Kurtas & Tunics', value: 24 },
    { name: 'Ethnic Sets', value: 18 },
    { name: 'Dresses', value: 14 },
    { name: 'Accessories', value: 10 },
  ],
  monthlyCommission: [
    { label: labelOf(11), commission: 5080 },
    { label: labelOf(10), commission: 5710 },
    { label: labelOf(9), commission: 4540 },
    { label: labelOf(8), commission: 5960 },
    { label: labelOf(7), commission: 5450 },
    { label: labelOf(6), commission: 4620 },
    { label: labelOf(5), commission: 6270 },
    { label: labelOf(4), commission: 5930 },
    { label: labelOf(3), commission: 5590 },
    { label: labelOf(2), commission: 6470 },
    { label: labelOf(1), commission: 7000 },
    { label: labelOf(0), commission: 7540 },
  ],
}

const dateFrom = (daysAgo: number, hour = 9) => {
  const d = new Date(Date.now() - daysAgo * 86400000)
  d.setHours(hour, 10, 0, 0)
  return d.toISOString()
}

export interface VendorNotification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const vendorNotifications: VendorNotification[] = [
  { id: 'vnot-01', title: 'New order received', message: 'Order FT-5021 (₹4,513) from Aarti Malhotra is awaiting confirmation.', read: false, createdAt: dateFrom(0, 11) },
  { id: 'vnot-02', title: 'Low stock alert', message: 'Organza Embroidered Lehenga is down to 6 units.', read: false, createdAt: dateFrom(0, 8) },
  { id: 'vnot-03', title: 'Settlement processed', message: '₹44,069 for FT-STL-2608B (Aug 16–31) is on its way to your bank.', read: false, createdAt: dateFrom(1, 9) },
  { id: 'vnot-04', title: 'New review', message: 'Ranay Traders-rated 5.0 stars on Banarasi Silk Saree.', read: true, createdAt: dateFrom(2, 16) },
  { id: 'vnot-05', title: 'Product approved', message: 'Sharara Party Set is now live on the marketplace.', read: true, createdAt: dateFrom(3, 12) },
  { id: 'vnot-06', title: 'Inventory restock reminder', message: '3 SKUs have stock below 10 units.', read: true, createdAt: dateFrom(4, 10) },
]

export const lowStockItems = vendorProducts
  .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
  .sort((a, b) => a.stock - b.stock)

export const lowStockCount = lowStockItems.length