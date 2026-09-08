import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/utils'

interface SalesChartProps {
  data: { label: string; disbursed: number; fees: number }[]
}

function SalesTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value?: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-0.5 text-muted-foreground">
          {p.name}: <span className="font-semibold text-foreground">{formatCurrency(p.value ?? 0)}</span>
        </p>
      ))}
    </div>
  )
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d33a6b" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#d33a6b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="feesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8f5e7d" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#8f5e7d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0e3e9" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#85707c' }} dy={6} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#85707c' }}
            tickFormatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`}
            width={56}
          />
          <Tooltip content={<SalesTooltip />} cursor={{ stroke: '#d33a6b', strokeOpacity: 0.25 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="disbursed"
            name="Disbursed to vendors"
            stroke="#d33a6b"
            strokeWidth={2.5}
            fill="url(#salesFill)"
            dot={false}
            activeDot={{ r: 5, fill: '#d33a6b', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="fees"
            name="Marketplace fees"
            stroke="#8f5e7d"
            strokeWidth={2}
            fill="url(#feesFill)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}