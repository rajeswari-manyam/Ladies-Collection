import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, Building2, KeyRound, Save, Webhook } from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/state'

export function SettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useSettings()

  const [form, setForm] = useState({
    marketplaceName: 'Ladies Collection',
    supportEmail: 'support@ladiescollection.demo',
    payoutFrequency: 'bi-weekly',
    defaultCommission: 12,
  })
  const [prefs, setPrefs] = useState({
    orderAlerts: true,
    payoutAlerts: true,
    inventoryAlerts: true,
    weeklyDigest: false,
    marketing: false,
  })

  useEffect(() => {
    if (settings) {
      setForm((f) => ({
        ...f,
        marketplaceName: settings.marketplaceName,
        payoutFrequency: settings.payoutFrequency,
        defaultCommission: Math.round(settings.defaultCommission * 100),
      }))
    }
  }, [settings])

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  const saveGeneral = (e: FormEvent) => {
    e.preventDefault()
    toast.success('General settings saved', { description: 'Marketplace preferences were updated (demo).' })
  }

  const savePricing = (e: FormEvent) => {
    e.preventDefault()
    toast.success('Pricing rules saved', { description: `Default commission is ${form.defaultCommission}%.` })
  }

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((p) => {
      toast.success('Preference updated', { description: `Notification setting changed to ${!p[key] ? 'on' : 'off'}.` })
      return { ...p, [key]: !p[key] }
    })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Marketplace configuration, notification preferences and developer integrations."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {isLoading || !settings ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  General
                </CardTitle>
                <CardDescription>Identity and contact details for the marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveGeneral} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="store-name">Marketplace name</Label>
                    <Input
                      id="store-name"
                      value={form.marketplaceName}
                      onChange={(e) => setForm({ ...form, marketplaceName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="support-email">Support email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={form.supportEmail}
                      onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Base currency</Label>
                    <Select defaultValue="INR">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR — ₹ (Indian Rupee)</SelectItem>
                        <SelectItem value="USD" disabled>USD — $ (disabled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payout frequency</Label>
                    <Select
                      value={form.payoutFrequency}
                      onValueChange={(v) => setForm({ ...form, payoutFrequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-end sm:col-span-2">
                    <Button type="submit" size="sm">
                      <Save className="size-4" />
                      Save general settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what you receive alerts for</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {(
                [
                  { key: 'orderAlerts', label: 'New orders', hint: 'When a customer places an order on any vendor store' },
                  { key: 'payoutAlerts', label: 'Settlement updates', hint: 'Payout processed, paid or failed' },
                  { key: 'inventoryAlerts', label: 'Low stock', hint: 'Products falling below the reorder threshold' },
                  { key: 'weeklyDigest', label: 'Weekly digest', hint: 'Summary of GMV, orders and vendor activity' },
                  { key: 'marketing', label: 'Marketing updates', hint: 'Feature announcements via email' },
                ] as const
              ).map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                  <Switch
                    checked={prefs[item.key]}
                    onCheckedChange={() => togglePref(item.key)}
                    aria-label={item.label}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="size-4 text-primary" />
                Developer access
              </CardTitle>
              <CardDescription>Webhooks and API credentials for integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <KeyRound className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Webhook secret</p>
                    <p className="font-mono text-xs text-muted-foreground">lc_wh_live_••••••••••••••</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('New secret generated', { description: 'Webhook secret was rotated (demo).' })}
                >
                  Rotate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Webhooks fire on order.created, settlement.paid, and inventory.updated events. This is a demo — no real
                endpoints are called.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading rules</CardTitle>
              <CardDescription>Defaults applied to new listings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={savePricing} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="commission">Default commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min={0}
                    max={50}
                    value={form.defaultCommission}
                    onChange={(e) => setForm({ ...form, defaultCommission: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Catalog txn fee</Label>
                  <Input value="2.5%" readOnly disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Round-off rules</Label>
                  <Select defaultValue="nearest">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nearest">Nearest whole rupee</SelectItem>
                      <SelectItem value="ceil">Ceil</SelectItem>
                      <SelectItem value="floor">Floor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" size="sm" className="w-full">
                  <Save className="size-4" />
                  Save pricing rules
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>Irreversible demo actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toast.info('Export queued', { description: 'Full marketplace backup export started (demo).' })}
              >
                Export all data
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => toast.error('Reset rejected', { description: 'Demo environment cannot be reset.' })}
              >
                Reset demo data
              </Button>
              <Separator />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Settings are persisted in local mock state only and reset on reload.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}