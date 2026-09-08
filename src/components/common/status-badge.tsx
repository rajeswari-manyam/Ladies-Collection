import { Badge } from '@/components/ui/badge'
import type {
  Customer,
  NotificationType,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  SettlementStatus,
  ShipmentStatus,
  Vendor,
} from '@/types'

type BadgeTone = 'rose' | 'success' | 'warning' | 'info' | 'neutral' | 'destructive'

const orderTones: Record<OrderStatus, BadgeTone> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'neutral',
  refunded: 'destructive',
}

const paymentTones: Record<PaymentStatus, BadgeTone> = {
  captured: 'success',
  pending: 'warning',
  failed: 'destructive',
  refunded: 'destructive',
}

const shipmentTones: Record<ShipmentStatus, BadgeTone> = {
  pending: 'warning',
  'in-transit': 'info',
  'out-for-delivery': 'info',
  delivered: 'success',
  failed: 'destructive',
}

const settlementTones: Record<SettlementStatus, BadgeTone> = {
  pending: 'warning',
  processed: 'info',
  paid: 'success',
  failed: 'destructive',
}

const productTones: Record<ProductStatus, BadgeTone> = {
  active: 'success',
  draft: 'neutral',
  archived: 'neutral',
  'out-of-stock': 'destructive',
}

const vendorTones: Record<Vendor['status'], BadgeTone> = {
  active: 'success',
  pending: 'warning',
  suspended: 'destructive',
}

const customerTones: Record<Customer['status'], BadgeTone> = {
  active: 'success',
  dormant: 'neutral',
  blocked: 'destructive',
}

export function orderStatusLabel(status: OrderStatus) {
  return status.replace('-', ' ')
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={orderTones[status]} className="capitalize">{orderStatusLabel(status)}</Badge>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentTones[status]} className="capitalize">{status}</Badge>
}

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return <Badge variant={shipmentTones[status]} className="capitalize">{status}</Badge>
}

export function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  return <Badge variant={settlementTones[status]} className="capitalize">{status}</Badge>
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <Badge variant={productTones[status]} className="capitalize">{status.replace('-', ' ')}</Badge>
}

export function VendorStatusBadge({ status }: { status: Vendor['status'] }) {
  return <Badge variant={vendorTones[status]} className="capitalize">{status}</Badge>
}

export function CustomerStatusBadge({ status }: { status: Customer['status'] }) {
  return <Badge variant={customerTones[status]} className="capitalize">{status}</Badge>
}

export function CustomerTierBadge({ tier }: { tier: Customer['tier'] }) {
  const map: Record<string, BadgeTone> = { platinum: 'info', gold: 'warning', silver: 'neutral', bronze: 'rose' }
  return <Badge variant={map[tier]} className="capitalize">{tier}</Badge>
}

export function NotificationTypeBadge({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, string> = {
    order: 'Order',
    customer: 'Customer',
    vendor: 'Vendor',
    payout: 'Payout',
    inventory: 'Inventory',
    system: 'System',
  }
  return <Badge variant="outline" className="capitalize">{map[type]}</Badge>
}