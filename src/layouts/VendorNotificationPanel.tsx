import { Bell, BellOff, CheckCheck, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useMarkAllVendorNotificationsRead,
  useMarkVendorNotificationRead,
  useVendorNotifications,
} from '@/features/vendor/hooks'
import { timeAgo } from '@/utils'

export function VendorNotificationPanel() {
  const { data: notifications, isLoading, isError } = useVendorNotifications()
  const markRead = useMarkVendorNotificationRead()
  const markAll = useMarkAllVendorNotificationsRead()

  const items = notifications ?? []
  const unread = items.filter((n) => !n.read).length
  const isEmpty = !isLoading && !isError && items.length === 0

  const openItem = (id: string) => {
    markRead.mutate(id)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-9 text-muted-foreground hover:text-foreground" aria-label="Notifications">
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-background">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <Badge variant="rose" className="px-1.5 py-0 text-[10px]">
                {unread} new
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            disabled={unread === 0 || markAll.isPending}
            onClick={() => {
              markAll.mutate(undefined, {
                onSuccess: () => toast.success('All notifications marked as read'),
              })
            }}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>

        <ScrollArea className="h-[22rem]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center">
              <BellOff className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Could not load notifications</p>
            </div>
          ) : isEmpty ? (
            <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center">
              <Inbox className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">You are all caught up</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openItem(item.id)}
                  className={
                    item.read
                      ? 'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40'
                      : 'flex w-full items-start gap-3 bg-blush-50/60 px-4 py-3 text-left transition-colors hover:bg-blush-100/50'
                  }
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.message}</p>
                    <span className="text-[11px] text-muted-foreground/70">{timeAgo(item.createdAt)}</span>
                  </div>
                  {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-rose-500" />}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}