import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, MapPin, ShoppingBag, Ticket, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAddresses,
  useCart,
  useCatalog,
  useClearCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from '@/features/customer/hooks'
import { useAuthStore } from '@/store/appStore'
import { type ApiCart, cartItemMrp, cartItemOffPercent, cartItemSaved } from '@/services/cart.service'
import { estimateDelivery, type DeliveryEstimate } from '@/services/delivery.service'
import type { ApiAddress } from '@/services/address.service'
import { ProductImage } from '@/features/customer/products/components/product-image'
import { QtyStepper } from '@/features/customer/cart/components/qty-stepper'
import { ProductGrid } from '@/features/customer/products/components/product-grid'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FREE_SHIPPING_AT } from '@/utils/constants'
import { cn, colorName, discountPercent, formatINR } from '@/utils'

export function CartPage() {
  const session = useAuthStore((s) => s.session)
  const { data: cart, isLoading } = useCart()
  const { data: catalog = [] } = useCatalog()
  const { data: apiAddresses } = useAddresses()
  const updateQuantity = useUpdateCartQuantity()
  const removeItem = useRemoveFromCart()
  const clear = useClearCart()
  const [addressId, setAddressId] = useState('')

  const items = cart?.items ?? []
  const busy = updateQuantity.isPending || removeItem.isPending || clear.isPending
  const addresses = apiAddresses ?? []
  const address = addresses.find((a) => a._id === addressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0]
  const delivery = estimateDelivery(cart?.subtotal ?? 0, address?.pincode)

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-blush-100">
          <ShoppingBag className="size-9 text-primary" />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-bold text-foreground">Sign in to see your bag</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your bag is saved with your account. Log in to review your picks and check out.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link to="/shop/login?redirect=/shop/cart">Sign in</Link>
          </Button>
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/shop/register?redirect=/shop/cart">Create an account</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading && !cart) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-10">
        <p className="font-serif text-lg text-muted-foreground">Loading your bag…</p>
      </div>
    )
  }

  if (!cart || items.length === 0) {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
        <Link to="/shop">
          <ArrowLeft className="size-4" />
          Continue shopping
        </Link>
      </Button>

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Shopping bag</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.reduce((n, i) => n + i.quantity, 0)} item(s) in your bag</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={clear.isPending}
          onClick={() => {
            clear.mutate(undefined, {
              onSuccess: () => toast.success('Bag cleared'),
              onError: (err) => toast.error(err.message),
            })
          }}
        >
          <Trash2 className="size-4" /> Clear bag
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map((item) => {
            const off = cartItemOffPercent(item)
            const mrpLine = cartItemMrp(item) * item.quantity
            const savedLine = cartItemSaved(item)
            return (
              <div key={item._id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                <Link to={`/shop/products/${item.productId._id}`} className="shrink-0">
                  <ProductImage
                    images={item.variantId.images.length > 0 ? item.variantId.images : item.productId.images}
                    label={item.productId.name}
                    seed={item.variantId._id}
                    className="size-24 rounded-xl sm:size-28"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/shop/products/${item.productId._id}`} className="line-clamp-1 font-serif text-base font-semibold text-foreground hover:text-primary">
                        {item.productId.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.vendorId.businessName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem.mutate(item._id, {
                          onSuccess: () => toast.success('Removed from bag'),
                          onError: (err) => toast.error(err.message),
                        })
                      }}
                      disabled={removeItem.isPending}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-3.5 rounded-full border border-border" style={{ background: item.variantId.color }} />
                      {colorName(item.variantId.color)}
                    </span>
                    <span>· Size {item.variantId.size}</span>
                    {off > 0 && <span className="font-semibold text-emerald-600">· {off}% off</span>}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QtyStepper
                      value={item.quantity}
                      onChange={(q) =>
                        updateQuantity.mutate(
                          { itemId: item._id, quantity: q },
                          { onError: (err) => toast.error(err.message) },
                        )
                      }
                      max={Math.min(10, item.variantId.stock || 10)}
                    />
                    <div className="text-right">
                      <p className="text-[15px] font-bold text-foreground">{formatINR(item.totalPrice)}</p>
                      {off > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground line-through">{formatINR(mrpLine)}</p>
                          <p className="text-xs font-semibold text-emerald-600">
                            {off}% off · You save {formatINR(savedLine)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-fit space-y-4">
          <DeliveryPicker
            addresses={addresses}
            activeId={address?._id}
            onSelect={setAddressId}
          />
          <PriceCard cart={cart} busy={busy} delivery={delivery} address={address} />
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            <Ticket className="size-4 shrink-0" />
            {delivery.freeDeliveryGap > 0
              ? `Add items worth ${formatINR(delivery.freeDeliveryGap)} more to unlock free delivery.`
              : delivery.isFree
                ? 'You are eligible for free delivery.'
                : 'Free delivery on orders above ' + formatINR(FREE_SHIPPING_AT) + '.'}
          </div>
        </div>
      </div>

      {catalog.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">You may also like</h2>
          <div className="mt-5"><ProductGrid products={catalog.slice(0, 4)} /></div>
        </section>
      )}
    </div>
  )
}

function PriceCard({
  cart,
  busy,
  delivery,
  address,
}: {
  cart: ApiCart
  busy: boolean
  delivery: DeliveryEstimate
  address?: ApiAddress
}) {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)

  const mrpTotal = cart.subtotal + cart.discountAmount
  const offPct = discountPercent(mrpTotal, cart.subtotal)
  const deliveryFee = delivery.fee
  const total = cart.subtotal + (deliveryFee ?? 0) + cart.taxAmount

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="font-serif text-lg font-bold text-foreground">Price details</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground"><dt>Total MRP</dt><dd>{formatINR(mrpTotal)}</dd></div>
        {cart.discountAmount > 0 && (
          <div className="flex justify-between text-foreground">
            <dt>Discount on products{offPct > 0 && ` (${offPct}%)`}</dt>
            <dd className="font-semibold text-emerald-600">− {formatINR(cart.discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <dt>Item total</dt>
          <dd>{formatINR(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt>
            Delivery{address?.pincode ? ` · ${address.pincode}` : ''}
          </dt>
          <dd className={cn(deliveryFee === 0 && 'font-semibold text-emerald-600')}>
            {deliveryFee === null
              ? 'Select an address'
              : deliveryFee === 0
                ? 'FREE'
                : formatINR(deliveryFee)}
          </dd>
        </div>
        {cart.taxAmount > 0 && (
          <div className="flex justify-between text-muted-foreground"><dt>Taxes</dt><dd>{formatINR(cart.taxAmount)}</dd></div>
        )}
      </dl>

      <Separator className="my-4" />

      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">Estimated total</span>
        <span className="font-serif text-xl font-bold text-foreground">{formatINR(total)}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Delivery is estimated from your address. The final charge is confirmed when the order is placed.
      </p>

      <Button
        className="mt-4 w-full rounded-xl"
        disabled={busy}
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
    </div>
  )
}

/** Delivery is rated per pincode, so the customer picks which address the bag ships to. */
function DeliveryPicker({
  addresses,
  activeId,
  onSelect,
}: {
  addresses: ApiAddress[]
  activeId?: string
  onSelect: (id: string) => void
}) {
  if (addresses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <MapPin className="size-4" /> Add a delivery address
        </p>
        <p className="mt-1.5 text-xs">Delivery charges depend on the pincode, so save an address to see the exact fee.</p>
        <Button variant="outline" size="sm" className="mt-3 rounded-full" asChild>
          <Link to="/shop/addresses">Add address</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
        <MapPin className="size-4" /> Delivering to
      </p>
      <div className="mt-3 space-y-2">
        {addresses.map((a) => {
          const active = a._id === activeId
          return (
            <button
              key={a._id}
              type="button"
              onClick={() => onSelect(a._id)}
              className={cn(
                'flex w-full items-start gap-2.5 rounded-xl border p-3 text-left text-xs transition-colors',
                active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
              )}
            >
              <span className={cn('mt-1 size-3.5 shrink-0 rounded-full border-2', active ? 'border-primary bg-primary' : 'border-border')} />
              <span className="min-w-0">
                <span className="block font-semibold text-foreground">
                  {a.fullName} · {a.pincode}
                </span>
                <span className="block text-muted-foreground">
                  {a.addressLine1}, {a.city}
                  {a.isDefault && ' · Default'}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
