import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banknote, CreditCard, Landmark, Loader2, Lock, ShoppingBag, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { addresses, placeOrder } from '@/features/customer/data/account'
import { storeProductById } from '@/features/customer/products/data/products'
import type { StoreProduct } from '@/features/customer/types'
import { useCartStore } from '@/store/appStore'
import { useAuthStore } from '@/store/appStore'
import { useCartTotals, COD_FEE } from '@/features/customer/cart/hooks/use-cart-totals'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn, formatINR } from '@/utils'

const METHODS = [
  { id: 'upi', label: 'UPI', icon: Wallet, hint: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit card', icon: CreditCard, hint: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net banking', icon: Landmark, hint: 'All major banks' },
  { id: 'cod', label: 'Cash on delivery', icon: Banknote, hint: 'Pay when it arrives' },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const { items, clear } = useCartStore()
  const totals = useCartTotals()

  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? '')
  const [method, setMethod] = useState('upi')
  const [simulateFail, setSimulateFail] = useState(false)
  const [busy, setBusy] = useState(false)

  const [upiId, setUpiId] = useState('ananya@okicici')
  const [cardNo, setCardNo] = useState('')
  const [cardExp, setCardExp] = useState('')

  const address = addresses.find((a) => a.id === addressId)
  const codFee = method === 'cod' ? COD_FEE : 0
  const payable = Math.max(0, totals.total + codFee)
  const itemsWithProduct = useMemo(
    () =>
      items
        .map((item) => ({ item, product: storeProductById(item.productId) }))
        .filter((x): x is { item: (typeof items)[number]; product: StoreProduct } => Boolean(x.product)),
    [items],
  )

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">Sign in to checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Log in with the demo account to continue your purchase.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link to="/shop/login?redirect=/shop/checkout">Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/shop/register?redirect=/shop/checkout">Create account</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShoppingBag className="mx-auto size-10 text-primary" />
        <h1 className="mt-3 font-serif text-2xl font-bold text-foreground">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your bag is empty. Add a few pieces first.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/shop/collections">Browse products</Link>
        </Button>
      </div>
    )
  }

  async function placeOrderHandler(e: FormEvent) {
    e.preventDefault()
    if (!address) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 1600))

    const order = placeOrder({
      items: itemsWithProduct.map(({ item, product }) => ({
        productId: item.productId,
        name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      codFee: method === 'cod' ? COD_FEE : 0,
      paymentMethod: method === 'upi' ? 'UPI' : method === 'card' ? 'Credit card' : method === 'netbanking' ? 'Net banking' : 'Cash on Delivery',
      address,
    })

    setBusy(false)
    if (simulateFail) {
      navigate('/shop/payment/failed', { state: { orderId: order.id } })
    } else {
      clear()
      navigate('/shop/payment/success', { state: { orderId: order.id } })
      toast.success('Payment received', { description: `Ref ${order.paymentId}` })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, {session.profile.name.split(' ')[0]} · {session.profile.email}</p>
      </div>

      <form onSubmit={placeOrderHandler} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <h2 className="font-serif text-lg font-bold text-foreground">Delivery address</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAddressId(a.id)}
                  className={cn(
                    'rounded-2xl border-2 p-4 text-left transition-colors',
                    addressId === a.id ? 'border-primary bg-blush-50' : 'border-border hover:border-primary/40',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{a.label}</span>
                    {a.isDefault && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Default</span>}
                  </div>
                  <p className="mt-2 text-sm font-bold text-foreground">{a.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {a.line1}, {a.line2}, {a.city}, {a.state} — {a.pincode}
                  </p>
                  <p className="mt-1 text-xs font-medium text-foreground">{a.phone}</p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Saved addresses are managed from{' '}
              <Link to="/shop/addresses" className="font-medium text-primary hover:underline">Saved addresses</Link>.
            </p>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <h2 className="font-serif text-lg font-bold text-foreground">Payment method</h2>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {METHODS.map(({ id, label, icon: Icon, hint }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-colors',
                    method === id ? 'border-primary bg-blush-50' : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className={cn('flex size-9 items-center justify-center rounded-xl', method === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    <Icon className="size-4.5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{label}</span>
                    <span className="block text-[11px] text-muted-foreground">{hint}</span>
                  </span>
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div className="mt-4 rounded-2xl bg-muted p-4">
                <Label htmlFor="upi">UPI ID</Label>
                <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="mt-1.5 bg-card" />
                <p className="mt-2 text-[11px] text-muted-foreground">A collect request will be sent to <span className="font-semibold">{upiId}</span></p>
              </div>
            )}

            {method === 'card' && (
              <div className="mt-4 space-y-3 rounded-2xl bg-muted p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="card">Card number</Label>
                  <Input id="card" inputMode="numeric" placeholder="4242 4242 4242 4242" className="bg-card" value={cardNo} onChange={(e) => setCardNo(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="exp">Expiry</Label>
                    <Input id="exp" placeholder="MM/YY" className="bg-card" value={cardExp} onChange={(e) => setCardExp(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" inputMode="numeric" placeholder="•••" maxLength={4} className="bg-card" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">Demo only — card details are never stored or charged.</p>
              </div>
            )}

            {method === 'cod' && (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
                Cash on delivery adds ₹20 handling fee on delivery for this demo.
              </p>
            )}

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Simulate a failed payment</p>
                <p className="text-[11px] text-muted-foreground">For demo purposes — shows the Payment failed screen.</p>
              </div>
              <Switch checked={simulateFail} onCheckedChange={setSimulateFail} />
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="font-serif text-lg font-bold text-foreground">Order summary</p>
            <div className="mt-3 space-y-3">
              {itemsWithProduct.map(({ item, product }) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                  <ProductArt hue={product.hue} pattern={product.pattern} label={product.name} className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{item.size} · {item.quantity} pc(s)</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatINR(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><dt>MRP</dt><dd>{formatINR(totals.mrpTotal)}</dd></div>
              <div className="flex justify-between text-foreground"><dt>Discount</dt><dd className="font-semibold text-emerald-600">− {formatINR(totals.discount)}</dd></div>
              {totals.couponValue > 0 && (
                <div className="flex justify-between text-foreground"><dt>Coupon ({totals.couponCode})</dt><dd className="font-semibold text-emerald-600">− {formatINR(totals.couponValue)}</dd></div>
              )}
              <div className="flex justify-between text-muted-foreground"><dt>Delivery</dt><dd>{totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping)}</dd></div>
              {codFee > 0 && (
                <div className="flex justify-between text-muted-foreground"><dt>COD handling fee</dt><dd>{formatINR(codFee)}</dd></div>
              )}
            </dl>
            <Separator className="my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">Payable now</span>
              <span className="font-serif text-2xl font-bold text-primary">{formatINR(payable)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={busy || items.length === 0}>
            {busy ? (<><Loader2 className="size-4 animate-spin" /> Processing payment…</>) : (<><Lock className="size-4" /> Place order · {formatINR(payable)}</>)}
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            By placing this order you agree to the dummy terms & privacy policy of this demo store.
          </p>
        </aside>
      </form>
    </div>
  )
}