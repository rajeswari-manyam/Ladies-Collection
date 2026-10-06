import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Store, User, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, useVendorStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils'

const ROLES = [
  { id: 'customer', label: 'Customer', hint: 'Shop and order products', icon: User },
  { id: 'vendor', label: 'Vendor', hint: 'Sell your products here', icon: Store },
] as const

export function RegisterPage() {
  const register = useAuthStore((s) => s.register)
  const registerVendor = useVendorStore((s) => s.register)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState<'customer' | 'vendor'>('customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirect = params.get('redirect') ?? '/shop'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (role === 'vendor') {
        await registerVendor(name, email, mobile, password)
        toast.success('Store created', { description: 'Welcome to the vendor portal!' })
        navigate('/vendor', { replace: true })
        return
      }
      await register(name, email, mobile, password)
      toast.success('Account created', { description: 'Welcome to Ladies Collection!' })
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="rounded-3xl border-border bg-card shadow-xl shadow-rose-950/5">
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl">Create account</CardTitle>
        <CardDescription>Join for wishlists, faster checkout and festive offers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Register as</Label>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map(({ id, label, hint, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  aria-pressed={role === id}
                  className={cn(
                    'flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition-colors',
                    role === id ? 'border-primary bg-blush-50' : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', role === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Reddy" />
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
            {busy ? 'Creating…' : role === 'vendor' ? 'Create store' : 'Create account'}
          </Button>

          <p className="pt-1 text-center text-sm text-muted-foreground">
            Already a member?{' '}
            {role === 'vendor' ? (
              <Link to="/vendor/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            ) : (
              <Link to={`/shop/login${redirect !== '/shop' ? `?redirect=${redirect}` : ''}`} className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}