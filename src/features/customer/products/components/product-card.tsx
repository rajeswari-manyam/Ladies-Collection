import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import type { StoreProduct } from '@/features/customer/types'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { RatingStars } from '@/features/customer/products/components/rating-stars'
import { useCartStore } from '@/store/appStore'
import { formatINR, discountPercent } from '@/utils'

interface ProductCardProps {
  product: StoreProduct
  compact?: boolean
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const off = discountPercent(product.mrp, product.price)
  const lowestStock = Math.max(...product.sizes.map((s) => s.stock), 0)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <Link to={`/shop/products/${product.id}`} className="relative block">
        <ProductArt hue={product.hue} pattern={product.pattern} label={product.name} className="aspect-[3/4] w-full" />
        {off > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            {off}% off
          </span>
        )}
        {product.inBestsellers && (
          <span className="absolute right-2.5 top-2.5 rounded-full border border-white/40 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-rose-600 backdrop-blur">
            Bestseller
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <Link
          to={`/shop/products/${product.id}`}
          className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        {!compact && (
          <div className="flex items-center gap-1.5">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-muted-foreground">({product.ratingCount})</span>
          </div>
        )}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-foreground">{formatINR(product.price)}</span>
          {off > 0 && <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>}
        </div>
        {lowestStock > 0 && lowestStock <= 10 && (
          <p className="text-[11px] font-medium text-amber-600">Only {lowestStock} left</p>
        )}
        <button
          type="button"
          onClick={() => {
            addItem({
              productId: product.id,
              size: product.sizes[0].size,
              color: product.colors[0],
              quantity: 1,
              unitPrice: product.price,
            })
            toast.success('Added to bag', { description: product.name })
          }}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary group-hover:shadow-md"
        >
          <ShoppingBag className="size-3.5" />
          Add to bag
        </button>
      </div>
    </div>
  )
}