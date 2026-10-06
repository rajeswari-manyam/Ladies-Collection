import { Badge } from '@/components/ui/badge'
import {
  orderStatusText,
  orderStatusTone,
  paymentStatusText,
  paymentStatusTone,
  shipmentStatusText,
  shipmentStatusTone,
} from '@/components/common/workflow-status'

/**
 * Status badges built straight from the canonical label/tone tables, so a status
 * can never read one way in one screen and another way somewhere else.
 */

export function OrderStatusChip({
  status,
  className,
}: {
  status: string | null | undefined
  className?: string
}) {
  return (
    <Badge variant={orderStatusTone(status)} className={className}>
      {orderStatusText(status)}
    </Badge>
  )
}

export function PaymentStatusChip({
  status,
  className,
}: {
  status: string | null | undefined
  className?: string
}) {
  return (
    <Badge variant={paymentStatusTone(status)} className={className}>
      {paymentStatusText(status)}
    </Badge>
  )
}

export function ShipmentStatusChip({
  status,
  className,
}: {
  status: string | null | undefined
  className?: string
}) {
  return (
    <Badge variant={shipmentStatusTone(status)} className={className}>
      {shipmentStatusText(status)}
    </Badge>
  )
}
