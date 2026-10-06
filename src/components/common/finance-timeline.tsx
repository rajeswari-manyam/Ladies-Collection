import { Check, Circle, CircleDot, XCircle } from 'lucide-react'
import { cn, formatDateTime } from '@/utils'
import type { FinanceTimelineStep, FinanceTimelineTone } from '@/types/finance.types'

/** Text shown under a stage that has not happened yet. Never a made-up date. */
const PENDING_LABEL = 'Pending'

function Marker({ tone }: { tone: FinanceTimelineTone }) {
  if (tone === 'done') {
    return (
      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-emerald-50">
        <Check className="size-3.5" />
      </span>
    )
  }
  if (tone === 'failed') {
    return (
      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground">
        <XCircle className="size-3.5" />
      </span>
    )
  }
  if (tone === 'current') {
    return (
      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card">
        <CircleDot className="size-3.5 text-primary" />
      </span>
    )
  }
  return (
    <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card">
      <Circle className="size-2 fill-muted-foreground/30 text-muted-foreground" />
    </span>
  )
}

const connectorTone: Record<FinanceTimelineTone, string> = {
  done: 'bg-emerald-500',
  failed: 'bg-destructive',
  current: 'bg-border',
  upcoming: 'bg-border',
}

const titleTone: Record<FinanceTimelineTone, string> = {
  done: 'text-foreground',
  failed: 'text-destructive',
  current: 'text-foreground',
  upcoming: 'text-muted-foreground',
}

/**
 * The one timeline used by every role: the customer's refund progress, the
 * admin's end-to-end audit trail and the vendor's payout path.
 *
 * A stage is only drawn as complete when the API supplied its timestamp, so a
 * future event can never read as done. Callers decide which stages to include
 * (see `finance.adapter.ts`); a stage with no timestamp reads "Pending".
 */
export function FinanceTimeline({
  steps,
  className,
  emptyLabel = 'No activity recorded yet.',
}: {
  steps: FinanceTimelineStep[]
  className?: string
  emptyLabel?: string
}) {
  if (steps.length === 0) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{emptyLabel}</p>
  }

  return (
    <ol className={cn('relative space-y-6', className)}>
      {steps.map((step, index) => (
        <li key={step.key} className="relative flex gap-4">
          {index < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                'absolute left-[13px] top-8 h-[calc(100%+0.25rem)] w-0.5 rounded',
                connectorTone[step.tone],
              )}
            />
          )}
          <Marker tone={step.tone} />
          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className={cn(
                'flex flex-wrap items-center gap-2 text-sm font-semibold',
                titleTone[step.tone],
              )}
            >
              {step.label}
              {step.tone === 'current' && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  Current
                </span>
              )}
              {step.tone === 'failed' && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive">
                  Failed
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step.at ? formatDateTime(step.at) : PENDING_LABEL}
            </p>
            {step.note && (
              <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">{step.note}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
