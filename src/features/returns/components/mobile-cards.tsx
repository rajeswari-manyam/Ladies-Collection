import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, ShoppingBag, Truck } from 'lucide-react'
import type { RefundRecord, ReturnRecord } from '@/features/returns/types'
import { Amount, DateField } from '@/components/common/finance-fields'
import { ProductThumb } from '@/components/common/artwork'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReturnStageBadge, RefundStageBadge } from '@/features/returns/components/badges'
import { returnReasonLabel } from '@/features/returns/workflow'
import type { ReturnAction } from '@/features/returns/components/action-menu'
import type { RefundListAction } from '@/features/returns/components/refund-action-menu'
import {
  canCompleteRefund,
  canDecideReturn,
  canProcessRefund,
  canRejectRefund,
} from '@/features/returns/workflow'

/**
 * Card list shown below `md`, where a twelve-column table stops being readable.
 *
 * Same record, same actions, stacked: identity and status first, then the money
 * figures, then the buttons that are actionable right now.
 */

function PrimaryReturnActions({
  record,
  scope,
  hasRefund,
  onAction,
}: {
  record: ReturnRecord
  scope: 'vendor' | 'admin'
  hasRefund: boolean
  onAction: (action: ReturnAction, record: ReturnRecord) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => onAction('view', record)}>
        <Eye className="size-3.5" />
        View details
      </Button>
      {canDecideReturn(record.stage) && (
        <Button size="sm" onClick={() => onAction('approve', record)}>
          Approve return
        </Button>
      )}
      {record.stage === 'approved' && (
        <Button size="sm" variant="outline" onClick={() => onAction('schedule_pickup', record)}>
          <Truck className="size-3.5" />
          Schedule pickup
        </Button>
      )}
      {record.stage === 'picked_up' && (
        <Button size="sm" variant="outline" onClick={() => onAction('mark_received', record)}>
          Mark received
        </Button>
      )}
      {record.stage === 'received' && (
        <Button size="sm" variant="outline" onClick={() => onAction('quality_check', record)}>
          Quality check
        </Button>
      )}
      {record.stage === 'quality_check' && scope === 'vendor' && (
        <Button size="sm" variant="outline" onClick={() => onAction('approve_refund', record)}>
          Approve refund
        </Button>
      )}
      {record.stage === 'quality_check' && scope === 'admin' && (
        <Button size="sm" variant="outline" onClick={() => onAction('process_refund', record)}>
          Process refund
        </Button>
      )}
      {hasRefund && (
        <Button size="sm" variant="ghost" onClick={() => onAction('view_refund', record)}>
          View refund
          <ArrowRight className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

export function ReturnCardList({
  records,
  scope,
  onAction,
  returnBasePath,
}: {
  records: ReturnRecord[]
  scope: 'vendor' | 'admin'
  onAction: (action: ReturnAction, record: ReturnRecord) => void
  returnBasePath: string
}) {
  const navigate = useNavigate()

  return (
    <div className="space-y-3 md:hidden">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button
                  type="button"
                  className="font-mono text-sm font-semibold text-primary"
                  onClick={() => navigate(`${returnBasePath}/${record.id}`)}
                >
                  {record.returnId}
                </button>
                <p className="text-xs text-muted-foreground">
                  Order {record.orderNumber} · {record.customer.name}
                </p>
              </div>
              <ReturnStageBadge stage={record.stage} />
            </div>

            <div className="flex items-start gap-3">
              <ProductThumb
                seed={record.product.name}
                color={`hsl(${record.product.hue} 60% 55%)`}
                className="size-12 rounded-lg"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium text-foreground">{record.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {record.product.variant} · {record.product.size} · Qty {record.quantity}
                </p>
                {scope === 'admin' && (
                  <p className="text-xs text-muted-foreground">
                    {record.vendor.name} · <span className="font-mono">{record.vendor.id}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline">{returnReasonLabel(record.reason)}</Badge>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Requested</dt>
                <dd className="font-medium text-foreground">
                  <DateField value={record.requestedAt} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Eligible until</dt>
                <dd className="font-medium text-foreground">
                  <DateField value={record.eligibleUntil} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Refund amount</dt>
                <dd className="font-semibold text-primary">
                  <Amount value={record.refundAmount} />
                </dd>
              </div>
            </dl>

            <PrimaryReturnActions record={record} scope={scope} hasRefund={Boolean(record.refundId)} onAction={onAction} />

            <Button variant="ghost" size="sm" className="w-full" onClick={() => onAction('view_order', record)}>
              <ShoppingBag className="size-3.5" />
              View order
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function RefundCardList({
  records,
  scope = 'vendor',
  onAction,
  refundBasePath,
  returnBasePath,
}: {
  records: RefundRecord[]
  scope?: 'vendor' | 'admin'
  onAction: (action: RefundListAction, record: RefundRecord) => void
  refundBasePath: string
  returnBasePath: string
}) {
  const navigate = useNavigate()

  return (
    <div className="space-y-3 md:hidden">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button
                  type="button"
                  className="font-mono text-sm font-semibold text-primary"
                  onClick={() => navigate(`${refundBasePath}/${record.id}`)}
                >
                  {record.refundId}
                </button>
                <p className="text-xs text-muted-foreground">
                  Order {record.orderNumber} · Return {record.returnId}
                </p>
              </div>
              <RefundStageBadge stage={record.stage} />
            </div>

            <div className="flex items-start gap-3">
              <ProductThumb
                seed={record.productName}
                color={`hsl(${record.productHue} 60% 55%)`}
                className="size-12 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{record.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {record.customer.name} · {record.method}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Order amount</dt>
                <dd className="font-medium text-foreground">
                  <Amount value={record.originalOrderAmount} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Refund amount</dt>
                <dd className="font-semibold text-primary">
                  <Amount value={record.refundAmount} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Requested</dt>
                <dd className="font-medium text-foreground">
                  <DateField value={record.requestedAt} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Processed</dt>
                <dd className="font-medium text-foreground">
                  <DateField value={record.processedAt} />
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onAction('view_refund', record)}>
                Refund details
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`${returnBasePath}/${record.returnHandle}`)}>
                View return
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAction('view_order', record)}>
                <ShoppingBag className="size-3.5" />
                View order
              </Button>
            </div>

            {scope === 'admin' && (
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                {canProcessRefund(record.stage) && (
                  <Button size="sm" onClick={() => onAction('process_refund', record)}>
                    Process refund
                  </Button>
                )}
                {canCompleteRefund(record.stage) && (
                  <Button size="sm" onClick={() => onAction('complete_refund', record)}>
                    Mark completed
                  </Button>
                )}
                {canRejectRefund(record.stage) && (
                  <Button size="sm" variant="destructive" onClick={() => onAction('reject_refund', record)}>
                    Reject refund
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
