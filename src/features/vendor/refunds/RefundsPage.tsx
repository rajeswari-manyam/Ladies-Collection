import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote, CircleCheckBig, Clock, Hourglass } from 'lucide-react'
import type { RefundRecord } from '@/features/returns/types'
import { EMPTY_REFUND_FILTERS, matchesRefundFilters, type RefundFilters } from '@/features/returns/filters'
import { useReturnWorkspace } from '@/features/returns/store'
import { useVendorScope } from '@/features/returns/use-vendor-scope'
import { isRefundOpen } from '@/features/returns/workflow'
import type { RefundListAction } from '@/features/returns/components/refund-action-menu'
import { RefundFilterBar } from '@/features/returns/components/filter-bar'
import { MetricGrid, type Metric } from '@/features/returns/components/metric-grid'
import { RefundCardList } from '@/features/returns/components/mobile-cards'
import { RefundTable } from '@/features/returns/components/tables'
import { PageHeader } from '@/layouts/PageHeader'
import { EmptyState } from '@/components/common/state'

/**
 * Vendor refunds list.
 *
 * Read-only by design: the seller approved the refund, the platform processes and
 * settles it, so this screen reports the state of each payout back to the store
 * without offering controls that would be rejected.
 */
export function VendorRefundsPage() {
  const navigate = useNavigate()
  const vendor = useVendorScope()
  const refunds = useReturnWorkspace((state) => state.refunds)

  const [filters, setFilters] = useState<RefundFilters>(EMPTY_REFUND_FILTERS)

  const vendorRefunds = useMemo(
    () => refunds.filter((record) => record.vendor.id === vendor.id),
    [refunds, vendor.id],
  )
  const rows = useMemo(
    () => vendorRefunds.filter((record) => matchesRefundFilters(record, filters)),
    [vendorRefunds, filters],
  )

  const sum = (records: RefundRecord[]) => records.reduce((total, record) => total + record.refundAmount, 0)

  const metrics = useMemo<Metric[]>(() => {
    const open = vendorRefunds.filter((record) => isRefundOpen(record.stage))
    const completed = vendorRefunds.filter((record) => record.stage === 'completed')

    return [
      {
        key: 'total',
        label: 'Total refunds',
        value: vendorRefunds.length,
        hint: `${open.length} still with the platform`,
        icon: <Banknote className="size-5" />,
        tone: 'primary',
      },
      {
        key: 'pending',
        label: 'Refunds pending',
        value: sum(open),
        kind: 'currency',
        hint: 'Approved or awaiting approval',
        icon: <Hourglass className="size-5" />,
        tone: 'warning',
      },
      {
        key: 'completed',
        label: 'Refunded to customers',
        value: sum(completed),
        kind: 'currency',
        hint: `${completed.length} settled refunds`,
        icon: <CircleCheckBig className="size-5" />,
        tone: 'positive',
      },
      {
        key: 'processing',
        label: 'In progress',
        value: vendorRefunds.filter((record) => record.stage === 'processing').length,
        hint: 'Sent to the payment gateway',
        icon: <Clock className="size-5" />,
        tone: 'info',
      },
    ]
  }, [vendorRefunds])

  const handleAction = (action: RefundListAction, record: RefundRecord) => {
    if (action === 'view_refund') navigate(`/vendor/refunds/${record.id}`)
    if (action === 'view_return') navigate(`/vendor/returns/${record.returnHandle}`)
    if (action === 'view_order') navigate(`/vendor/orders/${record.orderId}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Refunds"
        title="Refunds"
        description={`Refunds raised on returns from ${vendor.name}'s orders, and where each one has reached.`}
      />

      <MetricGrid metrics={metrics} />

      <RefundFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_REFUND_FILTERS)}
        resultCount={rows.length}
      />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8">
          <EmptyState
            title="No refunds match these filters"
            description="Refunds appear here once a return has been approved and handed to the platform."
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <RefundTable
              records={rows}
              scope="vendor"
              onAction={handleAction}
              refundBasePath="/vendor/refunds"
              returnBasePath="/vendor/returns"
            />
          </div>
          <RefundCardList
            records={rows}
            onAction={handleAction}
            refundBasePath="/vendor/refunds"
            returnBasePath="/vendor/returns"
          />
        </>
      )}
    </div>
  )
}