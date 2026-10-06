import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatDateFull, formatINR, isDeadlinePassed } from '@/utils'

/**
 * Summary tiles for the vendor and admin settlement dashboards.
 *
 * Every tile renders a figure the summary endpoint returned. The count under a
 * money tile is the record count the API reported alongside it — a tile whose
 * count is unknown says so rather than counting rows in the browser.
 */

export interface MoneyStat {
  label: string
  value: number
  /** Optional supporting line, e.g. "3 settlements". */
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'muted' | 'positive' | 'negative'
}

const TONE_RING: Record<NonNullable<MoneyStat['tone']>, string> = {
  default: 'bg-blush-100 text-primary',
  muted: 'bg-muted text-muted-foreground',
  positive: 'bg-emerald-500/10 text-emerald-700',
  negative: 'bg-destructive/10 text-destructive',
}

export function MoneyStatCard({ stat, index = 0 }: { stat: MoneyStat; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden p-5">
        <div className="absolute right-0 top-0 size-24 translate-x-6 -translate-y-6 rounded-full bg-blush-100/70 blur-2xl" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p
              className={cn(
                'font-serif text-[1.5rem] font-semibold leading-none tracking-tight tabular-nums sm:text-2xl',
                stat.tone === 'muted' && 'text-muted-foreground',
                stat.tone === 'negative' && 'text-destructive',
                stat.tone === 'positive' && 'text-emerald-700',
              )}
            >
              {formatINR(stat.value)}
            </p>
          </div>
          {stat.icon && (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                TONE_RING[stat.tone ?? 'default'],
              )}
            >
              {stat.icon}
            </div>
          )}
        </div>
        {stat.hint && <p className="mt-3 text-xs text-muted-foreground">{stat.hint}</p>}
      </Card>
    </motion.div>
  )
}

export function MoneyStatSkeleton() {
  return (
    <Card className="p-5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  )
}

/** Responsive tile grid: 1 column on mobile up to 4 on desktop. */
export function MoneyStatGrid({ stats }: { stats: MoneyStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {stats.map((stat, index) => (
        <MoneyStatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  )
}

/** One-line deadline reminder, phrased from the backend timestamp. */
export function DeadlineNote({
  until,
  className,
}: {
  until: string | null | undefined
  className?: string
}) {
  if (!until) return null
  const expired = isDeadlinePassed(until)
  return (
    <p
      className={cn(
        'rounded-2xl px-3 py-2 text-xs',
        expired ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {expired
        ? `Return period expired on ${formatDateFull(until)}`
        : `Return available until ${formatDateFull(until)}`}
    </p>
  )
}
