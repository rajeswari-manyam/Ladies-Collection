import { useState } from 'react'
import { Banknote, CheckCircle2, XCircle } from 'lucide-react'
import type { RefundRecord } from '@/features/returns/types'
import { REFUND_REJECTION_REASONS } from '@/features/returns/workflow'
import { Amount } from '@/components/common/finance-fields'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

/** Admin refund dialogs: push to the gateway, settle it, or decline it. */

function RefundSummary({ refund }: { refund: RefundRecord }) {
  return (
    <div className="space-y-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Refund ID</span>
        <span className="font-mono text-xs font-medium text-foreground">{refund.refundId}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Order</span>
        <span className="font-mono text-xs font-medium text-foreground">{refund.orderNumber}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Refund amount</span>
        <span className="font-semibold text-primary">
          <Amount value={refund.refundAmount} />
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Method</span>
        <span className="font-medium text-foreground">{refund.method}</span>
      </div>
    </div>
  )
}

export function ProcessRefundDialog({
  open,
  onOpenChange,
  refund,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  refund: RefundRecord | null
  onConfirm: (amount: number, notes: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && refund ? <ProcessRefundBody refund={refund} onConfirm={onConfirm} onOpenChange={onOpenChange} /> : null}
    </Dialog>
  )
}

function ProcessRefundBody({
  refund,
  onConfirm,
  onOpenChange,
}: {
  refund: RefundRecord
  onConfirm: (amount: number, notes: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [amount, setAmount] = useState(String(refund.refundAmount))
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const parsed = Number(amount)
  const valid = Number.isFinite(parsed) && parsed > 0 && parsed <= refund.refundAmount

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Process this refund</DialogTitle>
        <DialogDescription>
          Push {refund.refundId} to the payment gateway and mark it as processing.
        </DialogDescription>
      </DialogHeader>

      <RefundSummary refund={refund} />

      <div className="space-y-2">
        <Label htmlFor="refund-amount">Amount to send</Label>
        <Input
          id="refund-amount"
          type="number"
          min={1}
          max={refund.refundAmount}
          step={1}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        {parsed > refund.refundAmount && (
          <p className="text-xs text-destructive">
            Cannot exceed the approved amount of <Amount value={refund.refundAmount} />.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="refund-process-notes">Processing notes</Label>
        <Textarea
          id="refund-process-notes"
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Gateway batch, reference, or a reason for a partial refund…"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm">
        <Checkbox checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} className="mt-0.5" />
        <span className="text-muted-foreground">
          I confirm this refund has been submitted to the gateway for{' '}
          <span className="font-medium text-foreground">{refund.customer.name}</span>.
        </span>
      </label>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          disabled={!valid || !confirmed}
          onClick={() => {
            onConfirm(parsed, notes)
            onOpenChange(false)
          }}
        >
          <Banknote className="size-4" />
          Process refund
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function CompleteRefundDialog({
  open,
  onOpenChange,
  refund,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  refund: RefundRecord | null
  onConfirm: (reference: string, notes: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && refund ? <CompleteRefundBody refund={refund} onConfirm={onConfirm} onOpenChange={onOpenChange} /> : null}
    </Dialog>
  )
}

function CompleteRefundBody({
  refund,
  onConfirm,
  onOpenChange,
}: {
  refund: RefundRecord
  onConfirm: (reference: string, notes: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [reference, setReference] = useState(refund.transactionReference ?? `TXN${refund.orderNumber.slice(-8)}`)
  const [notes, setNotes] = useState('')

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Mark refund as completed</DialogTitle>
        <DialogDescription>Record the settlement confirmation for {refund.refundId}.</DialogDescription>
      </DialogHeader>

      <RefundSummary refund={refund} />

      <div className="space-y-2">
        <Label htmlFor="refund-reference">Gateway transaction reference</Label>
        <Input
          id="refund-reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="TXN00000000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="refund-complete-notes">Notes</Label>
        <Textarea
          id="refund-complete-notes"
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Anything finance should know about this settlement…"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          disabled={reference.trim().length === 0}
          onClick={() => {
            onConfirm(reference.trim(), notes)
            onOpenChange(false)
          }}
        >
          <CheckCircle2 className="size-4" />
          Mark completed
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function RejectRefundDialog({
  open,
  onOpenChange,
  refund,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  refund: RefundRecord | null
  onConfirm: (reason: string, notes: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && refund ? <RejectRefundBody refund={refund} onConfirm={onConfirm} onOpenChange={onOpenChange} /> : null}
    </Dialog>
  )
}

function RejectRefundBody({
  refund,
  onConfirm,
  onOpenChange,
}: {
  refund: RefundRecord
  onConfirm: (reason: string, notes: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState<string>(REFUND_REJECTION_REASONS[0])
  const [notes, setNotes] = useState('')

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reject this refund?</DialogTitle>
        <DialogDescription>
          {refund.refundId} · {refund.customer.name} · <Amount value={refund.refundAmount} />
        </DialogDescription>
      </DialogHeader>

      <RefundSummary refund={refund} />

      <div className="space-y-2">
        <Label htmlFor="refund-reject-reason">Rejection reason</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger id="refund-reject-reason" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REFUND_REJECTION_REASONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="refund-reject-notes">Notes</Label>
        <Textarea
          id="refund-reject-notes"
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Explain the decision for the vendor and the customer…"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            onConfirm(reason, notes)
            onOpenChange(false)
          }}
        >
          <XCircle className="size-4" />
          Confirm rejection
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}