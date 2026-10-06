import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LogOut, MapPin, Mail, Pencil, Phone, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAddresses } from '@/features/customer/hooks'
import { useAuthStore } from '@/store/appStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function ProfilePage() {
  const session = useAuthStore((s) => s.session)
  const setProfile = useAuthStore((s) => s.setProfile)
  const logout = useAuthStore((s) => s.logout)
  const { data: apiAddresses, isLoading: addressesLoading } = useAddresses()

  const [name, setName] = useState(session?.profile.name ?? '')
  const [mobile, setMobile] = useState(session?.profile.mobile ?? '')
  const [city, setCity] = useState(session?.profile.city ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!session) return <Navigate to="/shop/login?redirect=/shop/profile" replace />

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!mobile.trim().replace(/\D/g, '')) {
      toast.error('Mobile number is required')
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setProfile({ name: name.trim(), mobile: mobile.trim(), city: city.trim() })
    setSaving(false)
    setEditing(false)
    toast.success('Profile updated')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">My profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>

      <div className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 text-lg">
            <AvatarFallback className="rounded-2xl">{session.profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-bold text-foreground">{editing ? name || session.profile.name : session.profile.name}</p>
            <p className="text-xs text-muted-foreground">Member since {new Date(session.profile.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} · Verified account</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setEditing((v) => !v)}
            >
              <Pencil className="size-3.5" /> {editing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => {
                logout()
                toast.success('Signed out')
              }}
            >
              <LogOut className="size-3.5" /> Sign out
            </Button>
          </div>
        </div>

        <Separator className="my-5" />

        {editing ? (
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Full name</Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-mobile">Mobile</Label>
              <Input id="p-mobile" inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-city">City</Label>
              <Input id="p-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Bengaluru" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-full" disabled={saving}>
                <Save className="size-4" /> {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="ml-auto text-sm font-semibold text-foreground">{session.profile.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Mobile</span>
              <span className="ml-auto text-sm font-semibold text-foreground">{session.profile.mobile}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">City</span>
              <span className="ml-auto text-sm font-semibold text-foreground">{session.profile.city || '—'}</span>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Saved addresses</p>
          <p className="text-xs text-muted-foreground">
            {addressesLoading ? 'Loading…' : `${apiAddresses?.length ?? 0} address${apiAddresses?.length === 1 ? '' : 'es'} available for faster checkout`}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link to="/shop/addresses">Manage</Link>
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">Demo account · data stays in your browser</p>
    </div>
  )
}