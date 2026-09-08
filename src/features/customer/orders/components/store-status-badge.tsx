import type { StoreOrderStatus } from '@/features/customer/types'
import { Badge, type BadgeProps } from '@/components/ui/badge'

const STYLE: Record<StoreOrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
  placed: { label: 'Placed', variant: 'neutral' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  shipped: { label: 'Shipped', variant: 'warning' },
  'in-transit': { label: 'In transit', variant: 'warning' },
  'out-for-delivery': { label: 'Out for delivery', variant: 'rose' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export function StoreOrderStatusBadge({ status, className }: { status: StoreOrderStatus; className?: string }) {
  const config = STYLE[status]
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}