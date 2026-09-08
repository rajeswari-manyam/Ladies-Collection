import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { BellRing, CheckCheck } from 'lucide-react'
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, EmptyState } from '@/components/common/state'
import { NotificationTypeBadge } from '@/components/common/status-badge'
import { timeAgo } from '@/utils'
import type { NotificationType } from '@/features/admin/types'

const typeFilter: (NotificationType | 'all')[] = ['all', 'order', 'payout', 'customer', 'vendor', 'inventory', 'system']

export function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const [type, setType] = useState<(typeof typeFilter)[number]>('all')
  const markAll = useMarkAllNotificationsRead()
  const markRead = useMarkNotificationRead()

  const rows = useMemo(() => {
    let list = data ?? []
    if (type !== 'all') list = list.filter((n) => n.type === type)
    return list
  }, [data, type])

  const unread = data?.filter((n) => !n.read).length ?? 0

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
        eyebrow="Activity"
        title="Notifications"
        description="Order events, payouts, vendor updates and system alerts."
        actions={
          <Button variant="outline" size="sm" disabled={unread === 0} onClick={() => markAll.mutate()}>
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-3">
        <Tabs value={type} onValueChange={(v) => setType(v as (typeof typeFilter)[number])}>
          <TabsList className="h-auto flex-wrap rounded-2xl p-1.5">
            {typeFilter.map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">
                {t === 'all' ? 'All' : t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Badge variant="rose" className="hidden sm:inline-flex">
          <BellRing className="size-3" />
          {unread} unread
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState title="No notifications" description="You are all caught up for this filter." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((n, i) => (
            <motion.button
              key={n.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => {
                if (!n.read) {
                  markRead.mutate(n.id)
                }
              }}
              className={`block w-full rounded-2xl border border-border bg-card p-4 text-left transition-all hover:shadow-md ${
                n.read ? 'opacity-75' : 'border-primary/25 bg-blush-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    n.read ? 'bg-muted text-muted-foreground' : 'bg-blush-100 text-primary'
                  }`}
                >
                  <BellRing className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    <NotificationTypeBadge type={n.type} />
                    {!n.read && <span className="size-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}