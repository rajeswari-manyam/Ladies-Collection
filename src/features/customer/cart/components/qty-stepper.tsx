import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'

interface QtyStepperProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  className?: string
}

export function QtyStepper({ value, onChange, min = 1, max = 10, className }: QtyStepperProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-lg"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-lg"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}