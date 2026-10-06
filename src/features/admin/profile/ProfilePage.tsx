import { useState } from 'react'
import { Mail, ShieldCheck, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminStore } from '@/store/appStore'
import { PageHeader } from '@/layouts/PageHeader'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/utils/formatDate'

export function AdminProfilePage() {
  const session = useAdminStore((s) => s.session)
  const updateProfile = useAdminStore((s) => s.updateProfile)
  const profile = session?.profile
  const [name, setName] = useState(profile?.name ?? '')
  const [synced, setSynced] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!profile) return null

  const save = async () => {
    setSaving(true)
    try {
      await updateProfile({ name: name.trim() })
      toast.success('Profile updated')
      setSynced(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Profile update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your admin identity and access on Ladies Collection."
        actions={<Badge variant="rose">{profile.role}</Badge>}
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="size-16">
              <AvatarFallback className="bg-gradient-to-br from-amber-300 to-rose-400 text-lg font-bold text-white">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <p className="font-serif text-xl font-semibold tracking-tight">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
                <ShieldCheck className="size-3.5 text-primary" />
                Signed in {formatDateTime(session.signedInAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5" />
              {profile.email}
            </span>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserCog className="size-4 text-muted-foreground" />
              Display name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Name</Label>
              <Input id="admin-name" value={name} onChange={(e) => { setName(e.target.value); setSynced(false) }} />
            </div>
            <Button size="sm" onClick={save} disabled={synced || saving}>
              {saving ? 'Saving…' : synced ? 'Saved ✓' : 'Save changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}