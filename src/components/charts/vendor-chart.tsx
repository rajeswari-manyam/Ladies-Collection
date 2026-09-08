import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { formatCurrency, formatNumber } from '@/utils'

const COLORS = ['#d33a6b', '#e0709a', '#e89bb7', '#8f5e7d', '#6f9fb0']

function VendorTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value?: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 font-semibold text-primary">{formatCurrency(payload[0].value ?? 0)}</p>
    </div>
  )
}

export function VendorChart({ data }: { data: { vendor: string; revenue: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No vendor data to show yet.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
          <XAxis type="number" hide axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="vendor"
            axisLine={false}
            tickLine={false}
            width={72}
            tick={{ fontSize: 11, fill: '#85707c' }}
          />
          <Tooltip content={<VendorTooltip />} cursor={{ fill: 'rgba(211,58,107,0.05)' }} />
          <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={16}>
            {data.map((entry, i) => (
              <Cell key={entry.vendor} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopVendorsList({ data }: { data: { vendor: string; revenue: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No vendor data to show yet.
      </p>
    )
  }

  const max = Math.max(...data.map((d) => d.revenue))
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={d.vendor} className="flex items-center gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blush-100 text-xs font-semibold text-primary">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium">{d.vendor}</p>
              <p className="shrink-0 text-sm font-semibold text-muted-foreground">
                {formatCurrency(d.revenue, true)}
              </p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-pink-300"
                style={{ width: `${(d.revenue / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted-foreground">
        {formatNumber(data.length)} leading vendors by revenue
      </p>
    </div>
  )
}