import { CalendarRange, Search, X } from 'lucide-react'
import { RETURN_REASON_OPTIONS } from '@/types/finance.types'
import type { RefundFilters, ReturnFilters } from '@/features/returns/filters'
import type { VendorParty } from '@/features/returns/types'
import { REFUND_METHOD_OPTIONS, REFUND_STAGE_FILTERS, RETURN_STAGE_FILTERS } from '@/features/returns/workflow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/**
 * Filter bars for the return and refund lists.
 *
 * Laid out as a labelled grid rather than a single row so it wraps cleanly from
 * desktop down to a phone, where every control stacks full width.
 */

interface FieldProps {
  label: string
  htmlFor: string
  children: React.ReactNode
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

function VendorSelect({
  id,
  value,
  onChange,
  vendors,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  vendors: VendorParty[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="All vendors" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All vendors</SelectItem>
        {vendors.map((vendor) => (
          <SelectItem key={vendor.id} value={vendor.id}>
            {vendor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  )
}

export function ReturnFilterBar({
  filters,
  onChange,
  onReset,
  vendors,
  showVendor = false,
  resultCount,
}: {
  filters: ReturnFilters
  onChange: (filters: ReturnFilters) => void
  onReset: () => void
  /** Vendor options. Only rendered when `showVendor` is set. */
  vendors?: VendorParty[]
  showVendor?: boolean
  resultCount: number
}) {
  const patch = (part: Partial<ReturnFilters>) => onChange({ ...filters, ...part })

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_rgba(61,25,42,0.04)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Search" htmlFor="return-search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="return-search"
              value={filters.search}
              onChange={(event) => patch({ search: event.target.value })}
              placeholder="Return, order, customer or product…"
              className="pl-9"
            />
          </div>
        </Field>

        <Field label="Return status" htmlFor="return-stage">
          <Select value={filters.stage} onValueChange={(value) => patch({ stage: value })}>
            <SelectTrigger id="return-stage" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {RETURN_STAGE_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Return reason" htmlFor="return-reason">
          <Select value={filters.reason} onValueChange={(value) => patch({ reason: value })}>
            <SelectTrigger id="return-reason" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reasons</SelectItem>
              {RETURN_REASON_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {showVendor && vendors && (
          <Field label="Vendor" htmlFor="return-vendor">
            <VendorSelect
              id="return-vendor"
              value={filters.vendor}
              onChange={(value) => patch({ vendor: value })}
              vendors={vendors}
            />
          </Field>
        )}

        <DateField
          id="return-from"
          label="Requested from"
          value={filters.from}
          onChange={(value) => patch({ from: value })}
        />
        <DateField id="return-to" label="Requested to" value={filters.to} onChange={(value) => patch({ to: value })} />

        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            <X className="size-4" />
            Reset
          </Button>
          <p className="whitespace-nowrap text-xs text-muted-foreground">
            {resultCount} match{resultCount === 1 ? '' : 'es'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function RefundFilterBar({
  filters,
  onChange,
  onReset,
  vendors,
  showVendor = false,
  resultCount,
}: {
  filters: RefundFilters
  onChange: (filters: RefundFilters) => void
  onReset: () => void
  vendors?: VendorParty[]
  showVendor?: boolean
  resultCount: number
}) {
  const patch = (part: Partial<RefundFilters>) => onChange({ ...filters, ...part })

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_rgba(61,25,42,0.04)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Search" htmlFor="refund-search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="refund-search"
              value={filters.search}
              onChange={(event) => patch({ search: event.target.value })}
              placeholder="Refund, return, order or customer…"
              className="pl-9"
            />
          </div>
        </Field>

        <Field label="Refund status" htmlFor="refund-stage">
          <Select value={filters.stage} onValueChange={(value) => patch({ stage: value })}>
            <SelectTrigger id="refund-stage" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {REFUND_STAGE_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Payment method" htmlFor="refund-method">
          <Select value={filters.method} onValueChange={(value) => patch({ method: value })}>
            <SelectTrigger id="refund-method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {REFUND_METHOD_OPTIONS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {showVendor && vendors && (
          <Field label="Vendor" htmlFor="refund-vendor">
            <VendorSelect
              id="refund-vendor"
              value={filters.vendor}
              onChange={(value) => patch({ vendor: value })}
              vendors={vendors}
            />
          </Field>
        )}

        <DateField
          id="refund-from"
          label="Requested from"
          value={filters.from}
          onChange={(value) => patch({ from: value })}
        />
        <DateField
          id="refund-to"
          label="Requested to"
          value={filters.to}
          onChange={(value) => patch({ to: value })}
        />

        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            <X className="size-4" />
            Reset
          </Button>
          <p className="whitespace-nowrap text-xs text-muted-foreground">
            {resultCount} match{resultCount === 1 ? '' : 'es'}
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarRange className="size-3.5" />
        Date filters apply to the day the refund was requested.
      </p>
    </div>
  )
}
