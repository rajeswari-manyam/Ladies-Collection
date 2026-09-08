import { motion } from 'motion/react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, formatNumber } from '@/utils'

export interface StatCardData {
  label: string
  value: number
  delta: number
  format?: 'currency' | 'number'
  hint?: string
}

export function StatCard({ data, index = 0, icon }: { data: StatCardData; index?: number; icon?: React.ReactNode }) {
  const up = data.delta >= 0
  const formatted =
    data.format === 'currency' ? formatCurrency(data.value, true) : formatNumber(data.value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden p-5">
        <div className="absolute right-0 top-0 size-24 translate-x-6 -translate-y-6 rounded-full bg-blush-100/70 blur-2xl" />
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{data.label}</p>
            <p className="font-serif text-[1.65rem] font-semibold leading-none tracking-tight sm:text-2xl">
              {formatted}
            </p>
          </div>
          {icon && (
            <div className="flex size-10 items-center justify-center rounded-xl bg-blush-100 text-primary">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
              up ? 'bg-emerald-500/10 text-emerald-700' : 'bg-destructive/10 text-destructive',
            )}
          >
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(data.delta)}%
          </span>
          <span className="text-xs text-muted-foreground">{data.hint ?? 'vs last month'}</span>
        </div>
      </Card>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>
    </Card>
  )
}