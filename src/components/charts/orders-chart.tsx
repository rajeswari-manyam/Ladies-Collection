import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/utils'

const COLORS = ['#d33a6b', '#e0709a', '#e89bb7', '#f0a5c0', '#8f5e7d', '#6f9fb0']

interface OrdersChartProps {
  data: { label: string; orders: number }[]
}

function OrdersTooltip({
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
      <p className="mt-0.5 font-semibold text-primary">{formatNumber(payload[0].value ?? 0)} orders</p>
    </div>
  )
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0e3e9" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85707c' }} dy={6} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#85707c' }}
            tickFormatter={(v: number) => formatNumber(v)}
            width={40}
          />
          <Tooltip content={<OrdersTooltip />} cursor={{ fill: 'rgba(211,58,107,0.05)' }} />
          <Bar dataKey="orders" name="Orders" radius={[6, 6, 0, 0]} barSize={22}>
            {data.map((entry, i) => (
              <Cell key={`${entry.label}-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}