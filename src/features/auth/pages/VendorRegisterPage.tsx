import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function VendorRegisterPage() {
  const register = useVendorStore((s) => s.register)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await register(name, email, mobile, password)
      toast.success('Store created', { description: 'Welcome to the vendor portal!' })
      navigate('/vendor', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-center gap-2 font-serif text-2xl font-bold tracking-tight text-foreground">
        <Store className="size-6 text-primary" />
        Fashion <span className="text-primary">Trends</span>
      </div>

      <Card className="rounded-3xl border-border bg-card shadow-xl shadow-rose-950/5">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Register your store</CardTitle>
          <CardDescription>Create a vendor account to sell on Ladies Collection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ganesh" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile number</Label>
              <Input id="mobile" type="tel" inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>

            {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={busy}>
              <UserPlus className="size-4" />
              {busy ? 'Creating…' : 'Create store'}
            </Button>

            <p className="pt-1 text-center text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/vendor/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}