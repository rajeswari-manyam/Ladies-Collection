import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Truck } from 'lucide-react'
import { storeProducts, homeBanners } from '@/features/customer/products/data/products'
import { categories } from '@/features/admin/categories/data/categories'
import { ProductArt } from '@/features/customer/products/components/product-art'
import { ProductGrid } from '@/features/customer/products/components/product-grid'
import { RatingStars } from '@/features/customer/products/components/rating-stars'
import { useAuthStore } from '@/store/appStore'
import { formatINR } from '@/utils'
import { Button } from '@/components/ui/button'

export function StoreHomePage() {
  const session = useAuthStore((s) => s.session)
  const hero = homeBanners[0]
  const bestsellers = storeProducts.filter((p) => p.inBestsellers)
  const newArrivals = storeProducts
    .filter((p) => p.inNewArrivals)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4)
  const heroProduct = storeProducts.find((p) => p.id === 'prd-502') ?? storeProducts[0]

  return (
    <div>
      <section
        className="relative overflow-hidden border-b border-border"
        style={{
          background: `linear-gradient(115deg, hsl(${hero.hue} 58% 90%) 0%, hsl(${hero.hue} 60% 84%) 50%, hsl(${hero.hue + 30} 62% 78%) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-24 size-96 rounded-full opacity-30 blur-3xl"
          style={{ background: `hsl(${hero.hue} 80% 70%)` }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-10">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/50 px-3 py-1 text-xs font-semibold text-rose-700 backdrop-blur">
              <Sparkles className="size-3.5" />
              Festive Edit · New Season
            </span>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {hero.label.slice(0, 16)}
              <span className="block text-primary">{'Ethereal ethnic wear'}</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-foreground/70">
              Handpicked sarees, kurtis, lehengas and more from six Indian craft houses — with sizes,
              colours and prices that fit every occasion.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/shop/collections?sort=bestselling">
                  Shop the collection
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-foreground/20 bg-white/60 backdrop-blur">
                <Link to="/shop/categories">Browse categories</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-foreground/70">
              <span className="flex items-center gap-2"><RatingStars rating={heroProduct.rating} /> {heroProduct.rating} ({heroProduct.ratingCount})</span>
              <span>Free shipping above ₹1,499</span>
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md">
            <div
              className="relative overflow-hidden rounded-[2rem] border-8 border-white/60 shadow-2xl shadow-rose-950/20 rotate-2"
              style={{ animation: 'float 7s ease-in-out infinite' }}
            >
              <ProductArt hue={hero.hue} pattern={1} label={heroProduct.name} rounded={false} className="aspect-[3/4] w-full" />
              <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                {Math.round(((heroProduct.mrp - heroProduct.price) / heroProduct.mrp) * 100)}% off
              </span>
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
                <div>
                  <p className="font-serif text-sm font-bold text-foreground">{heroProduct.name}</p>
                  <p className="text-xs text-muted-foreground">by {heroProduct.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-primary">{formatINR(heroProduct.price)}</p>
                  <p className="text-xs text-muted-foreground line-through">{formatINR(heroProduct.mrp)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Shop by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Find your perfect fit across the store</p>
          </div>
          <Link to="/shop/categories" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((cat, i) => (
            <Link
              key={cat.id}
              to={`/shop/collections?cat=${cat.id}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card text-center shadow-sm transition-shadow hover:shadow-lg"
            >
              <ProductArt hue={cat.hue} pattern={i % 6} label={cat.name} className="aspect-square w-full" />
              <div className="px-2 py-3">
                <p className="text-[13px] font-semibold text-foreground group-hover:text-primary">{cat.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{cat.productCount} styles</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card pb-12 pt-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Bestsellers</h2>
              <p className="mt-1 text-sm text-muted-foreground">The pieces our customers keep re-ordering</p>
            </div>
            <Link to="/shop/collections?sort=bestselling" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Shop all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={bestsellers} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Just arrived</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fresh drops from our craft partners</p>
          </div>
          <Link to="/shop/collections?sort=newest" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Shop all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-10">
        <div className="grid gap-4 rounded-3xl bg-primary p-6 text-primary-foreground sm:grid-cols-3 sm:p-8">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 size-6" />
            <div>
              <p className="font-semibold">Free & fast delivery</p>
              <p className="text-sm text-primary-foreground/75">Free above ₹1,499. Express delivery in the metros.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-6" />
            <div>
              <p className="font-semibold">{session ? 'Welcome back, ' + session.profile.name.split(' ')[0] : 'Members-only offers'}</p>
              <p className="text-sm text-primary-foreground/75">{session ? 'Use your member cashback on the next order.' : 'Sign in to unlock early sale access and cashback.'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:justify-end">
            <Button asChild variant="secondary" className="rounded-full">
              <Link to={session ? '/shop/orders/mine' : '/shop/login?redirect=/shop/orders/mine'}>
                {session ? 'My orders' : 'Member login'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(-4px) rotate(2deg); }
          50% { transform: translateY(6px) rotate(2deg); }
        }
      `}</style>
    </div>
  )
}