import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategorySale } from '@/types'

interface CategoryDonutProps {
  data: CategorySale[]
}

const COLORS = ['#d33a6b', '#f0a5c0', '#8f5e7d', '#e8b84b', '#6f9fb0', '#9c7bd3']

export function CategoryDonut({ data }: CategoryDonutProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No category data to show yet.
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-2">
      <div className="relative h-52 w-full max-w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value) => [`${value}%`, 'Share']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #f0e3e9',
                background: '#fff',
                fontSize: 12,
                boxShadow: '0 10px 30px -15px rgba(61,25,42,.2)',
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl font-semibold">{total}%</span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">GMV</span>
        </div>
      </div>
      <div className="grid w-full gap-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="mr-auto font-medium">{entry.name}</span>
            <span className="text-muted-foreground">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}