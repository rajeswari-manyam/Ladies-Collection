import type {
  StoreAddress,
  StoreNotification,
  StoreOrder,
  StoreOrderStatus,
  StoreProfile,
  TrackStep,
} from '@/features/customer/types'
import { STORE_ORDER_STATUSES } from '@/features/customer/types'

export const ananya: StoreProfile = {
  id: 'cust-9001',
  name: 'Ananya Reddy',
  email: 'ananya@example.com',
  mobile: '98765 43210',
  joined: '2025-11-04',
  membersTier: 'Gold',
  ordersCount: 14,
  wishlistCount: 7,
  coupons: 3,
  hue: 336,
}

export const addresses: StoreAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    name: 'Ananya Reddy',
    phone: '98765 43210',
    line1: 'B-304, Lakeview Residency, Jubilee Hills Road No. 36',
    line2: 'Near Meridian School',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Office',
    name: 'Ananya Reddy',
    phone: '98765 43210',
    line1: '4th Floor, WeWork Hitech City, Mindspace',
    line2: 'Raidurg, Serilingampally',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    isDefault: false,
  },
  {
    id: 'addr-3',
    label: 'Parents',
    name: 'S. Raghava Reddy',
    phone: '91234 56789',
    line1: 'H.No. 12-4-66, Old Town',
    line2: 'Opp. Hanuman Temple',
    city: 'Warangal',
    state: 'Telangana',
    pincode: '506001',
    isDefault: false,
  },
]

export const notifications: StoreNotification[] = [
  {
    id: 'n-1',
    type: 'order',
    title: 'Order LC-2841 is out for delivery',
    message: 'Your Floral Printed Kurti will arrive today. Track it live from My Orders.',
    read: false,
    createdAt: '2026-09-08T08:10:00',
  },
  {
    id: 'n-2',
    type: 'promo',
    title: 'Festive sale is live on sarees',
    message: 'Up to 45% off on designer sarees this week. Offer ends Sunday midnight.',
    read: false,
    createdAt: '2026-09-07T10:30:00',
  },
  {
    id: 'n-3',
    type: 'account',
    title: 'Payment received — LC-2879',
    message: 'Your UPI payment of ₹1,299 was successful. A receipt has been sent to your email.',
    read: false,
    createdAt: '2026-09-07T09:05:00',
  },
  {
    id: 'n-4',
    type: 'offer',
    title: 'Member-exclusive cashback',
    message: 'You earned 10 Members Cashback on your last purchase. It has been added to your wallet.',
    read: true,
    createdAt: '2026-09-05T18:40:00',
  },
  {
    id: 'n-5',
    type: 'order',
    title: 'Embroidered Lehenga will be delayed',
    message: 'Heavy rains near the sorting facility delayed dispatch by a day. New ETA: 12 Sep.',
    read: true,
    createdAt: '2026-09-03T14:22:00',
  },
  {
    id: 'n-6',
    type: 'promo',
    title: 'Bestsellers back in stock',
    message: 'Floral Printed Kurti and Designer Saree are restocked in the sizes you follow.',
    read: true,
    createdAt: '2026-08-30T11:15:00',
  },
]

export function unreadNotificationCount() {
  return notifications.filter((n) => !n.read).length
}

export function markNotificationRead(id: string) {
  const item = notifications.find((n) => n.id === id)
  if (item) item.read = true
  return item
}

export function markAllNotificationsRead() {
  notifications.forEach((n) => {
    n.read = true
  })
}

export function buildTrackSteps(status: StoreOrderStatus, placedAt: string): TrackStep[] {
  const base = new Date(placedAt).getTime()
  const minutes = {
    placed: 0,
    confirmed: 90,
    shipped: 300,
    'in-transit': 900,
    'out-for-delivery': 1500,
    delivered: 2040,
  }

  const definitions = [
    { key: 'placed', label: 'Order placed' },
    { key: 'confirmed', label: 'Order confirmed' },
    { key: 'shipped', label: 'Shipped from seller' },
    { key: 'in-transit', label: 'Reached your city hub' },
    { key: 'out-for-delivery', label: 'Out for delivery' },
    { key: 'delivered', label: 'Delivered' },
  ]

  if (status === 'cancelled') {
    return [
      { label: 'Order placed', at: new Date(base).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }), done: true },
      { label: 'Cancellation requested', at: '', done: false },
      { label: 'Refund issued', at: '', done: false },
    ]
  }

  const idx = STORE_ORDER_STATUSES.indexOf(status)
  const activeKey = definitions[idx]?.key ?? 'placed'

  const formatStepAt = (ts: number) =>
    new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

  return definitions.map(({ key, label }) => {
    const done = STORE_ORDER_STATUSES.indexOf(key as StoreOrderStatus) <= idx
    const at = key === activeKey
      ? formatStepAt(base)
      : formatStepAt(base + minutes[key as keyof typeof minutes] * 60_000)
    return { label, at: done ? at : '', done }
  })
}

