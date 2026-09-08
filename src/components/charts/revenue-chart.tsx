import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/utils'

interface RevenueChartProps {
  data: { month: string; revenue: number; orders: number }[]
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value?: number; payload?: { orders?: number } }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 font-semibold text-primary">{formatCurrency(payload[0].value ?? 0)}</p>
      <p className="text-muted-foreground">{payload[0].payload?.orders} orders</p>
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d33a6b" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#d33a6b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0e3e9" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85707c' }} dy={6} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#85707c' }}
            tickFormatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`}
            width={56}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#d33a6b', strokeOpacity: 0.25 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#d33a6b"
            strokeWidth={2.5}
            fill="url(#revenueFill)"
            dot={false}
            activeDot={{ r: 5, fill: '#d33a6b', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}