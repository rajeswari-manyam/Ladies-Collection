import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, ClipboardCheck, PackageOpen, Truck } from 'lucide-react'
import type { QualityCheckResult, RefundRecord, ReturnRecord } from '@/features/returns/types'
import { EMPTY_RETURN_FILTERS, matchesReturnFilters, type ReturnFilters } from '@/features/returns/filters'
import { useReturnWorkspace } from '@/features/returns/store'
import { DEMO_VENDORS } from '@/features/returns/demo-data'
import { canDecideReturn, isReturnOpen } from '@/features/returns/workflow'
import type { ReturnAction } from '@/features/returns/components/action-menu'
import { ReturnFilterBar } from '@/features/returns/components/filter-bar'
import { MetricGrid, type Metric } from '@/features/returns/components/metric-grid'
import { ReturnCardList } from '@/features/returns/components/mobile-cards'
import { ReturnTable } from '@/features/returns/components/tables'
import {
  ApproveReturnDialog,
  ConfirmActionDialog,
  QualityCheckDialog,
  RejectReturnDialog,
  SchedulePickupDialog,
} from '@/features/returns/components/decision-dialogs'
import { ProcessRefundDialog } from '@/features/returns/components/refund-dialogs'
import { PageHeader } from '@/layouts/PageHeader'
import { EmptyState } from '@/components/common/state'

/**
 * Admin returns list.
 *
 * Every vendor's returns in one queue, with the platform-side hand-off to the
 * refund queue: an approved quality check with no refund yet gets one raised so
 * the refund can be processed on the refunds screen.
 */
