import type { ReactNode } from 'react'
import { cn, formatDateFull, formatDateTimeFull, formatINR } from '@/utils'

/**
 * Label/value primitives shared by the payment, refund and settlement screens.
 *
 * `Amount` refuses to render a number the API did not send, and `DateField`
 * renders a missing timestamp as an em dash rather than a fabricated date.
 */

export function FieldRow({
  label,
  value,
  className,
  valueClassName,
}: {
  label: ReactNode
  value: ReactNode
  className?: string
  valueClassName?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-1.5', className)}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn('text-right text-sm font-medium text-foreground', valueClassName)}>{value}</dd>
    </div>
  )
}

/** A backend amount. `null` renders as an em dash, never as zero. */
export function Amount({
  value,
  className,
  signed = false,
  fallback = '—',
}: {
  value: number | null | undefined
  className?: string
  /** Renders a negative amount with an explicit sign. */
  signed?: boolean
  fallback?: string
}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return <span className={cn('text-muted-foreground', className)}>{fallback}</span>
  }
  const prefix = signed && value > 0 ? '+' : ''
  return (
    <span className={cn('tabular-nums', value < 0 && 'text-rose-600', className)}>
      {prefix}
      {formatINR(value)}
    </span>
  )
}

/** A backend timestamp. `null` renders as an em dash, never as today's date. */
export function DateField({
  value,
  withTime = false,
  className,
  fallback = '—',
}: {
  value: string | null | undefined
  withTime?: boolean
  className?: string
  fallback?: string
}) {
  const text = withTime ? formatDateTimeFull(value, '') : formatDateFull(value, '')
  if (!text) return <span className={cn('text-muted-foreground', className)}>{fallback}</span>
  return <span className={cn('tabular-nums', className)}>{text}</span>
}

export function FieldList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('divide-y divide-border/70', className)}>{children}</dl>
}

export function TextField({
  value,
  className,
  fallback = '—',
}: {
  value: string | null | undefined
  className?: string
  fallback?: string
}) {
  if (!value) return <span className={cn('text-muted-foreground', className)}>{fallback}</span>
  return <span className={cn('break-words', className)}>{value}</span>
}

/** Identifiers and transaction references read better in the mono face. */
export function MonoField({
  value,
  className,
  fallback = '—',
}: {
  value: string | null | undefined
  className?: string
  fallback?: string
}) {
  if (!value) return <span className={cn('text-muted-foreground', className)}>{fallback}</span>
  return <span className={cn('font-mono text-xs', className)}>{value}</span>
}

/**
 * A two-column key/value block. Used for the Order / Payment / Refund sections
 * on the detail screens so every screen lines up the same way.
 */
export function DetailGrid({
  items,
  columns = 2,
  className,
}: {
  items: { label: string; value: ReactNode }[]
  columns?: 1 | 2 | 3
  className?: string
}) {
  return (
    <dl
      className={cn(
        'grid gap-x-8 gap-y-3',
        columns === 1 ? 'grid-cols-1' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
