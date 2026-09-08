import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/utils'

interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md'
  className?: string
}

export function RatingStars({ rating, size = 'sm', className }: RatingStarsProps) {
  const starred = Math.round(rating * 2) / 2
  const dim = size === 'sm' ? 'size-3.5' : 'size-4'
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-amber-500', className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.floor(starred)
        const half = !filled && starred - i >= 0.5
        return half ? (
          <StarHalf key={i} className={cn(dim, 'fill-current')} />
        ) : (
          <Star key={i} className={cn(dim, filled ? 'fill-current' : 'fill-transparent opacity-40')} />
        )
      })}
    </span>
  )
}