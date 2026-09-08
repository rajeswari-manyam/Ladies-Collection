import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    await new Promise((r) => setTimeout(r, 800))
    setBusy(false)
    setSent(true)
    toast.success('Reset link sent', { description: 'Check your inbox for a secure reset link.' })
  }

  return (
    <Card className="rounded-3xl border-border bg-card shadow-xl shadow-rose-950/5">
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl">Reset password</CardTitle>
        <CardDescription>
          {sent
            ? 'We emailed you a secure reset link. It expires in 30 minutes.'
            : "We'll send a reset link to your registered email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-blush-50 px-4 py-4 text-center text-sm text-muted-foreground">
              <p className="font-semibold text-primary">Sent to</p>
              <p className="mt-1 break-all">{email || 'your registered email'}</p>
            </div>
            <Button asChild className="w-full">
              <Link to="/shop/login">Back to sign in</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Didn't get it?{' '}
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => setSent(false)}>
                Try another email
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              <KeyRound className="size-4" />
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
            <p className="pt-1 text-center text-sm text-muted-foreground">
              <Link to="/shop/login" className="font-medium text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}