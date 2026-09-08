import type { Order, OrderItem, OrderStatus } from '@/features/admin/types'
import { products, productVariants } from '@/features/admin/products/data/products'
import { customers } from '@/features/admin/customers/data/customers'
import { vendors } from '@/features/admin/vendors/data/vendors'

interface OrderSeed {
  customerIndex: number
  vendorId: string
  createdAt: string
  status: OrderStatus
  paymentMethod: string
  paymentStatus: Order['paymentStatus']
  items: [productId: string, variantIndex: number, quantity: number][]
  city: string
}

const ORDER_TAX_RATE = 0.05

function buildOrder(seed: OrderSeed, index: number): Order {
  const items: OrderItem[] = seed.items.map(([productId, , quantity]) => {
    const product = products.find((p) => p.id === productId)!
    const variant = productVariants.find((v) => v.productId === productId) ?? productVariants[index]
    return {
      productId,
      variantId: variant?.id ?? productId,
      productName: product.name,
      variantName: variant?.name ?? 'One Size',
      quantity,
      unitPrice: variant?.price ?? product.price,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discount = subtotal > 2500 ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal > 1500 ? 0 : 49
  const tax = Math.round((subtotal - discount + shipping) * ORDER_TAX_RATE * 100) / 100
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100

  const customer = customers[seed.customerIndex]

  return {
    id: `ord-${1000 + index}`,
    orderNumber: `LC-${String(2841 + index)}`,
    customerId: customer.id,
    vendorId: seed.vendorId,
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    status: seed.status,
    paymentStatus: seed.paymentStatus,
    paymentMethod: seed.paymentMethod,
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
    city: seed.city,
  }
}

const orderSeeds: OrderSeed[] = [
  { customerIndex: 0, vendorId: 'ven-rose', createdAt: '2026-09-07T10:24:00', status: 'processing', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-001', 1, 1], ['prd-003', 1, 1]], city: 'New York' },
  { customerIndex: 10, vendorId: 'ven-velvet', createdAt: '2026-09-07T09:12:00', status: 'processing', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-013', 0, 1]], city: 'San Francisco' },
  { customerIndex: 3, vendorId: 'ven-lina', createdAt: '2026-09-06T19:40:00', status: 'pending', paymentMethod: 'wallet', paymentStatus: 'pending', items: [['prd-007', 0, 1], ['prd-014', 0, 1]], city: 'Paris' },
  { customerIndex: 2, vendorId: 'ven-opal', createdAt: '2026-09-06T17:05:00', status: 'shipped', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-004', 0, 1]], city: 'Stockholm' },
  { customerIndex: 4, vendorId: 'ven-mira', createdAt: '2026-09-06T14:50:00', status: 'shipped', paymentMethod: 'paypal', paymentStatus: 'captured', items: [['prd-012', 1, 1], ['prd-020', 1, 2]], city: 'Mumbai' },
  { customerIndex: 12, vendorId: 'ven-serafine', createdAt: '2026-09-05T16:20:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-016', 0, 1]], city: 'Toronto' },
  { customerIndex: 6, vendorId: 'ven-ember', createdAt: '2026-09-05T12:33:00', status: 'delivered', paymentMethod: 'cash', paymentStatus: 'captured', items: [['prd-010', 1, 1], ['prd-023', 0, 1]], city: 'Seoul' },
  { customerIndex: 1, vendorId: 'ven-noir', createdAt: '2026-09-04T20:15:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-017', 0, 2]], city: 'Madrid' },
  { customerIndex: 8, vendorId: 'ven-rose', createdAt: '2026-09-04T11:08:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-019', 0, 1]], city: 'Lagos' },
  { customerIndex: 5, vendorId: 'ven-opal', createdAt: '2026-09-03T18:44:00', status: 'delivered', paymentMethod: 'wallet', paymentStatus: 'captured', items: [['prd-022', 0, 1], ['prd-011', 0, 1]], city: 'London' },
  { customerIndex: 13, vendorId: 'ven-velvet', createdAt: '2026-09-03T10:02:00', status: 'cancelled', paymentMethod: 'card', paymentStatus: 'refunded', items: [['prd-005', 0, 1]], city: 'Chicago' },
  { customerIndex: 7, vendorId: 'ven-mira', createdAt: '2026-09-02T15:29:00', status: 'delivered', paymentMethod: 'paypal', paymentStatus: 'captured', items: [['prd-003', 0, 1], ['prd-020', 2, 1]], city: 'Dubai' },
  { customerIndex: 11, vendorId: 'ven-lina', createdAt: '2026-09-02T09:47:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-021', 0, 1]], city: 'Rome' },
  { customerIndex: 0, vendorId: 'ven-serafine', createdAt: '2026-09-01T13:18:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-008', 0, 1], ['prd-024', 1, 1]], city: 'New York' },
  { customerIndex: 10, vendorId: 'ven-rose', createdAt: '2026-09-01T08:56:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-006', 1, 1]], city: 'San Francisco' },
  { customerIndex: 2, vendorId: 'ven-noir', createdAt: '2026-08-31T17:36:00', status: 'delivered', paymentMethod: 'cash', paymentStatus: 'captured', items: [['prd-009', 1, 1], ['prd-017', 1, 1]], city: 'Stockholm' },
  { customerIndex: 4, vendorId: 'ven-ember', createdAt: '2026-08-31T12:10:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-018', 0, 1]], city: 'Mumbai' },
  { customerIndex: 3, vendorId: 'ven-opal', createdAt: '2026-08-30T19:52:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-004', 0, 2]], city: 'Paris' },
  { customerIndex: 6, vendorId: 'ven-mira', createdAt: '2026-08-30T10:21:00', status: 'delivered', paymentMethod: 'wallet', paymentStatus: 'captured', items: [['prd-012', 0, 1]], city: 'Seoul' },
  { customerIndex: 12, vendorId: 'ven-velvet', createdAt: '2026-08-29T16:03:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-015', 1, 3], ['prd-002', 1, 1]], city: 'Toronto' },
  { customerIndex: 1, vendorId: 'ven-rose', createdAt: '2026-08-29T09:14:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-001', 0, 1], ['prd-013', 0, 1]], city: 'Madrid' },
  { customerIndex: 5, vendorId: 'ven-lina', createdAt: '2026-08-28T14:37:00', status: 'delivered', paymentMethod: 'paypal', paymentStatus: 'captured', items: [['prd-007', 0, 1]], city: 'London' },
  { customerIndex: 8, vendorId: 'ven-serafine', createdAt: '2026-08-27T11:48:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-016', 0, 1], ['prd-024', 2, 1]], city: 'Lagos' },
  { customerIndex: 7, vendorId: 'ven-opal', createdAt: '2026-08-26T18:22:00', status: 'pending', paymentMethod: 'card', paymentStatus: 'pending', items: [['prd-011', 0, 1]], city: 'Dubai' },
  { customerIndex: 11, vendorId: 'ven-ember', createdAt: '2026-08-25T09:57:00', status: 'delivered', paymentMethod: 'cash', paymentStatus: 'captured', items: [['prd-010', 0, 1]], city: 'Rome' },
  { customerIndex: 0, vendorId: 'ven-noir', createdAt: '2026-08-24T15:44:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-009', 0, 1]], city: 'New York' },
  { customerIndex: 10, vendorId: 'ven-mira', createdAt: '2026-08-23T12:31:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-014', 0, 2]], city: 'San Francisco' },
  { customerIndex: 2, vendorId: 'ven-lina', createdAt: '2026-08-22T17:11:00', status: 'refunded', paymentMethod: 'card', paymentStatus: 'refunded', items: [['prd-021', 0, 1]], city: 'Stockholm' },
  { customerIndex: 4, vendorId: 'ven-rose', createdAt: '2026-08-21T10:53:00', status: 'delivered', paymentMethod: 'card', paymentStatus: 'captured', items: [['prd-002', 2, 1], ['prd-006', 0, 1]], city: 'Mumbai' },
  { customerIndex: 6, vendorId: 'ven-serafine', createdAt: '2026-08-20T08:48:00', status: 'delivered', paymentMethod: 'wallet', paymentStatus: 'captured', items: [['prd-008', 0, 1]], city: 'Seoul' },
]

export const orders: Order[] = orderSeeds.map((seed, index) => buildOrder(seed, index))

export const orderStatusOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export const activeOrders = orders.filter(
  (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped',
)

export const vendorRevenueMap = vendors.reduce<Record<string, number>>((acc, v) => {
  acc[v.id] = orders.filter((o) => o.vendorId === v.id && o.paymentStatus === 'captured').reduce((s, o) => s + o.total, 0)
  return acc
}, {})