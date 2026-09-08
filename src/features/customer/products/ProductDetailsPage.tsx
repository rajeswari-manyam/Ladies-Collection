import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Heart, RotateCcw, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { storeProductById, storeProductDiscount, storeReviewsForProduct, storeVendorById, storeProducts } from '@/features/customer/products/data/products'
import { useCartStore } from '@/store/appStore'
import { useWishlistStore } from '@/store/appStore'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { RatingStars } from '@/features/customer/products/components/rating-stars'
import { QtyStepper } from '@/features/customer/cart/components/qty-stepper'
import { ProductGrid } from '@/features/customer/products/components/product-grid'
import { SizeGuideDialog } from '@/features/customer/products/components/size-guide-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, colorName, formatINR } from '@/utils'

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = id ? storeProductById(id) : undefined
  const addItem = useCartStore((s) => s.addItem)
  const wishlistIds = useWishlistStore((s) => s.ids)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const inWishlist = product ? wishlistIds.includes(product.id) : false

  const [size, setSize] = useState(() => product?.sizes[0]?.size ?? '')
  const [color, setColor] = useState(() => product?.colors[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const [activeShot, setActiveShot] = useState(0)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  const selectedSize = useMemo(() => product?.sizes.find((s) => s.size === size), [product, size])

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="font-serif text-2xl font-semibold text-foreground">Product not found</p>
        <Button asChild className="mt-4 rounded-full">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    )
  }

  const vendor = storeVendorById(product.vendorId)
  const reviews = storeReviewsForProduct(product.id)
  const off = storeProductDiscount(product)
  const similar = storeProducts.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)
  const shots = [0, 2, 5].map((pattern) => pattern)

  function addToBag(goToCheckout = false) {
    if (!selectedSize || selectedSize.stock === 0) {
      toast.error('Size unavailable', { description: 'Pick another size or check back soon.' })
      return
    }
    addItem({ productId: product!.id, size: size || product!.sizes[0].size, color, quantity, unitPrice: product!.price })
    toast.success('Added to bag', { description: `${product!.name} · ${size} · ${quantity} pc(s)` })
    if (goToCheckout) navigate('/shop/checkout')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/shop" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3" />
        <Link to={`/shop/collections?cat=${product.categoryId}`} className="hover:text-primary">{product.categoryName}</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative">
            <ProductArt hue={product.hue} pattern={shots[activeShot] % 6} label={product.name} className="aspect-[3/4] w-full rounded-3xl" />
            {off > 0 && (
              <Badge className="absolute left-4 top-4 bg-emerald-600 px-2.5 py-1 text-xs text-white">{off}% off</Badge>
            )}
            <button
              type="button"
              onClick={() => {
                toggleWishlist(product.id)
                toast.success(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist', {
                  description: inWishlist ? `${product.name} was removed.` : `${product.name} is now in your wishlist.`,
                })
              }}
              className={cn(
                'absolute right-4 top-4 flex size-9 items-center justify-center rounded-full shadow transition-colors',
                inWishlist
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-white/90 text-foreground hover:text-primary',
              )}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={cn('size-4.5', inWishlist && 'fill-current')} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {shots.map((pattern, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveShot(i)}
                className={cn(
                  'overflow-hidden rounded-xl border-2 transition-colors',
                  activeShot === i ? 'border-primary' : 'border-transparent opacity-70',
                )}
              >
                <ProductArt hue={product.hue} pattern={pattern % 6} className="aspect-square w-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-xs font-medium text-primary">{product.brand}</span>
              {product.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">{t}</span>
              ))}
            </div>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <RatingStars rating={product.rating} />
              <span className="font-medium text-foreground">{product.rating}</span>
              <span className="text-muted-foreground">· {product.ratingCount} ratings ·</span>
              <span className="text-emerald-600">In stock</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 rounded-2xl bg-muted px-4 py-3">
            <span className="text-2xl font-bold text-foreground">{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-sm text-muted-foreground line-through">{formatINR(product.mrp)}</span>
                <Badge variant="success">{off}% off</Badge>
              </>
            )}
            <span className="ml-auto text-xs text-muted-foreground">MRP incl. of all taxes</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Colour: <span className="font-normal text-muted-foreground">{colorName(color)}</span></p>
              <p className="text-xs text-muted-foreground">{product.colors.length} colours</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Select colour ${colorName(c)}`}
                  title={colorName(c)}
                  className={cn(
                    'size-9 rounded-full border-2 transition-transform hover:scale-110',
                    color === c ? 'border-primary ring-2 ring-primary/25' : 'border-border',
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Size</p>
              <button type="button" onClick={() => setSizeGuideOpen(true)} className="text-xs font-medium text-primary hover:underline">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const out = s.stock === 0
                const low = !out && s.stock <= 10
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={out}
                    onClick={() => setSize(s.size)}
                    className={cn(
                      'relative min-w-14 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors',
                      size === s.size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : out
                          ? 'cursor-not-allowed border-border bg-muted text-muted-foreground line-through'
                          : 'border-border bg-card hover:border-primary/50',
                    )}
                  >
                    {s.size}
                    {low && size !== s.size && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-100 px-1.5 text-[9px] font-bold text-amber-700">
                        {s.stock} left
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedSize && selectedSize.stock > 0 && selectedSize.stock <= 10 && (
              <p className="text-xs font-medium text-amber-600">Hurry — only {selectedSize.stock} units left in this size.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-foreground">Quantity</p>
            <QtyStepper value={quantity} onChange={setQuantity} max={Math.min(10, selectedSize?.stock || 1)} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="flex-1 rounded-2xl" onClick={() => addToBag()}>
              <ShoppingBag className="size-4.5" />
              Add to bag
            </Button>
            <Button size="lg" variant="secondary" className="flex-1 rounded-2xl" onClick={() => addToBag(true)}>
              <Zap className="size-4.5" />
              Buy now
            </Button>
          </div>

          <div className="grid gap-2 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
            <span className="flex items-center gap-2 text-muted-foreground"><Truck className="size-4 text-primary" /> Free delivery over ₹1,499</span>
            <span className="flex items-center gap-2 text-muted-foreground"><RotateCcw className="size-4 text-primary" /> 7-day returns</span>
            <span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Genuine craft</span>
          </div>

          {vendor && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <ProductArt hue={vendor.hue} pattern={1} label={vendor.brand} className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{vendor.name}</p>
                <p className="truncate text-xs text-muted-foreground">{vendor.blurb} · {vendor.location}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="flex items-center gap-1 text-sm font-bold text-foreground"><RatingStars rating={vendor.rating} size="sm" /> {vendor.rating}</p>
                <p className="text-[11px] text-muted-foreground">{vendor.productsCount} pieces</p>
              </div>
            </div>
          )}

          <Separator className="my-1" />

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product details</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{product.description}</p>
            <p className="mt-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Care:</span> {product.care}</p>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
          Ratings & reviews <span className="text-muted-foreground">({reviews.length})</span>
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="font-serif text-5xl font-bold text-foreground">{product.rating}</p>
            <div className="mt-2 flex justify-center"><RatingStars rating={product.rating} size="md" /></div>
            <p className="mt-1 text-xs text-muted-foreground">{product.ratingCount} ratings</p>
            <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={() => toast.success('Thanks!', { description: 'This demo opens the review form in a real build.' })}>
              Write a review
            </Button>
          </div>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{review.author}</p>
                  <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <RatingStars rating={review.rating} />
                  <span className="text-sm font-medium text-foreground">{review.title}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet — be the first to review this piece.</p>}
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">You may also like</h2>
          <div className="mt-5"><ProductGrid products={similar} /></div>
        </section>
      )}

      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </div>
  )
}