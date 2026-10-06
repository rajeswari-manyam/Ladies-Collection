import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, Heart, RotateCcw, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAddToCart, useCart, useCatalog, useCatalogProduct } from '@/features/customer/hooks'
import { ProductImage } from '@/features/customer/products/components/product-image'
import { QtyStepper } from '@/features/customer/cart/components/qty-stepper'
import { ProductGrid } from '@/features/customer/products/components/product-grid'
import { SizeGuideDialog } from '@/features/customer/products/components/size-guide-dialog'
import { useAuthStore, useWishlistStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, colorName, formatINR } from '@/utils'

function offReference(price: number, offPercent: number): number {
  if (offPercent <= 0 || offPercent >= 100) return price
  return Math.round(price / (1 - offPercent / 100))
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const addToCart = useAddToCart()
  const wishlistIds = useWishlistStore((s) => s.ids)
  const toggleWishlist = useWishlistStore((s) => s.toggle)

  const { data: detail, isLoading } = useCatalogProduct(id)
  const { data: catalog = [] } = useCatalog()
  const { data: cart } = useCart()

  const [prefColor, setPrefColor] = useState<string | null>(null)
  const [prefSize, setPrefSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeShot, setActiveShot] = useState(0)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  const variants = useMemo(() => detail?.variants ?? [], [detail])
  const inWishlist = detail ? wishlistIds.includes(detail._id) : false

  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))), [variants])
  const selectedColor =
    prefColor && colors.includes(prefColor) ? prefColor : variants.find((v) => v.stock > 0)?.color ?? variants[0]?.color ?? null

  const sizesForColor = useMemo(() => {
    if (!selectedColor) return []
    return Array.from(new Set(variants.filter((v) => v.color === selectedColor).map((v) => v.size).filter(Boolean)))
  }, [variants, selectedColor])
  const selectedSize =
    prefSize && sizesForColor.includes(prefSize)
      ? prefSize
      : variants.find((v) => v.color === selectedColor && v.stock > 0)?.size ?? sizesForColor[0] ?? null

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return undefined
    return variants.find((v) => v.color === selectedColor && v.size === selectedSize && v.stock > 0)
      ?? variants.find((v) => v.color === selectedColor && v.size === selectedSize)
  }, [variants, selectedColor, selectedSize])

  const price = selectedVariant?.customerSellingPrice ?? undefined
  const offPercent = selectedVariant?.vendorDiscountPercent ?? 0
  const stock = selectedVariant?.stock ?? 0
  const reference = price !== undefined ? offReference(price, offPercent) : undefined

  const bagItem = useMemo(
    () => (cart?.items ?? []).find((i) => i.variantId._id === selectedVariant?._id),
    [cart, selectedVariant],
  )
  const bagQuantity = bagItem?.quantity ?? 0
  const maxPerLine = Math.min(10, stock || 1)
  const canAddMore = bagQuantity < maxPerLine

  const shots = useMemo(() => {
    return (detail?.images ?? []).filter((img) => img && img.trim().length > 0).slice(0, 3)
  }, [detail?.images])
  const mainImages = shots.length > 0 ? shots : selectedVariant?.images.filter((img) => img && img.trim().length > 0).slice(0, 3) ?? []
  const ableToSelectSize = selectedColor === null ? 'Choose a colour first' : 'Pick a size'

  if (isLoading && !detail) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="font-serif text-lg text-muted-foreground">Loading product…</p>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="font-serif text-2xl font-semibold text-foreground">Product not found</p>
        <Button asChild className="mt-4 rounded-full">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    )
  }

  const categoryRef = typeof detail.categoryId === 'object' ? detail.categoryId : null
  const vendorRef = typeof detail.vendorId === 'object' ? detail.vendorId : null
  const similar = catalog.filter((p) => p.categoryId === detail.categoryId && p.id !== detail._id).slice(0, 4)
  const product = detail

  function addToBag(goToCheckout = false) {
    if (!session) {
      toast.error('Please sign in', { description: 'Log in to add items to your bag.' })
      navigate('/shop/login?redirect=/shop/cart')
      return
    }
    if (goToCheckout && bagItem) {
      navigate('/shop/checkout')
      return
    }
    if (selectedVariant) {
      const existing = cart?.items.find((i) => i.variantId._id === selectedVariant._id)
      const nextQty = (existing?.quantity ?? 0) + quantity
      if (nextQty > maxPerLine) {
        toast.error('Stock limit reached', { description: `Only ${maxPerLine} per item can be added.` })
        return
      }
    }
    if (!selectedVariant) {
      toast.error(ableToSelectSize, { description: 'Select a colour and size first.' })
      return
    }
    if (stock <= 0) {
      toast.error('Size unavailable', { description: 'Pick another size or check back soon.' })
      return
    }
    addToCart.mutate(
      { productId: product._id, variantId: selectedVariant._id, quantity },
      {
        onSuccess: () => {
          toast.success('Added to bag', { description: `${product.name} · ${selectedVariant.size} · ${quantity} pc(s)` })
          if (goToCheckout) navigate('/shop/checkout')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/shop" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3" />
        {categoryRef && (
          <>
            <Link to={`/shop/collections?cat=${categoryRef._id}`} className="hover:text-primary">{categoryRef.name}</Link>
            <ChevronRight className="size-3" />
          </>
        )}
        <span className="text-foreground">{detail.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative">
            {mainImages.length > 0 ? (
              <img
                src={mainImages[Math.min(activeShot, mainImages.length - 1)]}
                alt={detail.name}
                className="aspect-[3/4] w-full rounded-3xl object-cover"
              />
            ) : (
              <ProductImage images={detail.images} label={detail.name} seed={detail._id} className="aspect-[3/4] w-full rounded-3xl" rounded={false} />
            )}
            {offPercent > 0 && (
              <Badge className="absolute left-4 top-4 bg-emerald-600 px-2.5 py-1 text-xs text-white">{offPercent}% off</Badge>
            )}
            <button
              type="button"
              onClick={() => {
                toggleWishlist(detail._id)
                toast.success(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist', {
                  description: inWishlist ? `${detail.name} was removed.` : `${detail.name} is now in your wishlist.`,
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
          {mainImages.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {mainImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveShot(i)}
                  className={cn(
                    'overflow-hidden rounded-xl border-2 transition-colors',
                    activeShot === i ? 'border-primary' : 'border-transparent opacity-70',
                  )}
                >
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {detail.brand && (
                <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-xs font-medium text-primary">{detail.brand}</span>
              )}
              {categoryRef && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">{categoryRef.name}</span>
              )}
            </div>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground">{detail.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className={stock > 0 ? 'text-emerald-600' : 'text-destructive'}>
                {stock > 0 ? `${stock} units in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 rounded-2xl bg-muted px-4 py-3">
            {price !== undefined && (
              <>
                <span className="text-2xl font-bold text-foreground">{formatINR(price)}</span>
                {reference !== undefined && reference > price && (
                  <span className="text-sm text-muted-foreground line-through">{formatINR(reference)}</span>
                )}
                {offPercent > 0 && <Badge variant="success">{offPercent}% off</Badge>}
              </>
            )}
            <span className="ml-auto text-xs text-muted-foreground">MRP incl. of all taxes</span>
          </div>

          {selectedVariant?.sku && (
            <p className="text-[11px] text-muted-foreground">SKU: <span className="font-mono">{selectedVariant.sku}</span></p>
          )}

          {selectedVariant?.material && (
            <p className="text-xs text-muted-foreground">Material: <span className="font-medium text-foreground">{selectedVariant.material}</span></p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Colour: <span className="font-normal text-muted-foreground">{colorName(selectedColor ?? '')}</span></p>
              <p className="text-xs text-muted-foreground">{colors.length} colour(s)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPrefColor(c)}
                  aria-label={`Select colour ${colorName(c)}`}
                  title={colorName(c)}
                  className={cn(
                    'size-9 rounded-full border-2 transition-transform hover:scale-110',
                    selectedColor === c ? 'border-primary ring-2 ring-primary/25' : 'border-border',
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
              {sizesForColor.map((size) => {
                const variant = variants.find((v) => v.color === selectedColor && v.size === size)
                const out = (variant?.stock ?? 0) === 0
                const low = !out && (variant?.stock ?? 0) <= 10
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!variant || out}
                    onClick={() => setPrefSize(size)}
                    className={cn(
                      'relative min-w-14 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors',
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : out || !variant
                          ? 'cursor-not-allowed border-border bg-muted text-muted-foreground line-through'
                          : 'border-border bg-card hover:border-primary/50',
                    )}
                  >
                    {size}
                    {low && selectedSize !== size && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-100 px-1.5 text-[9px] font-bold text-amber-700">
                        {variant?.stock} left
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedVariant && stock > 0 && stock <= 10 && (
              <p className="text-xs font-medium text-amber-600">Hurry — only {stock} units left in this size.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-foreground">Quantity</p>
            <QtyStepper value={quantity} onChange={setQuantity} max={Math.min(10, stock || 1)} disabled={stock <= 0} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="flex-1 rounded-2xl"
              onClick={() => (bagItem ? navigate('/shop/cart') : addToBag())}
              disabled={addToCart.isPending || (!bagItem && !canAddMore)}
            >
              {bagItem ? (
                <>
                  <ShoppingBag className="size-4.5" />
                  Go to bag
                </>
              ) : addToCart.isPending ? (
                'Adding…'
              ) : (
                <>
                  <ShoppingBag className="size-4.5" />
                  Add to bag
                </>
              )}
            </Button>
            <Button
              size="lg"
              className="flex-1 rounded-2xl bg-foreground text-background shadow-sm hover:bg-foreground/90"
              onClick={() => addToBag(true)}
              disabled={addToCart.isPending}
            >
              <Zap className="size-4.5" />
              Buy now
            </Button>
          </div>

          {bagItem && (
            <button
              type="button"
              onClick={() => navigate('/shop/cart')}
              className="inline-flex w-full items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {bagQuantity} pc(s) already in your bag
              <ArrowRight className="size-3.5" />
            </button>
          )}

          <div className="grid gap-2 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
            <span className="flex items-center gap-2 text-muted-foreground"><Truck className="size-4 text-primary" /> Free delivery over ₹1,499</span>
            <span className="flex items-center gap-2 text-muted-foreground"><RotateCcw className="size-4 text-primary" /> 7-day returns</span>
            <span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Genuine craft</span>
          </div>

          {vendorRef && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <ProductImage images={[]} label={vendorRef.businessName} seed={vendorRef.businessName} className="size-12 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{vendorRef.businessName}</p>
                <p className="truncate text-xs text-muted-foreground">Sold by {vendorRef.businessName}</p>
              </div>
            </div>
          )}

          <Separator className="my-1" />

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product details</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{detail.description || 'No description provided yet.'}</p>
            {detail.specifications && Object.keys(detail.specifications).length > 0 && (
              <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
                {Object.entries(detail.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-6 border-b border-dashed border-border/60 py-1">
                    <span className="capitalize">{key}</span>
                    <span className="text-right font-medium text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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