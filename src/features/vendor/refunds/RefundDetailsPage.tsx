import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Undo2 } from 'lucide-react'
import { useReturnWorkspace } from '@/features/returns/store'
import { useVendorScope } from '@/features/returns/use-vendor-scope'
import { RefundStageBadge } from '@/features/returns/components/badges'
import { RefundInfoCard, RefundBreakdownCard, PaymentInfoCard } from '@/features/returns/components/sections'
import { RefundTimelineCard } from '@/features/returns/components/timelines'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/state'

/**
 * Vendor refund details.
 *
 * Read-only: the seller approved the amount, and the platform processes, settles
 * and reports on it. The screen therefore explains the state instead of offering
 * controls the seller would not be allowed to use.
 */
export function VendorRefundDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const vendor = useVendorScope()
  const refund = useReturnWorkspace((state) => state.refunds.find((item) => item.id === id))
  const record = useReturnWorkspace((state) => state.returns.find((item) => item.id === refund?.returnHandle))

  if (!refund || refund.vendor.id !== vendor.id) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Refund not found"
          description="This refund could not be found for your store."
          action={
            <Button variant="outline" asChild>
              <Link to="/vendor/refunds">All refunds</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/vendor/refunds">
          <ArrowLeft className="size-4" />
          All refunds
        </Link>
      </Button>

      <PageHeader
        eyebrow="Refunds"
        title={refund.refundId}
        description={`Return ${refund.returnId} · Order ${refund.orderNumber} · ${refund.customer.name}`}
        actions={<RefundStageBadge stage={refund.stage} />}
      >
        {record && (
          <Button variant="outline" onClick={() => navigate(`/vendor/returns/${record.id}`)}>
            <Undo2 className="size-4" />
            View return {record.returnId}
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <RefundInfoCard refund={refund} />
          <RefundBreakdownCard refund={refund} />
        </div>

        <div className="space-y-6">
          <PaymentInfoCard refund={refund} />
          <RefundTimelineCard record={refund} />
        </div>
      </div>
    </div>
  )
}