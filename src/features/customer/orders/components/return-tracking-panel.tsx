import { PackageCheck } from 'lucide-react'
import type { ReturnRequest } from '@/services/return.service'
import { returnDateStages } from '@/services/finance.adapter'
import { ReturnStatusBadge } from '@/components/common/finance-badges'
import { FinanceTimeline } from '@/components/common/finance-timeline'
import { Amount, DateField } from '@/components/common/finance-fields'
import { DeadlineNote } from '@/components/common/finance-cards'
import { Separator } from '@/components/ui/separator'

/**
 * "Return tracking": every dated stage of a return, in the order they happen.
 *
 * A stage the API has not stamped reads "Pending" — the panel never fills in a
 * date of its own, so an unfinished return is visibly unfinished.
 */
export function ReturnTrackingPanel({ record }: { record: ReturnRequest }) {
  const stages = returnDateStages(record)

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-serif text-lg font-bold text-foreground">Return tracking</p>
        <ReturnStatusBadge status={record.returnStatus} />
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delivered</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">
            <DateField value={record.deliveredAt} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Return eligible from
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">
            <DateField value={record.returnEligibleFrom} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Return eligible until
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">
            <DateField value={record.returnEligibleUntil} />
          </dd>
        </div>
      </dl>

      {record.refundAmount !== null && (
        <p className="mt-4 flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Refund amount</span>
          <span className="font-semibold text-foreground">
            <Amount value={record.refundAmount} />
          </span>
        </p>
      )}

      <DeadlineNote until={record.returnEligibleUntil} className="mt-3" />

      <Separator className="my-5" />

      <FinanceTimeline steps={stages} emptyLabel="No return activity recorded yet." />
    </section>
  )
}

/** Shown on the order screen when a return exists but nothing has moved yet. */
export function ReturnAwaitingPanel() {
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
      <PackageCheck className="size-4" /> No return has been raised for this order.
    </p>
  )
}
