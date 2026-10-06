import { StatusProgressBar, StatusTimeline } from '@/components/common/status-timeline'
import {
  ORDER_STEPS,
  isTerminalOrder,
  orderStepIndex,
  orderTerminalState,
} from '@/components/common/workflow-status'
import { formatDateTime } from '@/utils'
import type { Order } from '@/services/order.service'

/**
 * Customer-facing order lifecycle. Steps are limited to the statuses the order
 * API can store; the courier handover is shown separately by the shipment
 * timeline, so nothing here implies a status the backend cannot record.
 */
export function OrderProgressTimeline({
  order,
  stepMeta,
  className,
}: {
  order: Order
  /** Timestamps keyed by step, e.g. from the order's shipments. */
  stepMeta?: Record<string, string | undefined>
  className?: string
}) {
  const meta: Record<string, string | undefined> = {
    placed: `Placed ${formatDateTime(order.createdAt)}`,
    payment_confirmed:
      order.paymentStatus === 'confirmed' || order.paymentStatus === 'refunded'
        ? 'Payment received'
        : 'Awaiting payment',
    ...stepMeta,
  }

  return (
    <StatusTimeline
      className={className}
      steps={ORDER_STEPS}
      currentIndex={orderStepIndex(order.orderStatus)}
      terminal={orderTerminalState(order.orderStatus)}
      stepMeta={meta}
    />
  )
}

/** Compact variant for order rows in the list. */
export function OrderProgressBar({ order, className }: { order: Order; className?: string }) {
  if (isTerminalOrder(order.orderStatus)) return null
  return (
    <StatusProgressBar className={className} steps={ORDER_STEPS} currentIndex={orderStepIndex(order.orderStatus)} />
  )
}
