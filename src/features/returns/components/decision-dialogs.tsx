import { useState } from 'react'
import { Banknote, CheckCircle2, ClipboardCheck, Truck, XCircle } from 'lucide-react'
import type { QualityCheckResult, ReturnRecord } from '@/features/returns/types'
import type { PickupDetails } from '@/features/returns/store'
import {
  PACKAGING_CONDITION_OPTIONS,
  QUALITY_CONDITION_OPTIONS,
  RETURN_REJECTION_REASONS,
} from '@/features/returns/workflow'
import { Amount } from '@/components/common/finance-fields'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

/**
 * Decision dialogs for the return workflow.
 *
 * Each dialog renders its form only while open, so the fields always start from
 * the current record instead of whatever was typed last time. Nothing here talks
 * to an API: confirming only writes local state, with copy that matches what the
 * endpoint will do once it is wired up.
 */

function tomorrowIso(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function ApproveReturnDialog({
  open,
  onOpenChange,
  record,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: ReturnRecord | null
  onConfirm: (notes: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && record ? <ApproveReturnBody record={record} onConfirm={onConfirm} onOpenChange={onOpenChange} /> : null}
    </Dialog>
  )
}

function ApproveReturnBody({
  record,
  onConfirm,
  onOpenChange,
}: {
  record: ReturnRecord
  onConfirm: (notes: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [notes, setNotes] = useState('')

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Approve this return request?</DialogTitle>
        <DialogDescription>
          {record.returnId} · Order {record.orderNumber} · {record.customer.name}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Product</span>
          <span className="font-medium text-foreground">{record.product.name}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Refund on approval</span>
          <span className="font-semibold text-primary">
            <Amount value={record.refundAmount} />
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="approve-notes">Notes (optional)</Label>
        <Textarea
          id="approve-notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Anything the pickup team should know…"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(notes)
            onOpenChange(false)
          }}
        >
          <CheckCircle2 className="size-4" />
          Confirm approval
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function RejectReturnDialog({
  open,
  onOpenChange,
  record,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: ReturnRecord | null
  onConfirm: (reason: string, notes: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && record ? <RejectReturnBody record={record} onConfirm={onConfirm} onOpenChange={onOpenChange} /> : null}
    </Dialog>
  )
}

function RejectReturnBody({
  record,
  onConfirm,
  onOpenChange,
}: {
  record: ReturnRecord
  onConfirm: (reason: string, notes: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [reason, setReason] = useState<string>(RETURN_REJECTION_REASONS[0])
  const [notes, setNotes] = useState('')

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reject this return?</DialogTitle>
        <DialogDescription>
          {record.returnId} · {record.customer.name} will see the reason on their return.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="reject-reason">Rejection reason</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger id="reject-reason" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RETURN_REJECTION_REASONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reject-notes">Notes</Label>
        <Textarea
          id="reject-notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add context for the customer or the support team…"
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

export function SchedulePickupDialog({
  open,
  onOpenChange,
  record,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: ReturnRecord | null
  onConfirm: (pickup: PickupDetails) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && record ? <SchedulePickupBody record={record} onConfirm={onConfirm} onOpenChange={onOpenChange} /> : null}
    </Dialog>
  )
}

function SchedulePickupBody({
  record,
  onConfirm,
  onOpenChange,
}: {
  record: ReturnRecord
  onConfirm: (pickup: PickupDetails) => void
  onOpenChange: (open: boolean) => void
}) {
  const [scheduledFor, setScheduledFor] = useState(tomorrowIso)
  const [courier, setCourier] = useState('Delhivery Surface')
  const [waybill, setWaybill] = useState('')

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Schedule return pickup</DialogTitle>
        <DialogDescription>
          {record.returnId} · {record.customer.name} · {record.customer.phone}
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">{record.product.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {record.quantity} × {record.product.variant} · {record.product.size}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickup-date">Pickup date</Label>
        <Input id="pickup-date" type="date" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickup-courier">Courier</Label>
        <Select value={courier} onValueChange={setCourier}>
          <SelectTrigger id="pickup-courier" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Delhivery Surface', 'Blue Dart', 'Ecom Express', 'DTDC', 'India Post'].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickup-waybill">Waybill number</Label>
        <Input
          id="pickup-waybill"
          value={waybill}
          onChange={(event) => setWaybill(event.target.value)}
          placeholder="Assigned when the booking is confirmed"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm({ scheduledFor, courier, waybill: waybill.trim() || 'Pending assignment' })
            onOpenChange(false)
          }}
        >
          <Truck className="size-4" />
          Schedule pickup
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

/** One-line confirmation for the reversible steps in the flow. */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  tone = 'default',
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  tone?: 'default' | 'destructive'
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const QUALITY_OUTCOMES = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
] as const

/**
 * The quality check form. Sits inline on the return detail screen and is reused
 * inside a dialog when it is started from a row.
 */
export function QualityCheckPanel({
  record,
  onSubmit,
  onApproveRefund,
  onRejectRefund,
  compact = false,
}: {
  record: ReturnRecord
  onSubmit: (result: QualityCheckResult) => void
  onApproveRefund?: () => void
  onRejectRefund?: () => void
  compact?: boolean
}) {
  const saved = record.qualityCheck
  const [productCondition, setProductCondition] = useState(saved?.productCondition ?? QUALITY_CONDITION_OPTIONS[0])
  const [packagingCondition, setPackagingCondition] = useState(
    saved?.packagingCondition ?? PACKAGING_CONDITION_OPTIONS[0],
  )
  const [tagsAvailable, setTagsAvailable] = useState(saved?.tagsAvailable ?? true)
  const [productUsed, setProductUsed] = useState(saved?.productUsed ?? false)
  const [productDamaged, setProductDamaged] = useState(saved?.productDamaged ?? false)
  const [matchesOrder, setMatchesOrder] = useState(saved?.matchesOrder ?? true)
  const [notes, setNotes] = useState(saved?.notes ?? '')
  const [outcome, setOutcome] = useState<'passed' | 'failed'>(saved?.outcome ?? 'passed')
  const [failureReason, setFailureReason] = useState(saved?.failureReason ?? '')

  const canSubmit = outcome === 'passed' || failureReason.trim().length > 0

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="qc-product">Product condition</Label>
          <Select value={productCondition} onValueChange={setProductCondition}>
            <SelectTrigger id="qc-product" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qc-packaging">Packaging condition</Label>
          <Select value={packagingCondition} onValueChange={setPackagingCondition}>
            <SelectTrigger id="qc-packaging" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACKAGING_CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Inspection</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { label: 'Tags available', checked: tagsAvailable, onChange: setTagsAvailable },
            { label: 'Product matches order', checked: matchesOrder, onChange: setMatchesOrder },
            { label: 'Product used?', checked: productUsed, onChange: setProductUsed },
            { label: 'Product damaged?', checked: productDamaged, onChange: setProductDamaged },
          ].map((item) => (
            <label
              key={item.label}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-accent/40"
            >
              <Checkbox checked={item.checked} onCheckedChange={(value) => item.onChange(value === true)} />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="qc-notes">Additional notes</Label>
        <Textarea
          id="qc-notes"
          rows={compact ? 2 : 3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Stitching, fabric, accessories and anything else worth recording…"
        />
      </div>

      <Separator />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Quality check result</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {QUALITY_OUTCOMES.map((option) => (
            <label
              key={option.value}
              className={
                outcome === option.value
                  ? 'flex cursor-pointer items-center gap-2.5 rounded-xl border border-primary bg-blush-100/50 px-3 py-2.5 text-sm font-medium text-primary'
                  : 'flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-accent/40'
              }
            >
              <input
                type="radio"
                name="quality-outcome"
                className="accent-primary"
                checked={outcome === option.value}
                onChange={() => setOutcome(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {outcome === 'failed' && (
        <div className="space-y-2 rounded-2xl bg-destructive/10 px-4 py-3">
          <Label htmlFor="qc-failure" className="text-destructive">
            Reason for quality check failure
          </Label>
          <Textarea
            id="qc-failure"
            rows={2}
            value={failureReason}
            onChange={(event) => setFailureReason(event.target.value)}
            placeholder="What did the inspection find?"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() =>
            onSubmit({
              productCondition,
              packagingCondition,
              tagsAvailable,
              productUsed,
              productDamaged,
              matchesOrder,
              notes,
              outcome,
              failureReason,
              checkedAt: new Date().toISOString(),
              checkedBy: 'Vendor review desk',
            })
          }
          disabled={!canSubmit}
        >
          <ClipboardCheck className="size-4" />
          Save quality check
        </Button>
        {saved && (
          <Badge variant={saved.outcome === 'passed' ? 'success' : 'destructive'} className="px-2.5 py-1">
            {saved.outcome === 'passed' ? 'Passed' : 'Failed'} · {saved.checkedBy}
          </Badge>
        )}
      </div>

      {saved && (onApproveRefund || onRejectRefund) && (
        <div className="space-y-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {saved.outcome === 'passed'
              ? 'Quality check passed — decide the refund.'
              : 'Quality check failed — decide the refund.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {onApproveRefund && (
              <Button size="sm" onClick={onApproveRefund}>
                <Banknote className="size-3.5" />
                Approve refund
              </Button>
            )}
            {onRejectRefund && (
              <Button size="sm" variant="destructive" onClick={onRejectRefund}>
                <XCircle className="size-3.5" />
                Reject refund
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function QualityCheckDialog({
  open,
  onOpenChange,
  record,
  onSubmit,
  onApproveRefund,
  onRejectRefund,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: ReturnRecord | null
  onSubmit: (result: QualityCheckResult) => void
  onApproveRefund?: () => void
  onRejectRefund?: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && record ? (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quality check</DialogTitle>
            <DialogDescription>
              {record.returnId} · {record.product.name} · {record.quantity} item(s)
            </DialogDescription>
          </DialogHeader>

          <QualityCheckPanel
            record={record}
            compact
            onSubmit={(result) => {
              onSubmit(result)
              onOpenChange(false)
            }}
            onApproveRefund={onApproveRefund}
            onRejectRefund={onRejectRefund}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}