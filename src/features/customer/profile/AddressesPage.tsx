import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Home, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { addresses, addAddress, removeAddress, setDefaultAddress } from '@/features/customer/data/account'
import { useAuthStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils'

export function AddressesPage() {
  const session = useAuthStore((s) => s.session)
  const profileName = session?.profile.name ?? 'Ananya Reddy'
  const list = useMemo(() => addresses, [])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [label, setLabel] = useState('Home')
  const [name, setName] = useState(() => session?.profile.name ?? '')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [isDefault, setIsDefault] = useState(list.length === 0)

  if (!session) return <Navigate to="/shop/login?redirect=/shop/addresses" replace />

  const existing = editingId ? list.find((a) => a.id === editingId) : undefined

  function openNew() {
    setEditingId(null)
    setLabel('Home')
    setLine1('')
    setLine2('')
    setCity('')
    setPincode('')
    setIsDefault(false)
    setOpen(true)
  }

  function openEdit(id: string) {
    const a = list.find((x) => x.id === id)
    if (!a) return
    setEditingId(id)
    setLabel(a.label)
    setLine1(a.line1)
    setLine2(a.line2 ?? '')
    setCity(a.city)
    setPincode(a.pincode)
    setIsDefault(a.isDefault)
    setOpen(true)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (line1.trim() === '' || city.trim() === '' || pincode.trim() === '') {
      toast.error('Fill the required address fields')
      return
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error('Pincode must be 6 digits')
      return
    }
    if (editingId) {
      const a = list.find((x) => x.id === editingId)
      if (a) {
        Object.assign(a, { label: label.trim() || 'Home', line1: line1.trim(), line2: line2.trim(), city: city.trim(), pincode: pincode.trim(), isDefault })
      }
      if (isDefault) setDefaultAddress(editingId)
      toast.success('Address updated')
    } else {
      const id = addAddress({
        label: label.trim() || 'Home',
        name: profileName,
        line1: line1.trim(),
        line2: line2.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        isDefault,
      })
      if (isDefault) setDefaultAddress(id)
      toast.success('Address added')
    }
    setOpen(false)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Saved addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Used for delivery and checkout.</p>
        </div>
        <Button className="rounded-full" onClick={openNew}>
          <Plus className="size-4" /> Add address
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className={cn('rounded-3xl border-2 p-5', a.isDefault ? 'border-primary bg-blush-50' : 'border-border bg-card')}>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                {a.label === 'Office' ? <MapPin className="size-4.5" /> : <Home className="size-4.5" />}
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{a.label}</p>
                <p className="text-[11px] text-muted-foreground">{a.name}</p>
              </div>
              {a.isDefault && <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">DEFAULT</span>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city} — {a.pincode}
            </p>
            <p className="mt-2 text-xs font-medium text-foreground">{a.phone}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {!a.isDefault && (
                <button
                  onClick={() => { setDefaultAddress(a.id); toast.success(`${a.label} set as default`) }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Set as default
                </button>
              )}
              <div className="ml-auto flex gap-1.5">
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => openEdit(a.id)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={() => { removeAddress(a.id); toast.success('Address removed') }}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={openNew}
          className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Plus className="size-6" />
          <span className="text-sm font-semibold">Add new address</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-foreground">{existing ? 'Edit address' : 'Add address'}</h2>
              <Button type="button" size="icon" variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="a-label">Label</Label>
                <select id="a-label" value={label} onChange={(e) => setLabel(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option>Home</option>
                  <option>Work</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-name">Full name</Label>
                <Input id="a-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="a-line1">Address (line 1)</Label>
                <Input id="a-line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Flat / street / area" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="a-line2">Address (line 2, optional)</Label>
                <Input id="a-line2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Landmark / building" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-city">City</Label>
                <Input id="a-city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-pin">Pincode</Label>
                <Input id="a-pin" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 sm:col-span-2">
                <span className="text-sm font-semibold text-foreground">Set as default address</span>
                <Switch checked={isDefault} onCheckedChange={setIsDefault} />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" className="flex-1 rounded-2xl">{existing ? 'Save changes' : 'Add address'}</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}