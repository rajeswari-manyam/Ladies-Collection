import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(336_60%_92%),transparent),radial-gradient(900px_500px_at_90%_110%,hsl(300_55%_90%),transparent)] px-4">
      <Link
        to="/shop"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to shop
      </Link>

      <Link to="/shop" className="mb-6 font-serif text-3xl font-bold tracking-tight text-foreground">
        Ladies <span className="text-primary">Collection</span>
      </Link>

      <div className="w-full max-w-sm">
        <Outlet />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Your account is securely stored in your browser. No real payment information is ever asked.
      </p>
    </div>
  )
}