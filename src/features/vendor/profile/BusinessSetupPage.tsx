import { useState } from 'react'
import type { FormEvent } from 'react'
import { Store, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useSaveVendorProfile } from '@/features/vendor/hooks'
import { useVendorStore } from '@/store/appStore'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function VendorBusinessSetupPage() {
  const saveProfile = useSaveVendorProfile()
  const profile = useVendorStore((s) => s.session?.profile)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    businessName: '',
    ownerName: profile?.name ?? '',
    email: profile?.email ?? '',
    mobile: '',
    gstNumber: '',
    panNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.businessName.trim() || !form.ownerName.trim() || !form.email.trim() || !form.city.trim()) {
      setError('Business name, owner name, email and city are required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await saveProfile.mutateAsync({
        businessName: form.businessName.trim(),
        ownerName: form.ownerName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        gstNumber: form.gstNumber.trim(),
        panNumber: form.panNumber.trim(),
        businessAddress: {
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim() || 'India',
          pincode: form.pincode.trim(),
        },
      })
      toast.success('Business registered', { description: 'Your seller profile was created and is pending verification.' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the business details')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Seller onboarding"
        title="Business setup"
        description="Register your business details with the marketplace. Your profile is reviewed before going live."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Store className="size-4 text-primary" />
            Business details
          </CardTitle>
          <CardDescription>Same details appear on your storefront and payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name">Business name</Label>
                <Input id="biz-name" value={form.businessName} onChange={set('businessName')} placeholder="Saree House" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner-name">Owner name</Label>
                <Input id="owner-name" value={form.ownerName} onChange={set('ownerName')} placeholder="Ganesh" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-email">Email</Label>
                <Input id="biz-email" type="email" value={form.email} onChange={set('email')} placeholder="you@business.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-mobile">Mobile</Label>
                <Input id="biz-mobile" type="tel" value={form.mobile} onChange={set('mobile')} placeholder="98765 43210" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gst">GST number</Label>
                <Input id="gst" value={form.gstNumber} onChange={set('gstNumber')} placeholder="27ABCDE1234F1Z5" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pan">PAN number</Label>
                <Input id="pan" value={form.panNumber} onChange={set('panNumber')} placeholder="ABCDE1234F" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="addr-1">Address line 1</Label>
                <Input id="addr-1" value={form.addressLine1} onChange={set('addressLine1')} placeholder="Shop 12, MG Road" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-2">Address line 2</Label>
                <Input id="addr-2" value={form.addressLine2} onChange={set('addressLine2')} placeholder="Sector 5" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={set('city')} placeholder="Mumbai" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={set('state')} placeholder="Maharashtra" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={set('country')} placeholder="India" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={form.pincode} onChange={set('pincode')} placeholder="400001" />
              </div>
            </div>

            {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={busy}>
                <UserPlus className="size-4" />
                {busy ? 'Registering…' : 'Register business'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}