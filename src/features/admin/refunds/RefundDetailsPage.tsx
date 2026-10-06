import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote, CheckCircle2, Undo2, XCircle } from 'lucide-react'
import { useReturnWorkspace } from '@/features/returns/store'
import { canCompleteRefund, canProcessRefund, canRejectRefund } from '@/features/returns/workflow'
import { RefundStageBadge } from '@/features/returns/components/badges'
import {
  PaymentInfoCard,
  RefundBreakdownCard,
  RefundInfoCard,
  ReturnInfoCard,
  VendorInfoCard,
} from '@/features/returns/components/sections'
import { RefundTimelineCard } from '@/features/returns/components/timelines'
import {
  CompleteRefundDialog,
  ProcessRefundDialog,
  RejectRefundDialog,
} from '@/features/returns/components/refund-dialogs'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/state'

/**
 * Admin refund details.
 *
 * The refund side of a return: the information the finance team needs, the
 * calculation behind the amount, and the three controls that take it from approval
 * to the customer's account. Each control opens a dialog before anything moves.
 */
export function AdminRefundDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const refund = useReturnWorkspace((state) => state.refunds.find((item) => item.id === id))
  const record = useReturnWorkspace((state) => state.returns.find((item) => item.id === refund?.returnHandle))
  const processRefund = useReturnWorkspace((state) => state.processRefund)
  const completeRefund = useReturnWorkspace((state) => state.completeRefund)
  const rejectRefund = useReturnWorkspace((state) => state.rejectRefund)

  const [processing, setProcessing] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  if (!refund) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Refund not found"
          description="This refund could not be found."
          action={
            <Button variant="outline" asChild>
              <Link to="/refunds">All refunds</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/refunds">
          <ArrowLeft className="size-4" />
          All refunds
        </Link>
      </Button>

      <PageHeader
        eyebrow="Finance"
        title={refund.refundId}
        description={`Return ${refund.returnId} · Order ${refund.orderNumber} · ${refund.customer.name}`}
        actions={<RefundStageBadge stage={refund.stage} />}
      >
        {record && (
          <Button variant="outline" onClick={() => navigate(`/returns/${record.id}`)}>
            <Undo2 className="size-4" />
            View return {record.returnId}
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {canProcessRefund(refund.stage) && (
          <Button onClick={() => setProcessing(true)}>
            <Banknote className="size-4" />
            Process refund
          </Button>
        )}
        {canCompleteRefund(refund.stage) && (
          <Button onClick={() => setCompleting(true)}>
            <CheckCircle2 className="size-4" />
            Mark refund completed
          </Button>
        )}
        {canRejectRefund(refund.stage) && (
          <Button variant="destructive" onClick={() => setRejecting(true)}>
            <XCircle className="size-4" />
            Reject refund
          </Button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <RefundInfoCard refund={refund} />
          <RefundBreakdownCard refund={refund} />
          {record && <ReturnInfoCard record={record} />}
        </div>

        <div className="space-y-6">
          <PaymentInfoCard refund={refund} />
          <VendorInfoCard vendor={refund.vendor} />
          <RefundTimelineCard record={refund} />
        </div>
      </div>

      <ProcessRefundDialog
        open={processing}
        onOpenChange={setProcessing}
        refund={refund}
        onConfirm={(amount, notes) => processRefund(refund.id, { amount, notes })}
      />

      <CompleteRefundDialog
        open={completing}
        onOpenChange={setCompleting}
        refund={refund}
        onConfirm={(reference, notes) =>
          completeRefund(refund.id, {
            refundReference: reference,
            transactionReference: reference,
            processedAt: new Date().toISOString(),
            notes,
          })
        }
      />

      <RejectRefundDialog
        open={rejecting}
        onOpenChange={setRejecting}
        refund={refund}
        onConfirm={(reason, notes) => rejectRefund(refund.id, { reason, notes })}
      />
    </div>
  )
}