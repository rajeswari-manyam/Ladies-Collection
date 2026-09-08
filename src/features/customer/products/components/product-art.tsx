import { cn } from '@/utils'

const PATTERN_OVERLAYS: (string | null)[] = [
  null,
  'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.45) 0 4px, transparent 5px 9px, rgba(255,255,255,0.25) 9px 13px, transparent 14px)',
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 10px)',
  'radial-gradient(circle at 75% 20%, rgba(255,255,255,0.5) 0 3px, transparent 4px 14px, rgba(255,255,255,0.22) 14px 17px, transparent 18px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.22) 0 3px, transparent 3px 12px)',
  'radial-gradient(circle at 20% 75%, rgba(255,255,255,0.4) 0 5px, transparent 6px 18px, rgba(255,255,255,0.2) 18px 21px, transparent 22px)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 1px, transparent 1px 14px)',
]

interface ProductArtProps {
  hue?: number
  pattern?: number
  label?: string
  className?: string
  rounded?: boolean
}

export function ProductArt({ hue = 336, pattern = 0, label, className, rounded = true }: ProductArtProps) {
  const overlay = PATTERN_OVERLAYS[pattern % PATTERN_OVERLAYS.length]
  const letter = (label ?? 'LC').trim().charAt(0).toUpperCase()
  const labelWords = (label ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')

  return (
    <div
      className={cn('relative block overflow-hidden', rounded && 'rounded-xl', className)}
      style={{
        background: `linear-gradient(140deg, hsl(${hue} 68% 86%) 0%, hsl(${hue + 16} 62% 74%) 45%, hsl(${hue} 58% 52%) 100%)`,
      }}
    >
      {overlay && <div className="absolute inset-0" style={{ backgroundImage: overlay }} />}
      <div
        className="absolute -right-8 -top-10 size-40 rounded-full opacity-30 blur-3xl"
        style={{ background: `hsl(${hue + 30} 80% 80%)` }}
      />
      <div
        className="absolute -bottom-12 -left-8 size-44 rounded-full opacity-25 blur-3xl"
        style={{ background: `hsl(${hue - 20} 70% 70%)` }}
      />
      {label ? (
        <span
          className="absolute inset-0 flex items-center justify-center font-serif font-semibold tracking-tight text-white drop-shadow-sm"
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.4rem)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.65))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {labelWords}
        </span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-semibold text-white/90 drop-shadow-sm">
          {letter}
        </span>
      )}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
    </div>
  )
}