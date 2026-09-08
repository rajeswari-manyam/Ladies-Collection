import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Ticket, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { storeProducts } from '@/features/customer/products/data/products'
import { useCartStore, cartItemKey } from '@/store/appStore'
import { useCartTotals } from '@/features/customer/cart/hooks/use-cart-totals'
import { useAuthStore } from '@/store/appStore'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { QtyStepper } from '@/features/customer/cart/components/qty-stepper'
import { ProductGrid } from '@/features/customer/products/components/product-grid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { colorName, discountPercent, formatINR } from '@/utils'

export function CartPage() {
  const { updateQuantity, removeItem, clear, couponCode, applyCoupon: applyCouponStore, clearCoupon } = useCartStore()
  const totals = useCartTotals()
  const { items, enriched, subtotal, mrpTotal, discount, couponValue, shipping, total } = totals
  const session = useAuthStore((s) => s.session)
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState('')
  const couponApplied = couponCode !== null

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-blush-100">
          <ShoppingBag className="size-9 text-primary" />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-bold text-foreground">Your bag is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          All our ethnic pieces are waiting just for you. Add a few favourites to get started.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/shop/collections">
            Start shopping <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    )
  }

  function applyCouponInput() {
    if (applyCouponStore(coupon)) {
      setCoupon('')
      toast.success('Coupon applied', { description: `You saved ${formatINR(couponValue)} on this order.` })
    } else {
      toast.error('Invalid code', { description: 'Try LC100 for a ₹100 discount.' })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Shopping bag</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.reduce((n, i) => n + i.quantity, 0)} item(s) in your bag</p>
        </div>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { clear(); toast.success('Bag cleared') }}>
          <Trash2 className="size-4" /> Clear bag
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {enriched.map(({ item, product }) => (
            <div key={cartItemKey(item)} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              <Link to={`/shop/products/${product.id}`} className="shrink-0">
                <ProductArt hue={product.hue} pattern={product.pattern} label={product.name} className="size-24 rounded-xl sm:size-28" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
                    <Link to={`/shop/products/${product.id}`} className="line-clamp-1 font-serif text-base font-semibold text-foreground hover:text-primary">
                      {product.name}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => { removeItem(item.productId, item.size, item.color); toast.success('Removed from bag') }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3.5 rounded-full border border-border" style={{ background: item.color }} />
                    {colorName(item.color)}
                  </span>
                  <span>· Size {item.size}</span>
                  <span>· {discountPercent(product.mrp, product.price)}% off</span>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <QtyStepper
                    value={item.quantity}
                    onChange={(q) => updateQuantity(item.productId, item.size, item.color, q)}
                    max={Math.min(10, product.sizes.find((s) => s.size === item.size)?.stock ?? 10)}
                  />
                  <div className="text-right">
                    <p className="text-[15px] font-bold text-foreground">{formatINR(item.unitPrice * item.quantity)}</p>
                    {product.mrp > item.unitPrice && (
                      <p className="text-xs text-muted-foreground line-through">{formatINR(product.mrp * item.quantity)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="font-serif text-lg font-bold text-foreground">Price details</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><dt>MRP</dt><dd>{formatINR(mrpTotal)}</dd></div>
              <div className="flex justify-between text-foreground"><dt>Product discount</dt><dd className="font-semibold text-emerald-600">− {formatINR(discount)}</dd></div>
              {couponApplied && (
                <div className="flex justify-between text-foreground">
                  <dt className="flex items-center gap-1.5">
                    Coupon ({couponCode})
                    {couponCode === 'LC100' && (
                      <button
                        type="button"
                        onClick={() => { clearCoupon(); toast.success('Coupon removed') }}
                        className="text-destructive hover:underline"
                        aria-label="Remove coupon"
                      >
                        ✕
                      </button>
                    )}
                  </dt>
                  <dd className="font-semibold text-emerald-600">− {formatINR(couponValue)}</dd>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <dt>Delivery</dt>
                <dd className={shipping === 0 ? 'font-semibold text-emerald-600' : ''}>{shipping === 0 ? 'FREE' : formatINR(shipping)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex gap-1.5">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code (try LC100)"
                className="h-10 rounded-xl"
                disabled={couponApplied}
              />
              <Button type="button" variant="secondary" className="shrink-0 rounded-xl" onClick={applyCouponInput} disabled={couponApplied}>
                {couponApplied ? 'Applied' : 'Apply'}
              </Button>
            </div>

            <Separator className="my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">Total amount</span>
              <span className="font-serif text-xl font-bold text-foreground">{formatINR(total)}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Inclusive of all taxes. Final amount confirmed at checkout.</p>

            <Button
              className="mt-4 w-full rounded-xl"
              onClick={() => {
                if (!session) {
                  toast.error('Please sign in', { description: 'Log in to continue to checkout.' })
                  navigate('/shop/login?redirect=/shop/checkout')
                  return
                }
                navigate('/shop/checkout')
              }}
            >
              {session ? 'Proceed to checkout' : 'Sign in to checkout'}
              <ArrowRight className="size-4" />
            </Button>
            {!session && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <Link to="/shop/login?redirect=/shop/checkout" className="font-medium text-primary hover:underline">Sign in</Link> or{' '}
                <Link to="/shop/register?redirect=/shop/checkout" className="font-medium text-primary hover:underline">create an account</Link>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            <Ticket className="size-4 shrink-0" />
            You're {shipping > 0 ? formatINR(Math.max(0, subtotal - discount - couponValue)) + ' away from' : 'eligible for'} free delivery.
          </div>
        </div>
      </div>

      {enriched.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">You may also like</h2>
          <div className="mt-5"><ProductGrid products={storeProducts.slice(0, 4)} /></div>
        </section>
      )}
    </div>
  )
}