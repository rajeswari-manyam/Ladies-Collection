import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Order } from '@/services/order.service'
import {
  useCancelOrderWithReason,
  useCancellationPreview,
} from '@/features/customer/hooks'
import { cancellationDecision } from '@/services/finance.adapter'
import { CANCELLATION_REASON_OPTIONS, type CancellationReason } from '@/types/finance.types'
import { Amount } from '@/components/common/finance-fields'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

/**
 * Order cancellation confirmation.
 *
 * The refund amount shown is whatever the cancellation preview endpoint
 * returned. When the backend has not quoted one yet the line reads "on
 * confirmation" rather than guessing at the order total, and once the request
 * succeeds the confirmed amount comes from the response.
 */
export function CancelOrderDialog({
  order,
  open,
  onOpenChange,
  onCancelled,
}: {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancelled?: () => void
}) {
  const [reason, setReason] = useState<CancellationReason | ''>('')
  const [comments, setComments] = useState('')
  const [confirmedRefund, setConfirmedRefund] = useState<number | null>(null)

  const { data: preview } = useCancellationPreview(open ? order._id : undefined)
  const cancel = useCancelOrderWithReason()
  const decision = cancellationDecision(order, preview)
  const canConfirm = Boolean(reason) && decision.allowed && !cancel.isPending

  useEffect(() => {
    if (!open) {
      setReason('')
      setComments('')
      setConfirmedRefund(null)
    }
  }, [open])

  function confirm() {
    if (!reason) return
    cancel.mutate(
      { orderId: order._id, input: { cancellationReason: reason, comments: comments || undefined } },
      {
        onSuccess: (result) => {
          const settled = (result as { refundAmount?: number | null } | undefined)?.refundAmount ?? null
          setConfirmedRefund(settled)
          toast.success('Order cancelled', {
            description: settled
              ? `A refund of ₹${settled.toLocaleString('en-IN')} has been requested.`
              : 'The refund is being processed.',
          })
          onOpenChange(false)
          onCancelled?.()
        },
        onError: (error) => {
          toast.error('Could not cancel order', { description: error.message })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel order</DialogTitle>
          <DialogDescription>
            Order {order.orderNumber} — cancelling refunds the amount you paid for this order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Cancellation reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as CancellationReason)}>
              <SelectTrigger id="cancel-reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-comments">Additional comments</Label>
            <Textarea
              id="cancel-comments"
              rows={3}
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Tell us a little more (optional)"
            />
          </div>

          <dl className="divide-y divide-border/70 rounded-2xl bg-muted/50 px-4">
            <div className="flex items-center justify-between py-2.5 text-sm">
              <dt className="text-muted-foreground">Amount paid</dt>
              <dd className="font-semibold text-foreground">
                {decision.amountPaid !== null ? (
                  <Amount value={decision.amountPaid} />
                ) : (
                  <Amount value={order.grandTotal} />
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5 text-sm">
              <dt className="text-muted-foreground">Refund amount</dt>
              <dd className="font-semibold text-foreground">
                {decision.refundAmount !== null ? (
                  <Amount value={decision.refundAmount} />
                ) : (
                  <span className="text-muted-foreground">Calculated on confirmation</span>
                )}
              </dd>
            </div>
            {confirmedRefund !== null && (
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Confirmed refund</dt>
                <dd className="font-semibold text-foreground">
                  <Amount value={confirmedRefund} />
                </dd>
              </div>
            )}
          </dl>

          {!decision.allowed && decision.reason && (
            <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
              {decision.reason}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cancel.isPending}>
            Keep order
          </Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={!canConfirm}
            className={cancel.isPending ? undefined : ''}
          >
            {cancel.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Cancelling…
              </>
            ) : (
              'Confirm cancellation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
