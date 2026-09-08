import { Link } from 'react-router-dom'
import { Heart, MapPin, Package, Shield } from 'lucide-react'

const PROMISES = [
  { icon: Shield, label: 'Free shipping above ₹1,499' },
  { icon: Package, label: '7-day easy returns' },
  { icon: MapPin, label: 'COD available across India' },
  { icon: Heart, label: 'Sarees, kurtis & lehengas' },
]

export function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="grid gap-8 px-4 py-10 sm:px-6 lg:px-10 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        <div>
          <p className="font-serif text-xl font-bold tracking-tight text-foreground">
            Ladies <span className="text-primary">Collection</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A mini bazaar for ethnic & festive fashion — sarees, kurtis, lehengas and more from
            handpicked Indian craft houses.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop/categories" className="hover:text-primary">Categories</Link></li>
            <li><Link to="/shop/collections?sort=bestselling" className="hover:text-primary">Bestsellers</Link></li>
            <li><Link to="/shop/collections?sort=newest" className="hover:text-primary">New arrivals</Link></li>
            <li><Link to="/shop/search" className="hover:text-primary">Search</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop/orders/mine" className="hover:text-primary">My orders</Link></li>
            <li><Link to="/shop/notifications" className="hover:text-primary">Notifications</Link></li>
            <li><Link to="/shop/profile" className="hover:text-primary">Profile</Link></li>
            <li><Link to="/shop/addresses" className="hover:text-primary">Saved addresses</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">We promise</p>
          {PROMISES.map(({ icon: Icon, label }) => (
            <p key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-4 text-primary" />
              {label}
            </p>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 max-w-7xl mx-auto">
        Ladies Collection · Dummy storefront demo — all data is fabricated for preview purposes · © 2026
      </div>
    </footer>
  )
}