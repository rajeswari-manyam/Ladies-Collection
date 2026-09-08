import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ADMIN_EMAIL, VENDOR_EMAIL } from '@/store/appStore'

const CREDENTIALS = [
  {
    role: 'Customer',
    to: '/shop/login',
    email: 'ananya@example.com',
    password: 'any 4+ characters',
  },
  {
    role: 'Vendor',
    to: '/vendor/login',
    email: VENDOR_EMAIL,
    password: 'any 6+ characters',
  },
  {
    role: 'Admin',
    to: '/login',
    email: ADMIN_EMAIL,
    password: 'any 6+ characters',
  },
]

interface PortalCredentialsProps {
  trigger?: React.ReactNode
  onNavigate?: () => void
}

export function PortalCredentials({ trigger, onNavigate }: PortalCredentialsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-white/90 hover:text-white hover:underline"
          >
            <KeyRound className="size-3" />
            Portal logins
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo login credentials</p>
        <div className="mt-3 space-y-3">
          {CREDENTIALS.map((c) => (
            <div key={c.role} className="rounded-xl bg-blush-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{c.role}</span>
                <Link to={c.to} onClick={onNavigate} className="text-xs font-semibold text-primary hover:underline">
                  Go to login
                </Link>
              </div>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{c.email}</span>
              </p>
              <p className="text-xs text-muted-foreground">Password: {c.password}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