interface OrderSeedBase {
  id: string
  orderNumber: string
  productId: string
  size: string
  color: string
  quantity: number
  unitPrice: number
  mrpTotal: number
  shipping: number
  status: StoreOrderStatus
  paymentMethod: string
  paymentId: string
  placedAt: string
  addressLine1: string
  addressCity: string
  addressPin: string
  carrier: string
  trackingNumber: string
  estDelivery: string
}

function buildOrder(seed: OrderSeedBase): StoreOrder {
  const subtotal = seed.unitPrice * seed.quantity
  const discount = Math.max(0, seed.mrpTotal - subtotal)
  const units = seed.quantity
  const name: Record<string, string> = {
    'prd-501': 'Floral Printed Kurti',
    'prd-502': 'Designer Saree',
    'prd-503': 'Cotton Anarkali Dress',
    'prd-504': 'Embroidered Lehenga',
    'prd-505': 'Women Casual Top',
    'prd-506': 'Silk Designer Saree',
  }
  return {
    id: seed.id,
    orderNumber: seed.orderNumber,
    items: [
      {
        productId: seed.productId,
        name: name[seed.productId] ?? 'Ladies Collection item',
        size: seed.size,
        color: seed.color,
        quantity: units,
        unitPrice: seed.unitPrice,
      },
    ],
    subtotal,
    discount,
    shipping: seed.shipping,
    total: subtotal - discount + seed.shipping,
    status: seed.status,
    paymentMethod: seed.paymentMethod,
    paymentId: seed.paymentId,
    placedAt: seed.placedAt,
    addressId: 'addr-1',
    addressLine1: seed.addressLine1,
    addressCity: seed.addressCity,
    addressPin: seed.addressPin,
    carrier: seed.carrier,
    trackingNumber: seed.trackingNumber,
    estDelivery: seed.estDelivery,
    trackSteps: buildTrackSteps(seed.status, seed.placedAt),
  }
}

const seedData: OrderSeedBase[] = [
  {
    id: 'ord-9051', orderNumber: 'LC-2841', productId: 'prd-501', size: 'M', color: '#c2185b', quantity: 1,
    unitPrice: 1299, mrpTotal: 1999, shipping: 0, status: 'out-for-delivery', paymentMethod: 'UPI',
    paymentId: 'upi_9f3kQw2VeT3', placedAt: '2026-09-05T10:24:00', addressLine1: 'B-304, Lakeview Residency, Jubilee Hills',
    addressCity: 'Hyderabad', addressPin: '500033', carrier: 'BlueDart', trackingNumber: 'BD76021931',
    estDelivery: '2026-09-08',
  },
  {
    id: 'ord-9048', orderNumber: 'LC-2840', productId: 'prd-503', size: 'L', color: '#f48fb1', quantity: 2,
    unitPrice: 1799, mrpTotal: 5398, shipping: 40, status: 'delivered', paymentMethod: 'Credit card',
    paymentId: 'card_8mJd2Z5qZw1', placedAt: '2026-09-02T09:12:00',
    addressLine1: '4th Floor, WeWork Hitech City', addressCity: 'Hyderabad', addressPin: '500081',
    carrier: 'Delhivery', trackingNumber: 'DL7645120091', estDelivery: '2026-09-04',
  },
  {
    id: 'ord-9042', orderNumber: 'LC-2837', productId: 'prd-505', size: 'S', color: '#42a5f5', quantity: 1,
    unitPrice: 899, mrpTotal: 1399, shipping: 0, status: 'in-transit', paymentMethod: 'UPI',
    paymentId: 'upi_3wFs7Q6mBn2', placedAt: '2026-09-01T19:40:00',
    addressLine1: 'B-304, Lakeview Residency, Jubilee Hills', addressCity: 'Hyderabad', addressPin: '500033',
    carrier: 'Ecom Express', trackingNumber: 'EC8821044567', estDelivery: '2026-09-09',
  },
  {
    id: 'ord-9035', orderNumber: 'LC-2831', productId: 'prd-506', size: 'Free Size', color: '#4a148c', quantity: 1,
    unitPrice: 3499, mrpTotal: 5499, shipping: 0, status: 'delivered', paymentMethod: 'Net banking',
    paymentId: 'nb_5bVx9L4kTz8', placedAt: '2026-08-24T14:05:00',
    addressLine1: 'H.No. 12-4-66, Old Town', addressCity: 'Warangal', addressPin: '506001',
    carrier: 'BlueDart', trackingNumber: 'BD75911234', estDelivery: '2026-08-27',
  },
  {
    id: 'ord-9029', orderNumber: 'LC-2826', productId: 'prd-504', size: 'M', color: '#7b1fa2', quantity: 1,
    unitPrice: 4999, mrpTotal: 7999, shipping: 0, status: 'delivered', paymentMethod: 'UPI',
    paymentId: 'upi_2qN8rC3xYd4', placedAt: '2026-08-15T11:30:00',
    addressLine1: 'B-304, Lakeview Residency, Jubilee Hills', addressCity: 'Hyderabad', addressPin: '500033',
    carrier: 'Delhivery', trackingNumber: 'DL7620091845', estDelivery: '2026-08-18',
  },
  {
    id: 'ord-9023', orderNumber: 'LC-2820', productId: 'prd-502', size: 'Free Size', color: '#b71c1c', quantity: 1,
    unitPrice: 2499, mrpTotal: 4499, shipping: 40, status: 'cancelled', paymentMethod: 'Credit card',
    paymentId: 'card_4tVn6K10wRe', placedAt: '2026-08-06T16:20:00',
    addressLine1: 'B-304, Lakeview Residency, Jubilee Hills', addressCity: 'Hyderabad', addressPin: '500033',
    carrier: 'Ecom Express', trackingNumber: '', estDelivery: '2026-08-09',
  },
]

