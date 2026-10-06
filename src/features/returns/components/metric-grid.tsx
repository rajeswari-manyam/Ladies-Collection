import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { cn, formatCurrency, formatNumber } from '@/utils'

/**
 * Summary tiles for the return and refund list headers.
 *
 * Mirrors the settlement tiles (motion, blurred corner, rounded icon chip) so the
 * new screens sit alongside the existing ones, but carries a count or an amount
 * rather than a month-on-month delta.
 */

export type MetricTone = 'primary' | 'info' | 'positive' | 'warning' | 'negative' | 'muted'

export interface Metric {
  key: string
  label: string
  /** A count, or an amount in rupees when `kind` is `currency`. */
  value: number
  kind?: 'count' | 'currency'
  hint?: string
  icon?: ReactNode
  tone?: MetricTone
}

const TONE_CHIP: Record<MetricTone, string> = {
  primary: 'bg-blush-100 text-primary',
  info: 'bg-sky-500/10 text-sky-700',
  positive: 'bg-emerald-500/10 text-emerald-700',
  warning: 'bg-amber-500/10 text-amber-700',
  negative: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
}

const TONE_TEXT: Record<MetricTone, string> = {
  primary: 'text-foreground',
  info: 'text-foreground',
  positive: 'text-emerald-700',
  warning: 'text-amber-700',
  negative: 'text-destructive',
  muted: 'text-muted-foreground',
}

export function MetricCard({ metric, index = 0 }: { metric: Metric; index?: number }) {
  const tone = metric.tone ?? 'primary'
  const isCurrency = metric.kind === 'currency'

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
            <p className="truncate text-sm text-muted-foreground">{metric.label}</p>
            <p
              className={cn(
                'font-serif text-[1.5rem] font-semibold leading-none tracking-tight tabular-nums sm:text-2xl',
                TONE_TEXT[tone],
              )}
            >
              {isCurrency ? formatCurrency(metric.value) : formatNumber(metric.value)}
            </p>
          </div>
          {metric.icon && (
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', TONE_CHIP[tone])}>
              {metric.icon}
            </div>
          )}
        </div>
        {metric.hint && <p className="mt-3 text-xs text-muted-foreground">{metric.hint}</p>}
      </Card>
    </motion.div>
  )
}

/** Responsive tile grid: 2 columns on mobile up to 4 on desktop. */
export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={metric.key} metric={metric} index={index} />
      ))}
    </div>
  )
}
