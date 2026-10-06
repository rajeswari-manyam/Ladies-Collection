import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FinanceTimeline } from '@/components/common/finance-timeline'
import type { RefundRecord, ReturnRecord } from '@/features/returns/types'
import { refundTimelineSteps, returnTimelineSteps } from '@/features/returns/workflow'

/** Return and refund trails, rendered with the shared finance timeline. */

export function ReturnTimelineCard({ record }: { record: ReturnRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Return timeline</CardTitle>
        <CardDescription>Requested through to the refund being credited.</CardDescription>
      </CardHeader>
      <CardContent>
        <FinanceTimeline steps={returnTimelineSteps(record)} emptyLabel="No return activity recorded yet." />
      </CardContent>
    </Card>
  )
}

export function RefundTimelineCard({ record }: { record: RefundRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Refund timeline</CardTitle>
        <CardDescription>Requested, reviewed and settled through the gateway.</CardDescription>
      </CardHeader>
      <CardContent>
        <FinanceTimeline steps={refundTimelineSteps(record)} emptyLabel="No refund activity recorded yet." />
      </CardContent>
    </Card>
  )
}
