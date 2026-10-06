import { Badge } from '@/components/ui/badge'
import type { ReturnReason } from '@/types/finance.types'
import type { RefundStage, ReturnStage } from '@/features/returns/types'
import {
  refundStageLabel,
  refundStageTone,
  returnReasonLabel,
  returnStageLabel,
  returnStageTone,
} from '@/features/returns/workflow'

/** Status chips for the return and refund workflows shown across the workspace. */

export function ReturnStageBadge({ stage, className }: { stage: ReturnStage; className?: string }) {
  return (
    <Badge variant={returnStageTone(stage)} className={className}>
      {returnStageLabel(stage)}
    </Badge>
  )
}

export function RefundStageBadge({ stage, className }: { stage: RefundStage; className?: string }) {
  return (
    <Badge variant={refundStageTone(stage)} className={className}>
      {refundStageLabel(stage)}
    </Badge>
  )
}

export function ReturnReasonBadge({ reason, className }: { reason: ReturnReason | string; className?: string }) {
  return (
    <Badge variant="outline" className={className}>
      {returnReasonLabel(reason)}
    </Badge>
  )
}
