import { Navigate, Link } from 'react-router-dom'
import { Bell, CheckCheck, ChevronRight, MapPin, PackageCheck, Percent } from 'lucide-react'
import { useState } from 'react'
import { markAllNotificationsRead, markNotificationRead, notifications, unreadNotificationCount } from '@/features/customer/data/account'
import { useAuthStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatDateTime } from '@/utils'

const ROUTE_BY_TYPE = {
  order: '/shop/orders/mine',
  promo: '/shop/collections',
  account: '/shop/profile',
  offer: '/shop/collections',
} as const

export function StoreNotificationsPage() {
  const session = useAuthStore((s) => s.session)
  const [view, setView] = useState<'all' | 'unread'>('all')

  if (!session) return <Navigate to="/shop/login?redirect=/shop/notifications" replace />

  const list = notifications.filter((n) => (view === 'unread' ? !n.read : true))
  const unread = unreadNotificationCount()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread} unread · {session.profile.email}</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={markAllNotificationsRead} disabled={unread === 0}>
          <CheckCheck className="size-3.5" /> Mark all read
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'all' | 'unread')} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
          <Bell className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-serif text-lg font-semibold text-foreground">You're all caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">New order and offer updates will show up here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((n) => {
            const Icon = n.type === 'order' ? PackageCheck : n.type === 'promo' ? Percent : n.type === 'account' ? Bell : MapPin
            return (
              <Link
                key={n.id}
                to={ROUTE_BY_TYPE[n.type]}
                onClick={() => markNotificationRead(n.id)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40',
                  n.read ? 'border-border' : 'border-primary/60 bg-blush-50',
                )}
              >
                <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl', n.read ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground')}>
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className={cn('text-sm font-semibold', n.read ? 'text-foreground/80' : 'text-foreground')}>{n.title}</span>
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">{n.message}</span>
                  <span className="mt-1 block text-[11px] font-medium text-muted-foreground/80">{formatDateTime(n.createdAt)}</span>
                </span>
                <ChevronRight className="mt-1.5 size-4 shrink-0 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}