import type { StoreProduct } from '@/features/customer/types'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { ProductCard } from '@/features/customer/products/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductGridProps {
  products: StoreProduct[]
  loading?: boolean
  emptyTitle?: string
  emptyHint?: string
  compact?: boolean
}

export function ProductGrid({
  products,
  loading = false,
  emptyTitle = 'No products found',
  emptyHint = 'Try adjusting your search or filters.',
  compact = false,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <ProductArt hue={(i * 37) % 360} className="aspect-[3/4] w-full" />
            <div className="space-y-2 p-3.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
        <p className="font-serif text-lg font-semibold text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} />
      ))}
    </div>
  )
}