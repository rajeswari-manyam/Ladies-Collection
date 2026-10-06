import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress, useUpdateAddress } from '@/features/customer/hooks'
import { useAuthStore } from '@/store/appStore'
import { toStoreAddress, type AddressType } from '@/services/address.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils'

const TYPE_OPTIONS: { value: AddressType; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
]

export function AddressesPage() {
  const session = useAuthStore((s) => s.session)
  const navigate = useNavigate()
  const { data: apiAddresses, isLoading } = useAddresses()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const removeAddress = useDeleteAddress()
  const setDefault = useSetDefaultAddress()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [state, setState] = useState<{
    addressType: AddressType
    fullName: string
    mobile: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    landmark: string
    isDefault: boolean
  } | null>(null)

  if (!session) return <Navigate to="/shop/login?redirect=/shop/addresses" replace />

  const list = (apiAddresses ?? []).map(toStoreAddress)
  const existing = editingId ? list.find((a) => a.id === editingId) : undefined
  const busy = createAddress.isPending || updateAddress.isPending || removeAddress.isPending || setDefault.isPending

  const openNew = () => {
    setEditingId(null)
    setState({
      addressType: 'home',
      fullName: session.profile.name ?? '',
      mobile: session.profile.mobile ?? '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      isDefault: list.length === 0,
    })
    setOpen(true)
  }

  const openEdit = (id: string) => {
    const a = apiAddresses?.find((x) => x._id === id)
    if (!a) return
    setEditingId(id)
    setState({
      addressType: a.addressType ?? 'other',
      fullName: a.fullName,
      mobile: a.mobile,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? '',
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      landmark: a.landmark ?? '',
      isDefault: Boolean(a.isDefault),
    })
    setOpen(true)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!state) return
    const input = {
      fullName: state.fullName.trim(),
      mobile: state.mobile.trim(),
      addressLine1: state.addressLine1.trim(),
      addressLine2: state.addressLine2.trim(),
      city: state.city.trim(),
      state: state.state.trim(),
      country: 'India',
      pincode: state.pincode.trim(),
      landmark: state.landmark.trim(),
      addressType: state.addressType,
      isDefault: state.isDefault,
    }
    if (!input.fullName || !input.mobile || !input.addressLine1 || !input.city || !input.state || !input.pincode) {
      toast.error('Fill all required address fields')
      return
    }
    if (!/^\d{10}$/.test(input.mobile)) {
      toast.error('Mobile number must be 10 digits')
      return
    }
    if (!/^\d{6}$/.test(input.pincode)) {
      toast.error('Pincode must be 6 digits')
      return
    }
    if (editingId) {
      updateAddress.mutate(
        { id: editingId, patch: input },
        {
          onSuccess: () => {
            toast.success('Address updated')
            setOpen(false)
          },
          onError: (err) => toast.error(err.message),
        },
      )
    } else {
      createAddress.mutate(input, {
        onSuccess: () => {
          toast.success('Address added')
          setOpen(false)
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-2 text-muted-foreground"
        aria-label="Go back"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/shop'))}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

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
        {isLoading && !apiAddresses ? (
          <p className="py-16 text-center text-sm text-muted-foreground sm:col-span-2">Loading your addresses…</p>
        ) : list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground sm:col-span-2">
            No saved addresses yet. Add one to speed up checkout.
          </p>
        ) : (
          list.map((a) => (
            <div key={a.id} className={cn('rounded-3xl border-2 p-5', a.isDefault ? 'border-primary bg-blush-50' : 'border-border bg-card')}>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  {a.label === 'Work' ? <MapPin className="size-4.5" /> : <Home className="size-4.5" />}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.name}</p>
                </div>
                {a.isDefault && <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">DEFAULT</span>}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} — {a.pincode}
              </p>
              <p className="mt-2 text-xs font-medium text-foreground">{a.phone}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!a.isDefault && (
                  <button
                    onClick={() =>
                      setDefault.mutate(a.id, {
                        onSuccess: () => toast.success(`${a.label} set as default`),
                        onError: (err) => toast.error(err.message),
                      })
                    }
                    disabled={busy}
                    className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    Set as default
                  </button>
                )}
                <div className="ml-auto flex gap-1.5">
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => openEdit(a.id)}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:text-destructive"
                    disabled={removeAddress.isPending}
                    onClick={() =>
                      removeAddress.mutate(a.id, {
                        onSuccess: () => toast.success('Address removed'),
                        onError: (err) => toast.error(err.message),
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}

        <button
          onClick={openNew}
          className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Plus className="size-6" />
          <span className="text-sm font-semibold">Add new address</span>
        </button>
      </div>

      {open && state && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="-ml-2 rounded-full"
                aria-label="Back to saved addresses"
                onClick={() => setOpen(false)}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <h2 className="font-serif text-lg font-bold text-foreground">{existing ? 'Edit address' : 'Add address'}</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="a-label">Label</Label>
                <select
                  id="a-label"
                  value={state.addressType}
                  onChange={(e) => setState({ ...state, addressType: e.target.value as AddressType })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-name">Full name</Label>
                <Input id="a-name" value={state.fullName} onChange={(e) => setState({ ...state, fullName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-mobile">Mobile number</Label>
                <Input
                  id="a-mobile"
                  inputMode="numeric"
                  maxLength={10}
                  value={state.mobile}
                  onChange={(e) => setState({ ...state, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-line1">Address (line 1)</Label>
                <Input id="a-line1" value={state.addressLine1} onChange={(e) => setState({ ...state, addressLine1: e.target.value })} placeholder="Flat / street / area" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-line2">Address (line 2, optional)</Label>
                <Input id="a-line2" value={state.addressLine2} onChange={(e) => setState({ ...state, addressLine2: e.target.value })} placeholder="Landmark / building" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-city">City</Label>
                <Input id="a-city" value={state.city} onChange={(e) => setState({ ...state, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-state">State</Label>
                <Input id="a-state" value={state.state} onChange={(e) => setState({ ...state, state: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-landmark">Landmark (optional)</Label>
                <Input id="a-landmark" value={state.landmark} onChange={(e) => setState({ ...state, landmark: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-pin">Pincode</Label>
                <Input id="a-pin" inputMode="numeric" maxLength={6} value={state.pincode} onChange={(e) => setState({ ...state, pincode: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 sm:col-span-2">
                <span className="text-sm font-semibold text-foreground">Set as default address</span>
                <Switch checked={state.isDefault} onCheckedChange={(v) => setState({ ...state, isDefault: v })} />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" className="flex-1 rounded-2xl" disabled={busy}>
                  {busy ? 'Saving…' : existing ? 'Save changes' : 'Add address'}
                </Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}