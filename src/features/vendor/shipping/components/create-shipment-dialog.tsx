import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateShipment } from '@/features/vendor/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateShipmentDialogProps {
  /** Fixed when opened from an order page; otherwise an order is chosen here. */
  orderId?: string
  /** Orders available to book against, used when no orderId is fixed. */
  orders?: { id: string; label: string }[]
  /** Defaults to the signed-in vendor; overridable for multi-vendor orders. */
  vendorId?: string
  open: boolean
  onClose: () => void
}

const PAYMENT_METHODS = [
  { value: 'ONLINE', label: 'Online (prepaid)' },
  { value: 'COD', label: 'Cash on delivery' },
]

/** Creates a courier booking for one vendor's items on an order. */
export function CreateShipmentDialog({ orderId, orders = [], vendorId, open, onClose }: CreateShipmentDialogProps) {
  const createShipment = useCreateShipment()
  const [selectedOrder, setSelectedOrder] = useState('')
  const [form, setForm] = useState({ weight: '0.5', length: '30', width: '20', height: '10', paymentMethod: 'ONLINE' })

  if (!open) return null

  const targetOrderId = orderId ?? selectedOrder
  const needsOrderChoice = !orderId

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!targetOrderId) {
      toast.error('Choose an order to ship')
      return
    }
    if (!vendorId) {
      toast.error('Could not determine which vendor is shipping this order')
      return
    }
    const weight = Number(form.weight)
    const length = Number(form.length)
    const width = Number(form.width)
    const height = Number(form.height)
    if (![weight, length, width, height].every((n) => Number.isFinite(n) && n > 0)) {
      toast.error('Weight and dimensions must be positive numbers')
      return
    }
    createShipment.mutate(
      { orderId: targetOrderId, vendorId, weight, length, width, height, paymentMethod: form.paymentMethod },
      {
        onSuccess: (res) => {
          const created = res.data.filter((d) => !d.skipped)
          if (created.length === 0) {
            // Every vendor was skipped — relay the courier's own reason.
            const reason = res.data.find((d) => d.reason)?.reason
            toast.error(reason ?? 'No shipment was created')
            return
          }
          const awbs = created.map((d) => d.shipment?.awbNumber ?? d.courier?.awbNumber ?? d.awbNumber).filter(Boolean)
          const skipped = res.data.filter((d) => d.skipped)
          toast.success(
            `Shipment created via ${res.provider} (${res.mode}) — status Pending` +
              (awbs.length ? ` · AWB ${awbs.join(', ')}` : '') +
              (skipped.length ? ` · ${skipped.length} vendor(s) skipped` : ''),
          )
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
            <PackagePlus className="size-4 text-primary" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Create shipment</h2>
            <p className="text-xs text-muted-foreground">Book this parcel with the courier.</p>
          </div>
        </div>

        <p className="mt-3 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          A new booking starts as <span className="font-semibold text-foreground">Shipment: Pending</span>. Ask the courier
          for a pickup next, then advance the status as the parcel moves.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {needsOrderChoice && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-order">Order</Label>
              <select
                id="s-order"
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select an order…</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="s-weight">Weight (kg)</Label>
            <Input id="s-weight" type="number" step="0.01" min="0" value={form.weight} onChange={set('weight')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-method">Payment method</Label>
            <select
              id="s-method"
              value={form.paymentMethod}
              onChange={set('paymentMethod')}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-length">Length (cm)</Label>
            <Input id="s-length" type="number" min="1" value={form.length} onChange={set('length')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-width">Width (cm)</Label>
            <Input id="s-width" type="number" min="1" value={form.width} onChange={set('width')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="s-height">Height (cm)</Label>
            <Input id="s-height" type="number" min="1" value={form.height} onChange={set('height')} />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="submit" className="flex-1 rounded-2xl" disabled={createShipment.isPending}>
            {createShipment.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Creating…
              </>
            ) : (
              'Create shipment'
            )}
          </Button>
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onClose} disabled={createShipment.isPending}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
