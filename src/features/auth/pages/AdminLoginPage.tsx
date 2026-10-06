import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { ADMIN_EMAIL, useAdminStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export function AdminLoginPage() {
  const session = useAdminStore((s) => s.session)
  const login = useAdminStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (session) {
    return <Navigate to="/" replace />
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      await login(email, password)
      toast.success('Signed in', { description: 'Welcome back to the marketplace portal.' })
      navigate(from && from !== '/login' ? from : '/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <Badge variant="rose">Admin Portal</Badge>
      </div>

      <div className="w-full rounded-3xl border border-blush-200/60 bg-white/80 p-7 shadow-xl shadow-blush-100/50 backdrop-blur">
        <div className="mb-6 space-y-1.5">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Sign in to the portal</h1>
          <p className="text-sm text-muted-foreground">Manage products, orders, vendors and payouts.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder={ADMIN_EMAIL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Signing in…
              </>
            ) : (
              <>
                <LockKeyhole className="size-4" />
                Sign in
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-blush-50 px-4 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Fixed access — <span className="font-semibold text-foreground">{ADMIN_EMAIL}</span> with password{' '}
            <span className="font-semibold text-foreground">Admin@123</span>.
          </p>
        </div>
      </div>
    </div>
  )
}