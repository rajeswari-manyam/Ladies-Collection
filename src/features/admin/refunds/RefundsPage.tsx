import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, CircleCheckBig, Clock, Hourglass } from 'lucide-react'
import type { RefundRecord } from '@/features/returns/types'
import { EMPTY_REFUND_FILTERS, matchesRefundFilters, type RefundFilters } from '@/features/returns/filters'
import { useReturnWorkspace } from '@/features/returns/store'
import { DEMO_VENDORS } from '@/features/returns/demo-data'
import { isRefundOpen } from '@/features/returns/workflow'
import type { RefundListAction } from '@/features/returns/components/refund-action-menu'
import { RefundFilterBar } from '@/features/returns/components/filter-bar'
import { MetricGrid, type Metric } from '@/features/returns/components/metric-grid'
import { RefundCardList } from '@/features/returns/components/mobile-cards'
import { RefundTable } from '@/features/returns/components/tables'
import {
  CompleteRefundDialog,
  ProcessRefundDialog,
  RejectRefundDialog,
} from '@/features/returns/components/refund-dialogs'
import { PageHeader } from '@/layouts/PageHeader'
import { EmptyState } from '@/components/common/state'

/**
 * Admin refunds list.
 *
 * The payout queue: every refund raised by a vendor, with the three controls that
 * move one along — send it to the gateway, settle it, or decline it. Each action
 * opens a dialog, and every dialog asks for confirmation before local state moves.
 */
export function AdminRefundsPage() {
  const navigate = useNavigate()
  const refunds = useReturnWorkspace((state) => state.refunds)
  const processRefund = useReturnWorkspace((state) => state.processRefund)
  const completeRefund = useReturnWorkspace((state) => state.completeRefund)
  const rejectRefund = useReturnWorkspace((state) => state.rejectRefund)

  const [filters, setFilters] = useState<RefundFilters>(EMPTY_REFUND_FILTERS)
  const [processing, setProcessing] = useState<RefundRecord | null>(null)
  const [completing, setCompleting] = useState<RefundRecord | null>(null)
  const [rejecting, setRejecting] = useState<RefundRecord | null>(null)

  const rows = useMemo(() => refunds.filter((record) => matchesRefundFilters(record, filters)), [refunds, filters])

  const sum = (records: RefundRecord[]) => records.reduce((total, record) => total + record.refundAmount, 0)

  const metrics = useMemo<Metric[]>(() => {
    const open = refunds.filter((record) => isRefundOpen(record.stage))
    const completed = refunds.filter((record) => record.stage === 'completed')
    const failed = refunds.filter((record) => record.stage === 'failed')

    return [
      {
        key: 'total',
        label: 'Total refunds',
        value: refunds.length,
        hint: `${open.length} still to settle`,
        icon: <Banknote className="size-5" />,
        tone: 'primary',
      },
      {
        key: 'pending',
        label: 'Awaiting payout',
        value: sum(open),
        kind: 'currency',
        hint: 'Approved or awaiting approval',
        icon: <Hourglass className="size-5" />,
        tone: 'warning',
      },
      {
        key: 'completed',
        label: 'Refunded',
        value: sum(completed),
        kind: 'currency',
        hint: `${completed.length} settled refunds`,
        icon: <CircleCheckBig className="size-5" />,
        tone: 'positive',
      },
      {
        key: 'attention',
        label: 'Needs attention',
        value: failed.length,
        hint: failed.length > 0 ? 'Failed payouts to retry or decline' : 'Nothing has failed',
        icon: <Clock className="size-5" />,
        tone: failed.length > 0 ? 'negative' : 'muted',
      },
    ]
  }, [refunds])

  const handleAction = (action: RefundListAction, record: RefundRecord) => {
    switch (action) {
      case 'view_refund':
        navigate(`/refunds/${record.id}`)
        break
      case 'view_return':
        navigate(`/returns/${record.returnHandle}`)
        break
      case 'view_order':
        navigate(`/orders/${record.orderId}`)
        break
      case 'process_refund':
        setProcessing(record)
        break
      case 'complete_refund':
        setCompleting(record)
        break
      case 'reject_refund':
        setRejecting(record)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Refunds"
        description="Every refund raised by a vendor, and the payout controls that move it from approval to the customer's account."
      />

      <MetricGrid metrics={metrics} />

      <RefundFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_REFUND_FILTERS)}
        vendors={DEMO_VENDORS}
        showVendor
        resultCount={rows.length}
      />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8">
          <EmptyState
            title="No refunds match these filters"
            description="Refunds appear here once a vendor approves one against a return."
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <RefundTable
              records={rows}
              scope="admin"
              onAction={handleAction}
              refundBasePath="/refunds"
              returnBasePath="/returns"
            />
          </div>
          <RefundCardList
            records={rows}
            scope="admin"
            onAction={handleAction}
            refundBasePath="/refunds"
            returnBasePath="/returns"
          />
        </>
      )}

      <ProcessRefundDialog
        open={Boolean(processing)}
        onOpenChange={(open) => !open && setProcessing(null)}
        refund={processing}
        onConfirm={(amount, notes) => processing && processRefund(processing.id, { amount, notes })}
      />

      <CompleteRefundDialog
        open={Boolean(completing)}
        onOpenChange={(open) => !open && setCompleting(null)}
        refund={completing}
        onConfirm={(reference, notes) =>
          completing &&
          completeRefund(completing.id, {
            refundReference: reference,
            transactionReference: reference,
            processedAt: new Date().toISOString(),
            notes,
          })
        }
      />

      <RejectRefundDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
        refund={rejecting}
        onConfirm={(reason, notes) => rejecting && rejectRefund(rejecting.id, { reason, notes })}
      />
    </div>
  )
}