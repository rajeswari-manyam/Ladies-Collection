import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Zap } from 'lucide-react'
import { toast } from 'sonner'
import type { CatalogProduct } from '@/services/catalog.service'
import { ProductImage } from '@/features/customer/products/components/product-image'
import { useAddToCart, useCart } from '@/features/customer/hooks'
import { useAuthStore } from '@/store/appStore'
import { formatINR } from '@/utils'

interface ProductCardProps {
  product: CatalogProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const addToCart = useAddToCart()
  const { data: cart } = useCart()
  const off = product.offPercent
  const hasDiscount = product.offPercent > 0 && product.discountAmount > 0
  const showStrike = hasDiscount && product.basePrice > product.price
  const DEFAULT_VARIANT_ID = product.variants.find((v) => v.stock > 0)?.variantId ?? product.variants[0]?.variantId
  const inBag = Boolean(DEFAULT_VARIANT_ID && cart?.items.some((i) => i.variantId._id === DEFAULT_VARIANT_ID))

  function requireSession(): boolean {
    if (!session) {
      toast.error('Please sign in', { description: 'Log in to add items to your bag.' })
      navigate('/shop/login?redirect=/shop/cart')
      return false
    }
    return true
  }

  function handleAddToBag() {
    if (!requireSession()) return
    if (inBag) {
      navigate('/shop/cart')
      return
    }
    if (!DEFAULT_VARIANT_ID || product.stock <= 0) {
      toast.error('Out of stock', { description: product.name })
      return
    }
    addToCart.mutate(
      { productId: product.id, variantId: DEFAULT_VARIANT_ID, quantity: 1 },
      {
        onSuccess: () => toast.success('Added to bag', { description: product.name }),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  function handleBuyNow() {
    if (!requireSession()) return
    if (inBag) {
      navigate('/shop/checkout')
      return
    }
    if (!DEFAULT_VARIANT_ID || product.stock <= 0) {
      toast.error('Out of stock', { description: product.name })
      return
    }
    addToCart.mutate(
      { productId: product.id, variantId: DEFAULT_VARIANT_ID, quantity: 1 },
      {
        onSuccess: () => navigate('/shop/checkout'),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <Link to={`/shop/products/${product.id}`} className="relative block">
        <ProductImage
          images={product.images}
          label={product.name}
          seed={product.id}
          className="aspect-[3/4] w-full"
        />
        {off > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            {off}% off
          </span>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute right-2.5 top-2.5 rounded-full border border-white/40 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-rose-600 backdrop-blur">
            Only {product.stock} left
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        )}
        <Link
          to={`/shop/products/${product.id}`}
          className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[15px] font-bold text-foreground">{formatINR(product.price)}</span>
          {showStrike && (
            <span className="text-xs text-muted-foreground line-through">{formatINR(product.basePrice)}</span>
          )}
          {hasDiscount && (
            <span className="text-xs font-semibold text-emerald-600">
              {product.offPercent}% off · Save {formatINR(product.discountAmount)}
            </span>
          )}
        </div>
        <div className="mt-auto flex flex-col gap-1.5 sm:flex-row">
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={addToCart.isPending || (product.stock <= 0 && !inBag)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary disabled:opacity-60 group-hover:shadow-md"
          >
            {inBag ? (
              <>
                Go to bag
                <ArrowRight className="size-3.5" />
              </>
            ) : addToCart.isPending ? (
              'Adding…'
            ) : (
              <>
                <ShoppingBag className="size-3.5" />
                Add to bag
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={addToCart.isPending || (product.stock <= 0 && !inBag)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Zap className="size-3.5" />
            Buy now
          </button>
        </div>
      </div>
    </div>
  )
}