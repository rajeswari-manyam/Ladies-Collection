import { Check, Circle, CircleDot, Loader2, Undo2, XCircle } from 'lucide-react'
import { cn } from '@/utils'
import type { StatusStep } from '@/components/common/workflow-status'

interface StatusTimelineProps {
  steps: StatusStep[]
  /** Index of the step in progress; `-1` means the flow has not started or has stopped. */
  currentIndex: number
  /** Replaces the current marker, e.g. when tracking is actively loading. */
  loading?: boolean
  /** Optional note under each step, e.g. a courier event timestamp. */
  stepMeta?: Record<string, string | undefined>
  /** Terminal outcome, shown instead of carrying on to the last step. */
  terminal?: { label: string; description?: string } | null
  className?: string
}

function Marker({
  state,
  loading,
  terminal,
}: {
  state: 'done' | 'current' | 'pending'
  loading?: boolean
  terminal?: boolean
}) {
  if (terminal) {
    return (
      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground">
        {state === 'done' ? <Undo2 className="size-3.5" /> : <XCircle className="size-3.5" />}
      </span>
    )
  }
  if (state === 'done') {
    return (
      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-emerald-50">
        <Check className="size-3.5" />
      </span>
    )
  }
  if (state === 'current') {
    return (
      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card">
        {loading ? (
          <Loader2 className="size-3.5 animate-spin text-primary" />
        ) : (
          <CircleDot className="size-3.5 text-primary" />
        )}
      </span>
    )
  }
  return (
    <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card">
      <Circle className="size-2 fill-muted-foreground/30 text-muted-foreground" />
    </span>
  )
}

/**
 * Vertical stepper for an order or shipment lifecycle. Completed steps are
 * filled, the current step is ringed and labelled, and the rest stay muted.
 * A terminal outcome (cancelled, returned, failed) replaces the happy path so
 * the timeline never implies a parcel is still moving.
 */
export function StatusTimeline({
  steps,
  currentIndex,
  loading,
  stepMeta,
  terminal,
  className,
}: StatusTimelineProps) {
  const isTerminal = Boolean(terminal)
  const effectiveIndex = isTerminal ? -1 : currentIndex

  return (
    <ol className={cn('relative space-y-6', className)}>
      {steps.map((step, i) => {
        const state: 'done' | 'current' | 'pending' =
          effectiveIndex < 0 ? 'pending' : i < effectiveIndex ? 'done' : i === effectiveIndex ? 'current' : 'pending'
        const meta = stepMeta?.[step.key]

        return (
          <li key={step.key} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[13px] top-8 h-[calc(100%+0.25rem)] w-0.5 rounded',
                  state === 'done' ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            )}
            <Marker state={state} loading={loading && state === 'current'} />
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  'flex flex-wrap items-center gap-2 text-sm font-semibold',
                  state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {step.label}
                {state === 'current' && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Current
                  </span>
                )}
              </p>
              {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
            </div>
          </li>
        )
      })}

      {terminal && (
        <li className="relative flex gap-4">
          <Marker state="done" terminal />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-destructive">
              {terminal.label}
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive">
                Final
              </span>
            </p>
            {terminal.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{terminal.description}</p>
            )}
          </div>
        </li>
      )}
    </ol>
  )
}

/** Compact horizontal variant for dense rows such as the order list. */
export function StatusProgressBar({
  steps,
  currentIndex,
  className,
}: Pick<StatusTimelineProps, 'steps' | 'currentIndex' | 'className'>) {
  return (
    <ol className={cn('flex items-center gap-1.5', className)}>
      {steps.map((step, i) => {
        const done = i <= currentIndex
        return (
          <li key={step.key} className="flex flex-1 flex-col gap-1">
            <span
              className={cn(
                'h-1 rounded-full transition-colors',
                done ? 'bg-emerald-500' : 'bg-border',
                i === currentIndex && 'ring-2 ring-emerald-500/30',
              )}
            />
            <span
              className={cn(
                'truncate text-[10px] font-semibold',
                i === currentIndex ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
