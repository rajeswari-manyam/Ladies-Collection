import { cn } from '@/utils'

interface ArtworkProps {
  seed: string
  hue?: number
  className?: string
  label?: string
  icon?: React.ReactNode
}

export function GradientArtwork({ seed, hue = 336, className, label, icon }: ArtworkProps) {
  const letter = (label ?? seed).trim().charAt(0).toUpperCase()
  return (
    <div
      className={cn('relative isolate flex items-center justify-center overflow-hidden', className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 65% 88%) 0%, hsl(${hue + 18} 70% 94%) 45%, hsl(${hue} 55% 82%) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full opacity-40 blur-2xl"
        style={{ background: `hsl(${hue} 70% 80%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 size-36 rounded-full opacity-30 blur-2xl"
        style={{ background: `hsl(${hue + 30} 65% 85%)` }}
      />
      {icon ? (
        <span className="relative text-white/70">{icon}</span>
      ) : (
        <span
          className="relative font-serif text-white/80 drop-shadow-sm"
          style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)' }}
        >
          {letter}
        </span>
      )}
    </div>
  )
}

export function ProductThumb({ seed, color, className }: { seed: string; color: string; className?: string }) {
  const letters = seed
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
  return (
    <div
      className={cn(
        'relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg font-serif text-sm font-semibold text-white shadow-sm',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(336 70% 80%), hsl(328 72% 62%) 60%, hsl(312 65% 55%))`,
      }}
    >
      <span className="relative z-10">{letters}</span>
      <span
        className="absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(circle at 30% 20%, transparent 0%, hsl(0 0% 100% / 0.35) 70%)`,
        }}
      />
      <span className="absolute bottom-0 right-0 size-3 rounded-full border border-white/50" style={{ background: color }} />
    </div>
  )
}

export function BrandMark({ seed, hue = 336, className }: { seed: string; hue?: number; className?: string }) {
  const letter = seed.charAt(0).toUpperCase()
  return (
    <div
      className={cn('flex items-center justify-center rounded-xl font-serif text-base font-semibold text-white shadow-sm', className)}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 68% 72%), hsl(${hue + 20} 66% 55%))` }}
    >
      {letter}
    </div>
  )
}