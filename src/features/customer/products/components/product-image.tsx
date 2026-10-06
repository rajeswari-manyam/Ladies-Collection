import { cn } from '@/utils'
import { coverImage, hueOf } from '@/services/catalog.service'
import { ProductArt } from '@/features/customer/products/components/product-art'

interface ProductImageProps {
  images?: string[] | null
  label: string
  seed?: string
  className?: string
  rounded?: boolean
}

function seedPattern(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(hash) % 6
}

export function ProductImage({ images, label, seed, className, rounded = true }: ProductImageProps) {
  const src = coverImage(images ?? [])
  const anchor = seed || label || 'LC'

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        loading="lazy"
        className={cn('object-cover', rounded && 'rounded-xl', className)}
      />
    )
  }

  return (
    <ProductArt
      hue={hueOf(anchor)}
      pattern={seedPattern(anchor)}
      label={label}
      className={className}
      rounded={rounded}
    />
  )
}