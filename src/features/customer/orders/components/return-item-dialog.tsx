import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImagePlus, Loader2, X } from 'lucide-react'
import type { Order } from '@/services/order.service'
import { useRequestReturn, useReturnableItems } from '@/features/customer/hooks'
import type { ReturnRequest } from '@/services/return.service'
import type { ReturnReason } from '@/types/finance.types'
import { RETURN_REASON_OPTIONS } from '@/types/finance.types'
import { Amount, DateField } from '@/components/common/finance-fields'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

/**
 * Return request dialog, covering both a single-item return and a partial
 * return across several lines of the same order.
 *
 * Eligibility, the return deadline and each line's refund amount all come from
 * the returnable-items endpoint. The refund total is never summed in the
 * browser: for a single line the backend's own figure is shown, and for several
 * lines the confirmed amount is whatever the request response returns.
 */
export function ReturnItemDialog({
  order,
  open,
  onOpenChange,
  presetItemId,
  onRequested,
}: {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Opens the dialog with this line pre-selected. */
  presetItemId?: string
  onRequested?: (record: ReturnRequest) => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [reason, setReason] = useState<ReturnReason | ''>('')
  const [comments, setComments] = useState('')
  const [images, setImages] = useState<string[]>([])
  const fileInput = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useReturnableItems(open ? order._id : undefined)
  const submit = useRequestReturn()
  /** Guards the "select everything on open" default so it never fights the user. */
  const seededFor = useRef<string | null>(null)

  const eligible = useMemo(
    () => (data?.items ?? []).filter((item) => item.eligible && item.returnableQuantity > 0),
    [data],
  )

  useEffect(() => {
    if (!open) {
      seededFor.current = null
      setSelected([])
      setReason('')
      setComments('')
      setImages([])
    }
  }, [open])

  useEffect(() => {
    if (!open || seededFor.current === order._id || eligible.length === 0) return
    seededFor.current = order._id
    const presetEligible = presetItemId && eligible.some((item) => item.itemId === presetItemId)
    setSelected(presetEligible ? [presetItemId!] : eligible.map((item) => item.itemId))
  }, [open, order._id, presetItemId, eligible])

  function toggle(itemId: string) {
    setSelected((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    )
  }

  async function attachFiles(files: FileList | null) {
    if (!files?.length) return
    const next = [...images]
    for (const file of Array.from(files).slice(0, MAX_IMAGES - images.length)) {
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB`)
        continue
      }
      next.push(await readAsDataUrl(file))
    }
    setImages(next)
  }

  const selectedItems = eligible.filter((item) => selected.includes(item.itemId))
  const singleQuote = selectedItems.length === 1 ? selectedItems[0].refundAmount : null
  const canSubmit = selectedItems.length > 0 && Boolean(reason) && !submit.isPending

  function requestReturn() {
    if (!reason) return
    submit.mutate(
      {
        orderId: order._id,
        input: {
          itemIds: selectedItems.map((item) => item.itemId),
          returnReason: reason,
          comments: comments || undefined,
          images: images.length ? images : undefined,
        },
      },
      {
        onSuccess: (record) => {
          toast.success('Return requested', {
            description:
              typeof record.refundAmount === 'number'
                ? `A refund of ₹${record.refundAmount.toLocaleString('en-IN')} is pending approval.`
                : 'We will confirm the refund amount once the return is approved.',
          })
          onOpenChange(false)
          onRequested?.(record)
        },
        onError: (error) => {
          toast.error('Could not request return', { description: error.message })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {selectedItems.length === 1 ? 'Return product' : 'Return products'}
          </DialogTitle>
          <DialogDescription>
            Order {order.orderNumber} — pick what you are sending back and tell us why.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Checking return eligibility…
          </div>
        ) : eligible.length === 0 ? (
          <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            None of the items in this order are currently eligible for return.
          </p>
        ) : (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">
                {eligible.length > 1 ? 'Select items' : 'Item'}
              </legend>
              {eligible.map((item) => {
                const checked = selected.includes(item.itemId)
                return (
                  <label
                    key={item.itemId}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-accent/40"
                  >
                    {eligible.length > 1 && (
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(item.itemId)}
                        className="mt-0.5"
                        aria-label={`Return ${item.productName}`}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {item.productName}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Quantity {checked ? item.returnableQuantity : item.quantity} ·{' '}
                        {item.vendorName ?? 'Vendor'}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Return available until <DateField value={item.returnEligibleUntil} withTime={false} />
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      <Amount value={item.refundAmount} />
                    </span>
                  </label>
                )
              })}
            </fieldset>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="return-reason">Return reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as ReturnReason)}>
                <SelectTrigger id="return-reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-comments">Comments</Label>
              <Textarea
                id="return-comments"
                rows={3}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="Anything we should know? (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-images">Upload images</Label>
              <input
                ref={fileInput}
                id="return-images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  void attachFiles(event.target.files)
                  event.target.value = ''
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInput.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                >
                  <ImagePlus className="size-3.5" />
                  {images.length ? `Add image (${images.length}/${MAX_IMAGES})` : 'Upload'}
                </Button>
                {images.map((src, index) => (
                  <span key={src.slice(-24) + index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Return evidence ${index + 1}`}
                      className="size-12 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-destructive"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <dl className="divide-y divide-border/70 rounded-2xl bg-muted/50 px-4">
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Selected items</dt>
                <dd className="font-semibold text-foreground">{selectedItems.length}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Return available until</dt>
                <dd className="font-semibold text-foreground">
                  <DateField value={selectedItems[0]?.returnEligibleUntil} />
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Refund amount</dt>
                <dd className="font-semibold text-foreground">
                  {singleQuote !== null ? (
                    <Amount value={singleQuote} />
                  ) : (
                    <span className="text-muted-foreground">Confirmed on submission</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submit.isPending}>
            Cancel
          </Button>
          <Button onClick={requestReturn} disabled={!canSubmit}>
            {submit.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Requesting…
              </>
            ) : (
              'Request return'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })
}
