import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote, ClipboardCheck, PackageCheck, PackageOpen, Truck } from 'lucide-react'
import type { QualityCheckResult } from '@/features/returns/types'
import { useReturnWorkspace } from '@/features/returns/store'
import { useVendorScope } from '@/features/returns/use-vendor-scope'
import {
  canDecideReturn,
  canMarkPickedUp,
  canMarkReceived,
  canRunQualityCheck,
  canSchedulePickup,
} from '@/features/returns/workflow'
import { ReturnStageBadge } from '@/features/returns/components/badges'
import { ReturnImageGallery } from '@/features/returns/components/gallery'
import {
  ApproveReturnDialog,
  ConfirmActionDialog,
  QualityCheckPanel,
  RejectReturnDialog,
  SchedulePickupDialog,
} from '@/features/returns/components/decision-dialogs'
import {
  CustomerInfoCard,
  OrderSummaryCard,
  ProductInfoCard,
  ReturnInfoCard,
  VendorInfoCard,
} from '@/features/returns/components/sections'
import { ReturnTimelineCard } from '@/features/returns/components/timelines'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/state'

/**
 * Vendor return details.
 *
 * The same six sections the spec calls for, in order: return information,
 * customer, vendor, product, the images the customer sent, and the trail. The
 * action bar above the fold carries whichever step this return is actually at.
 */
export function VendorReturnDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const vendor = useVendorScope()
  const record = useReturnWorkspace((state) => state.returns.find((item) => item.id === id))
  const refund = useReturnWorkspace((state) => state.refunds.find((item) => item.returnHandle === id))
  const approveReturn = useReturnWorkspace((state) => state.approveReturn)
  const rejectReturn = useReturnWorkspace((state) => state.rejectReturn)
  const schedulePickup = useReturnWorkspace((state) => state.schedulePickup)
  const markPickedUp = useReturnWorkspace((state) => state.markPickedUp)
  const markReceived = useReturnWorkspace((state) => state.markReceived)
  const submitQualityCheck = useReturnWorkspace((state) => state.submitQualityCheck)
  const approveRefundForReturn = useReturnWorkspace((state) => state.approveRefundForReturn)

  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [confirming, setConfirming] = useState<'mark_picked_up' | 'mark_received' | null>(null)

  if (!record || record.vendor.id !== vendor.id) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Return not found"
          description="This return request could not be found for your store."
          action={
            <Button variant="outline" asChild>
              <Link to="/vendor/returns">All returns</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/vendor/returns">
          <ArrowLeft className="size-4" />
          All returns
        </Link>
      </Button>

      <PageHeader
        eyebrow="Returns"
        title={record.returnId}
        description={`Order ${record.orderNumber} · ${record.customer.name} · ${record.product.name}`}
        actions={<ReturnStageBadge stage={record.stage} />}
      />

      <div className="flex flex-wrap gap-2">
        {canDecideReturn(record.stage) && (
          <>
            <Button onClick={() => setApproving(true)}>Approve return</Button>
            <Button variant="outline" onClick={() => setRejecting(true)}>
              Reject return
            </Button>
          </>
        )}
        {canSchedulePickup(record.stage) && (
          <Button onClick={() => setScheduling(true)}>
            <Truck className="size-4" />
            Schedule pickup
          </Button>
        )}
        {canMarkPickedUp(record.stage) && (
          <Button onClick={() => setConfirming('mark_picked_up')}>
            <PackageOpen className="size-4" />
            Mark product picked up
          </Button>
        )}
        {canMarkReceived(record.stage) && (
          <Button onClick={() => setConfirming('mark_received')}>
            <PackageCheck className="size-4" />
            Mark product received
          </Button>
        )}
        {refund && (
          <Button variant="outline" onClick={() => navigate(`/vendor/refunds/${refund.id}`)}>
            <Banknote className="size-4" />
            View refund {refund.refundId}
          </Button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ReturnInfoCard record={record} />

          <Card>
            <CardHeader>
              <CardTitle>Return images</CardTitle>
              <CardDescription>Photos the customer uploaded with the request.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnImageGallery images={record.images} />
            </CardContent>
          </Card>

          <ProductInfoCard record={record} />

          {(canRunQualityCheck(record.stage) || record.qualityCheck) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="size-4 text-muted-foreground" />
                  Quality check
                </CardTitle>
                <CardDescription>Inspect the product and decide whether the refund is due.</CardDescription>
              </CardHeader>
              <CardContent>
                <QualityCheckPanel
                  record={record}
                  onSubmit={(result: QualityCheckResult) => submitQualityCheck(record.id, result)}
                  onApproveRefund={() => approveRefundForReturn(record.id, 'Approved after the quality check')}
                  onRejectRefund={() => setRejecting(true)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <CustomerInfoCard customer={record.customer} />
          <VendorInfoCard vendor={record.vendor} />
          <OrderSummaryCard record={record} orderBasePath="/vendor/orders" />
          <ReturnTimelineCard record={record} />
        </div>
      </div>

      <ApproveReturnDialog
        open={approving}
        onOpenChange={setApproving}
        record={record}
        onConfirm={(notes) => approveReturn(record.id, notes)}
      />

      <RejectReturnDialog
        open={rejecting}
        onOpenChange={setRejecting}
        record={record}
        onConfirm={(reason, notes) => rejectReturn(record.id, reason, notes)}
      />

      <SchedulePickupDialog
        open={scheduling}
        onOpenChange={setScheduling}
        record={record}
        onConfirm={(pickup) => schedulePickup(record.id, pickup)}
      />

      <ConfirmActionDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={confirming === 'mark_picked_up' ? 'Mark this product as picked up?' : 'Mark this product as received?'}
        description={
          confirming === 'mark_picked_up'
            ? 'Confirm the courier has collected the product from the customer.'
            : 'Confirm the product has arrived at your warehouse and can be inspected.'
        }
        confirmLabel={confirming === 'mark_picked_up' ? 'Mark picked up' : 'Mark received'}
        onConfirm={() => {
          if (confirming === 'mark_picked_up') markPickedUp(record.id)
          else markReceived(record.id)
        }}
      />
    </div>
  )
}