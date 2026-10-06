import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateShipmentStatus } from '@/features/vendor/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { shipmentStatusLabel, type ShipmentStatus } from '@/services/shipment.service'

/** Statuses the courier API accepts for a shipment. */
const STATUS_OPTIONS: ShipmentStatus[] = [
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'returned',
  'failed',
]

interface ShipmentStatusDialogProps {
  shipmentId: string
  currentStatus: string
  open: boolean
  onClose: () => void
  /** Admin uses its own token, so the mutation is injected rather than assumed. */
  onSubmit?: (input: { shipmentStatus: ShipmentStatus; location?: string; description?: string }) => Promise<unknown>
}

/** Advances a shipment's status and appends a courier tracking event. */
export function ShipmentStatusDialog({ shipmentId, currentStatus, open, onClose, onSubmit }: ShipmentStatusDialogProps) {
  const vendorMutation = useUpdateShipmentStatus()
  // Mounted fresh per shipment, so seeding from props in the initial state is
  // enough — no effect needed to reset between opens.
  const [status, setStatus] = useState<ShipmentStatus>(
    () => (STATUS_OPTIONS.find((s) => s === currentStatus) ?? 'pending') as ShipmentStatus,
  )
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  if (!open) return null

  const pending = vendorMutation.isPending

  function submit(e: FormEvent) {
    e.preventDefault()
    const input = { shipmentStatus: status, location: location.trim() || undefined, description: description.trim() || undefined }
    const done = { onSuccess: () => { toast.success(`Marked as ${shipmentStatusLabel(status)}`); onClose() }, onError: (err: Error) => toast.error(err.message) }
    if (onSubmit) {
      void onSubmit(input).then(() => { toast.success(`Marked as ${shipmentStatusLabel(status)}`); onClose() }).catch((err: Error) => toast.error(err.message))
      return
    }
    vendorMutation.mutate({ id: shipmentId, status, location: input.location, description: input.description }, done)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Truck className="size-4 text-primary" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Update shipment status</h2>
            <p className="text-xs text-muted-foreground">Adds an event to the courier tracking history.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="st-status">Status</Label>
            <select
              id="st-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{shipmentStatusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-location">Location (optional)</Label>
            <Input id="st-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Delhi Hub" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-desc">Description (optional)</Label>
            <Input id="st-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Departed from hub" />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="submit" className="flex-1 rounded-2xl" disabled={pending}>
            {pending ? <><Loader2 className="size-4 animate-spin" /> Updating…</> : 'Update status'}
          </Button>
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onClose} disabled={pending}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
