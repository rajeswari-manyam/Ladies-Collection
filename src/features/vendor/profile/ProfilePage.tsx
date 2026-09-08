import { useEffect, useState } from 'react'
import { Building2, FileCheck2, Landmark, Mail, Phone, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorProfile } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function VendorProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useVendorProfile()
  const [phone, setPhone] = useState('')
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone)
      setSynced(false)
    }
  }, [profile])

  const save = () => {
    toast.success('Profile updated', { description: 'Your contact details were saved for this demo.' })
    setSynced(true)
  }

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
        <>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-blush-100 text-lg text-primary">PS</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <p className="font-serif text-xl font-semibold tracking-tight">{profile.businessName}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.vendorName} · {profile.id.toUpperCase()}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {profile.rating.toFixed(1)}
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
                  <span className="font-medium">{profile.city}, {profile.state}, {profile.country}</span>
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
                <CardContent className="space-y-1.5 text-sm">
                  <p className="font-medium">{profile?.bank?.holder}</p>
                  <p>{profile?.bank?.bank} · {profile?.bank?.account}</p>
                  <p className="text-muted-foreground">IFSC {profile?.bank?.ifsc}</p>
                  <p className="border-t border-border pt-2 text-muted-foreground">
                    {profile.payoutMethod} · {profile.payoutFrequency}
                  </p>
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
                  <CardDescription>Editable for this demo session.</CardDescription>
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
      )}
    </div>
  )
}