export function AdminReturnsPage() {
  const navigate = useNavigate()
  const returns = useReturnWorkspace((state) => state.returns)
  const refunds = useReturnWorkspace((state) => state.refunds)
  const markReviewing = useReturnWorkspace((state) => state.markReviewing)
  const approveReturn = useReturnWorkspace((state) => state.approveReturn)
  const rejectReturn = useReturnWorkspace((state) => state.rejectReturn)
  const schedulePickup = useReturnWorkspace((state) => state.schedulePickup)
  const markPickedUp = useReturnWorkspace((state) => state.markPickedUp)
  const markReceived = useReturnWorkspace((state) => state.markReceived)
  const submitQualityCheck = useReturnWorkspace((state) => state.submitQualityCheck)
  const approveRefundForReturn = useReturnWorkspace((state) => state.approveRefundForReturn)
  const processRefund = useReturnWorkspace((state) => state.processRefund)

  const [filters, setFilters] = useState<ReturnFilters>(EMPTY_RETURN_FILTERS)
  const [approving, setApproving] = useState<ReturnRecord | null>(null)
  const [rejecting, setRejecting] = useState<ReturnRecord | null>(null)
  const [scheduling, setScheduling] = useState<ReturnRecord | null>(null)
  const [checking, setChecking] = useState<ReturnRecord | null>(null)
  const [processing, setProcessing] = useState<RefundRecord | null>(null)
  const [confirming, setConfirming] = useState<{
    record: ReturnRecord
    action: 'mark_picked_up' | 'mark_received'
  } | null>(null)

  const rows = useMemo(() => returns.filter((record) => matchesReturnFilters(record, filters)), [returns, filters])

  const metrics = useMemo<Metric[]>(
    () => [
      {
        key: 'total',
        label: 'Total returns',
        value: returns.length,
        hint: `${returns.filter((record) => isReturnOpen(record.stage)).length} still open`,
        icon: <PackageOpen className="size-5" />,
        tone: 'primary',
      },
      {
        key: 'review',
        label: 'Awaiting review',
        value: returns.filter((record) => canDecideReturn(record.stage)).length,
        hint: 'Across every vendor',
        icon: <ClipboardCheck className="size-5" />,
        tone: 'warning',
      },
      {
        key: 'pickup',
        label: 'In transit',
        value: returns.filter((record) => record.stage === 'pickup_scheduled').length,
        hint: 'Pickup booked, not collected yet',
        icon: <Truck className="size-5" />,
        tone: 'info',
      },
      {
        key: 'refund',
        label: 'Refunds to process',
        value: returns
          .filter((record) => record.stage === 'quality_check' || record.stage === 'refund_pending')
          .reduce((total, record) => total + record.refundAmount, 0),
        kind: 'currency',
        hint: 'Awaiting a gateway payout',
        icon: <Banknote className="size-5" />,
        tone: 'positive',
      },
    ],
    [returns],
  )

  const refundOf = (record: ReturnRecord) => refunds.find((refund) => refund.returnHandle === record.id)

  const handleAction = (action: ReturnAction, record: ReturnRecord) => {
    switch (action) {
      case 'view':
        navigate(`/returns/${record.id}`)
        break
      case 'approve':
        setApproving(record)
        break
      case 'reject':
        setRejecting(record)
        break
      case 'schedule_pickup':
        setScheduling(record)
        break
      case 'mark_picked_up':
        setConfirming({ record, action })
        break
      case 'mark_received':
        setConfirming({ record, action })
        break
      case 'quality_check':
        setChecking(record)
        break
      case 'approve_refund':
        approveRefundForReturn(record.id, 'Refund raised by the platform')
        break
      case 'process_refund': {
        const refund = refundOf(record)
        if (refund) setProcessing(refund)
        else approveRefundForReturn(record.id, 'Refund raised by the platform after the quality check')
        break
      }
      case 'view_refund': {
        const refund = refundOf(record)
        if (refund) navigate(`/refunds/${refund.id}`)
        break
      }
      case 'view_order':
        navigate(`/orders/${record.orderId}`)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Returns"
        description="Return requests across every vendor, from the customer's request through to the refund hand-off."
      />

      <MetricGrid metrics={metrics} />

      <ReturnFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_RETURN_FILTERS)}
        vendors={DEMO_VENDORS}
        showVendor
        resultCount={rows.length}
      />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8">
          <EmptyState
            title="No returns match these filters"
            description="Adjust the filters above, or wait for the next return request to come in."
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <ReturnTable
              records={rows}
              scope="admin"
              refunds={refunds}
              onAction={handleAction}
              returnBasePath="/returns"
              refundBasePath="/refunds"
            />
          </div>
          <ReturnCardList records={rows} scope="admin" onAction={handleAction} returnBasePath="/returns" />
        </>
      )}

      <ApproveReturnDialog
        open={Boolean(approving)}
        onOpenChange={(open) => !open && setApproving(null)}
        record={approving}
        onConfirm={(notes) => {
          if (!approving) return
          if (approving.stage === 'requested') markReviewing(approving.id)
          approveReturn(approving.id, notes || 'Approved by the platform')
        }}
      />

      <RejectReturnDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
        record={rejecting}
        onConfirm={(reason, notes) => rejecting && rejectReturn(rejecting.id, reason, notes)}
      />

      <SchedulePickupDialog
        open={Boolean(scheduling)}
        onOpenChange={(open) => !open && setScheduling(null)}
        record={scheduling}
        onConfirm={(pickup) => scheduling && schedulePickup(scheduling.id, pickup)}
      />

      <QualityCheckDialog
        open={Boolean(checking)}
        onOpenChange={(open) => !open && setChecking(null)}
        record={checking}
        onSubmit={(result: QualityCheckResult) => checking && submitQualityCheck(checking.id, result)}
      />

      <ProcessRefundDialog
        open={Boolean(processing)}
        onOpenChange={(open) => !open && setProcessing(null)}
        refund={processing}
        onConfirm={(amount, notes) => processing && processRefund(processing.id, { amount, notes })}
      />

      <ConfirmActionDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={
          confirming?.action === 'mark_picked_up' ? 'Mark this product as picked up?' : 'Mark this product as received?'
        }
        description={
          confirming?.action === 'mark_picked_up'
            ? 'Confirm the courier has collected the product from the customer.'
            : 'Confirm the product has arrived at the vendor warehouse and can be inspected.'
        }
        confirmLabel={confirming?.action === 'mark_picked_up' ? 'Mark picked up' : 'Mark received'}
        onConfirm={() => {
          if (!confirming) return
          if (confirming.action === 'mark_picked_up') markPickedUp(confirming.record.id)
          else markReceived(confirming.record.id)
        }}
      />
    </div>
  )
}