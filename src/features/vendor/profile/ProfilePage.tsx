import { useState } from 'react'
import { Building2, FileCheck2, Landmark, Mail, Phone, Star } from 'lucide-react'
import { toast } from 'sonner'
import {
  useVendorProfile,
  useUpdateVendorBankDetails,
  useUpdateVendorProfile,
} from '@/features/vendor/hooks'
import type { VendorProfile } from '@/features/vendor/data/vendor-portal'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ProfileEditor({
  profile,
  onRefetch,
}: {
  profile: VendorProfile
  onRefetch: () => void
}) {
  const updateProfile = useUpdateVendorProfile()
  const updateBank = useUpdateVendorBankDetails()

  const [phone, setPhone] = useState(profile.phone)
  const [bank, setBank] = useState({
    holder: profile.bank?.holder ?? '',
    account: profile.bank?.account ?? '',
    ifsc: profile.bank?.ifsc ?? '',
    bank: profile.bank?.bank ?? '',
  })
  const [synced, setSynced] = useState(false)
  const [bankSynced, setBankSynced] = useState(false)

  const save = () => {
    updateProfile.mutate(
      { mobile: phone.trim() },
      {
        onSuccess: () => {
          toast.success('Profile updated', { description: 'Your contact details were saved.' })
          setSynced(true)
          onRefetch()
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not save your details'),
      },
    )
  }

  const saveBank = () => {
    updateBank.mutate(
      {
        accountHolderName: bank.holder.trim(),
        accountNumber: bank.account.trim(),
        ifscCode: bank.ifsc.trim(),
        bankName: bank.bank.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Payout account updated', { description: 'Your bank details were saved.' })
          setBankSynced(true)
          onRefetch()
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not save bank details'),
      },
    )
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="size-16">
              <AvatarFallback className="bg-blush-100 text-lg text-primary">
                {profile.businessName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <p className="font-serif text-xl font-semibold tracking-tight">{profile.businessName}</p>
              <p className="text-sm text-muted-foreground">
                {profile.vendorName} · {profile.id.toUpperCase()}
              </p>
              <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 text-sm">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {profile.rating > 0 ? profile.rating.toFixed(1) : 'New'}
                </span>
                <span className="text-xs text-muted-foreground">({profile.reviews} reviews)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline">{profile.category}</Badge>
            <Badge variant="outline">{profile.state}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-muted-foreground" />
              Business details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Business</span>
              <span className="font-medium">{profile.businessName}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Seller</span>
              <span className="font-medium">{profile.vendorName}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">{profile.joined}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{profile.category}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">
                {profile.city}, {profile.state}, {profile.country}
              </span>
            </p>
            <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              <FileCheck2 className="size-3.5" />
              GSTIN {profile.gstin}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Landmark className="size-4 text-muted-foreground" />
                Payout account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="bank-holder" className="text-xs">Account holder</Label>
                <Input id="bank-holder" value={bank.holder} onChange={(e) => setBank((b) => ({ ...b, holder: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-name" className="text-xs">Bank name</Label>
                <Input id="bank-name" value={bank.bank} onChange={(e) => setBank((b) => ({ ...b, bank: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-account" className="text-xs">Account number</Label>
                <Input id="bank-account" value={bank.account} onChange={(e) => setBank((b) => ({ ...b, account: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-ifsc" className="text-xs">IFSC</Label>
                <Input id="bank-ifsc" value={bank.ifsc} onChange={(e) => setBank((b) => ({ ...b, ifsc: e.target.value }))} />
              </div>
              <Button size="sm" className="w-full" onClick={saveBank} disabled={bankSynced}>
                {bankSynced ? 'Saved ✓' : 'Update payout account'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-2 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5" />
                {profile.email}
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5" />
                {profile.phone}
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Contact preferences</CardTitle>
              <CardDescription>Your seller contact saved to the marketplace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button size="sm" className="w-full" onClick={save} disabled={synced}>
                {synced ? 'Saved ✓' : 'Save changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export function VendorProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useVendorProfile()

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your seller identity, business details and payout account on Ladies Collection."
        actions={
          <Badge variant={profile?.status === 'active' ? 'rose' : 'outline'}>
            {profile ? `${profile.status === 'active' ? 'Active seller' : profile.status}` : '…'}
          </Badge>
        }
      />

      {isLoading || !profile ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      ) : (
        <ProfileEditor key={profile.id} profile={profile} onRefetch={refetch} />
      )}
    </div>
  )
}