export const customerOrders: StoreOrder[] = seedData.map(buildOrder)

export function orderById(id: string): StoreOrder | undefined {
  return customerOrders.find((o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase())
}

export function addAddress(input: Omit<StoreAddress, 'id' | 'phone' | 'state'> & { state?: string; isDefault: boolean }): string {
  const id = `addr-${addresses.length + 1}`
  addresses.push({ ...input, id, state: input.state ?? '', phone: ananya.mobile })
  return id
}

export function removeAddress(id: string) {
  const index = addresses.findIndex((a) => a.id === id)
  if (index === -1) return
  addresses.splice(index, 1)
  if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
    addresses[0].isDefault = true
  }
}

export function setDefaultAddress(id: string) {
  addresses.forEach((a) => {
    a.isDefault = a.id === id
  })
}

export function prependOrder(order: StoreOrder) {
  customerOrders.unshift(order)
}

interface NewOrderInput {
  items: StoreOrder['items']
  subtotal: number
  discount: number
  shipping: number
  codFee?: number
  paymentMethod: string
  address: StoreAddress
}

export function placeOrder(input: NewOrderInput): StoreOrder {
  const placedAt = new Date()
  const est = new Date(placedAt.getTime() + 4 * 24 * 60 * 60 * 1000)
  const deliveredStatus: StoreOrderStatus =
    input.paymentMethod === 'Cash on Delivery' ? 'placed' : 'confirmed'
  const codFee = input.codFee ?? 0

  const order: StoreOrder = {
    id: `ord-90${90 + customerOrders.filter((o) => o.id.startsWith('new-')).length}`,
    orderNumber: `LC-${2890 + customerOrders.length}`,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    shipping: input.shipping,
    codFee: codFee > 0 ? codFee : undefined,
    total: Math.max(0, input.subtotal - input.discount + input.shipping + codFee),
    status: deliveredStatus,
    paymentMethod: input.paymentMethod,
    paymentId: `txn_${Math.random().toString(36).slice(2, 10)}`,
    placedAt: placedAt.toISOString(),
    addressId: input.address.id,
    addressLine1: `${input.address.line1}${input.address.line2 ? ', ' + input.address.line2 : ''}`,
    addressCity: input.address.city,
    addressPin: input.address.pincode,
    carrier: 'BlueDart',
    trackingNumber: `BD${Math.floor(10000000 + Math.random() * 89999999)}`,
    estDelivery: `2026-${String(est.getMonth() + 1).padStart(2, '0')}-${String(est.getDate()).padStart(2, '0')}`,
    trackSteps: buildTrackSteps(deliveredStatus, placedAt.toISOString()),
  }
  prependOrder({ ...order, id: `new-${order.id}` })
  return { ...order, id: `new-${order.id}` }
}