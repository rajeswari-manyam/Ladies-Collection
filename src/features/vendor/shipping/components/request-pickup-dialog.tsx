import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarClock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRequestPickup } from '@/features/vendor/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RequestPickupDialogProps {
  shipmentId: string
  /** Computed by the caller in a click handler — `Date.now()` is not pure. */
  defaultPickupDate: string
  open: boolean
  onClose: () => void
}

/** Schedules a courier pickup for a shipment. */
export function RequestPickupDialog({ shipmentId, defaultPickupDate, open, onClose }: RequestPickupDialogProps) {
  const requestPickup = useRequestPickup()
  const [pickupDate, setPickupDate] = useState(defaultPickupDate)
  const [remarks, setRemarks] = useState('')

  if (!open) return null

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!pickupDate) {
      toast.error('Choose a pickup date')
      return
    }
    requestPickup.mutate(
      { shipmentId, pickupDate, remarks: remarks.trim() || undefined },
      {
        onSuccess: (res) => {
          const ref = res.courier.pickupRequestId
          toast.success(ref ? `Pickup scheduled — ${ref}` : 'Pickup scheduled with courier')
          onClose()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <CalendarClock className="size-4 text-primary" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Request pickup</h2>
            <p className="text-xs text-muted-foreground">Ask the courier to collect this parcel.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-date">Pickup date</Label>
            <Input id="p-date" type="date" value={pickupDate} min={defaultPickupDate} onChange={(e) => setPickupDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-remarks">Remarks (optional)</Label>
            <Input id="p-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Pickup from vendor" />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="submit" className="flex-1 rounded-2xl" disabled={requestPickup.isPending}>
            {requestPickup.isPending ? <><Loader2 className="size-4 animate-spin" /> Requesting…</> : 'Request pickup'}
          </Button>
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onClose} disabled={requestPickup.isPending}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
