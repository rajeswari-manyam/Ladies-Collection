import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, ClipboardCheck, PackageOpen, Truck } from 'lucide-react'
import type { QualityCheckResult, ReturnRecord } from '@/features/returns/types'
import {
  EMPTY_RETURN_FILTERS,
  matchesReturnFilters,
  type ReturnFilters,
} from '@/features/returns/filters'
import { useReturnWorkspace } from '@/features/returns/store'
import { useVendorScope } from '@/features/returns/use-vendor-scope'
import { canDecideReturn, isReturnOpen } from '@/features/returns/workflow'
import type { ReturnAction } from '@/features/returns/components/action-menu'
import { ReturnFilterBar } from '@/features/returns/components/filter-bar'
import { MetricGrid, type Metric } from '@/features/returns/components/metric-grid'
import { ReturnCardList } from '@/features/returns/components/mobile-cards'
import { ReturnTable } from '@/features/returns/components/tables'
import {
  ConfirmActionDialog,
  QualityCheckDialog,
  RejectReturnDialog,
  SchedulePickupDialog,
} from '@/features/returns/components/decision-dialogs'
import { PageHeader } from '@/layouts/PageHeader'
import { EmptyState } from '@/components/common/state'

/**
 * Vendor returns list.
 *
 * Scoped to the signed-in seller, with the whole review flow reachable from the
 * row: decide the request, book the pickup, mark the handover and record the
 * quality check. Everything writes to local state, so the flow can be walked end
 * to end before the endpoints exist.
 */
export function VendorReturnsPage() {
  const navigate = useNavigate()
  const vendor = useVendorScope()
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

  const [filters, setFilters] = useState<ReturnFilters>(EMPTY_RETURN_FILTERS)
  const [rejecting, setRejecting] = useState<ReturnRecord | null>(null)
  const [scheduling, setScheduling] = useState<ReturnRecord | null>(null)
  const [checking, setChecking] = useState<ReturnRecord | null>(null)
  const [confirming, setConfirming] = useState<
    { record: ReturnRecord; action: 'mark_picked_up' | 'mark_received' } | null
  >(null)

  const vendorReturns = useMemo(
    () => returns.filter((record) => record.vendor.id === vendor.id),
    [returns, vendor.id],
  )
  const rows = useMemo(
    () => vendorReturns.filter((record) => matchesReturnFilters(record, filters)),
    [vendorReturns, filters],
  )

  const metrics = useMemo<Metric[]>(
    () => [
      {
        key: 'total',
        label: 'Total returns',
        value: vendorReturns.length,
        hint: `${vendorReturns.filter((record) => isReturnOpen(record.stage)).length} still open`,
        icon: <PackageOpen className="size-5" />,
        tone: 'primary',
      },
      {
        key: 'review',
        label: 'Awaiting review',
        value: vendorReturns.filter((record) => canDecideReturn(record.stage)).length,
        hint: 'Approve or reject to move them on',
        icon: <ClipboardCheck className="size-5" />,
        tone: 'warning',
      },
      {
        key: 'pickup',
        label: 'Pickups scheduled',
        value: vendorReturns.filter((record) => record.stage === 'pickup_scheduled').length,
        hint: 'Awaiting courier collection',
        icon: <Truck className="size-5" />,
        tone: 'info',
      },
      {
        key: 'refund',
        label: 'Refunds pending',
        value: vendorReturns
          .filter((record) => record.stage === 'refund_pending')
          .reduce((total, record) => total + record.refundAmount, 0),
        kind: 'currency',
        hint: 'Approved and with the platform',
        icon: <Banknote className="size-5" />,
        tone: 'positive',
      },
    ],
    [vendorReturns],
  )

  const refundOf = (record: ReturnRecord) => refunds.find((refund) => refund.returnHandle === record.id)

  const handleAction = (action: ReturnAction, record: ReturnRecord) => {
    switch (action) {
      case 'view':
        navigate(`/vendor/returns/${record.id}`)
        break
      case 'approve':
        if (record.stage === 'requested') markReviewing(record.id)
        approveReturn(record.id, 'Approved from the returns list')
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
        approveRefundForReturn(record.id, 'Approved after the quality check')
        break
      case 'view_refund': {
        const refund = refundOf(record)
        if (refund) navigate(`/vendor/refunds/${refund.id}`)
        break
      }
      case 'view_order':
        navigate(`/vendor/orders/${record.orderId}`)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Returns"
        title="Return requests"
        description={`Return requests raised against ${vendor.name}'s orders, with the review and pickup steps you own.`}
      />

      <MetricGrid metrics={metrics} />

      <ReturnFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_RETURN_FILTERS)}
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
              scope="vendor"
              refunds={refunds}
              onAction={handleAction}
              returnBasePath="/vendor/returns"
              refundBasePath="/vendor/refunds"
            />
          </div>
          <ReturnCardList
            records={rows}
            scope="vendor"
            onAction={handleAction}
            returnBasePath="/vendor/returns"
          />
        </>
      )}

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
        onApproveRefund={() => {
          if (checking) approveRefundForReturn(checking.id, 'Approved after the quality check')
          setChecking(null)
        }}
        onRejectRefund={() => {
          if (checking) rejectReturn(checking.id, 'Quality check failed', 'The product did not pass inspection.')
          setChecking(null)
        }}
      />

      <ConfirmActionDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={confirming?.action === 'mark_picked_up' ? 'Mark this product as picked up?' : 'Mark this product as received?'}
        description={
          confirming?.action === 'mark_picked_up'
            ? 'Confirm the courier has collected the product from the customer.'
            : 'Confirm the product has arrived at your warehouse and can be inspected.'
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