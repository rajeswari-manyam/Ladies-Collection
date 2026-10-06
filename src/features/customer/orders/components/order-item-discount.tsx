import { orderItemDiscount, type OrderItem } from '@/services/order.service'
import { formatINR } from '@/utils'

/**
 * Original amount, discount percentage and discount amount for an order line,
 * read from the backend's stored `pricing` breakdown.
 */
export function OrderItemDiscount({ item, className }: { item: OrderItem; className?: string }) {
  const { basePrice, percent, amount } = orderItemDiscount(item)
  if (percent <= 0 && amount <= 0) return null

  return (
    <p className={className}>
      <span className="text-muted-foreground line-through">{formatINR(basePrice)}</span>
      <span className="ml-1.5 font-semibold text-emerald-600">
        {percent}% off · Save {formatINR(amount)}
      </span>
    </p>
  )
}
