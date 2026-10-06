import { Badge } from '@/components/ui/badge'
import {
  refundStatusText,
  refundStatusTone,
  returnStatusText,
  returnStatusTone,
  settlementStatusText,
  settlementStatusTone,
} from '@/components/common/finance-status'

/**
 * Status chips for the refund, return and settlement vocabularies. Each one
 * takes a raw API status and renders the label the whole app agrees on.
 */

export function RefundStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined
  className?: string
}) {
  return (
    <Badge variant={refundStatusTone(status)} className={className}>
      {refundStatusText(status)}
    </Badge>
  )
}

export function ReturnStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined
  className?: string
}) {
  return (
    <Badge variant={returnStatusTone(status)} className={className}>
      {returnStatusText(status)}
    </Badge>
  )
}

export function SettlementStatusChip({
  status,
  className,
}: {
  status: string | null | undefined
  className?: string
}) {
  return (
    <Badge variant={settlementStatusTone(status)} className={className}>
      {settlementStatusText(status)}
    </Badge>
  )
}
