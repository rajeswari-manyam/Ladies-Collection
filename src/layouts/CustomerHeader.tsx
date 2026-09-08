import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, KeyRound, LogOut, Menu, Package, Search, ShoppingBag, Store, User, UserCog } from 'lucide-react'
import { storeProducts } from '@/features/customer/products/data/products'
import { unreadNotificationCount } from '@/features/customer/data/account'
import { useCartStore } from '@/store/appStore'
import { useAuthStore } from '@/store/appStore'
import { cn } from '@/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { avatarPalette, initials } from '@/utils'
import { CategoryMegaMenu } from '@/layouts/CategoryMegaMenu'
import { PortalCredentials } from '@/layouts/PortalCredentials'
import { categories } from '@/features/admin/categories/data/categories'
import { subcategories } from '@/features/admin/subcategories/data/subcategories'

const lcLogo = new URL('../assets/Lc.png', import.meta.url).href

const NAV_LINKS = [
  { label: 'Home', to: '/shop' },
  { label: 'Bestsellers', to: '/shop/collections?sort=bestselling' },
  { label: 'New arrivals', to: '/shop/collections?sort=newest' },
  { label: 'Sarees', to: '/shop/collections?cat=cat-ethnic' },
]

export function StoreHeader() {
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const unread = unreadNotificationCount()
  const navRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setCategoriesOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!categoriesOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (navRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setCategoriesOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [categoriesOpen])

  function submitSearch(e: FormEvent) {
    e.preventDefault()
    navigate(query.trim() ? `/shop/search?q=${encodeURIComponent(query.trim())}` : '/shop/search')
  }

  const notificationDot = unread > 0
  const categoriesActive = location.pathname === '/shop/categories'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#f7eef1] backdrop-blur relative">
      <div className="flex items-center gap-4 bg-[#b5365d] px-4 py-1.5 text-[11px] font-medium text-white">
        <span className="mx-auto sm:mx-0">Festive sale live — up to 45% off on sarees · Free shipping above ₹1,499</span>
        <div className="ml-auto hidden shrink-0 items-center sm:flex">
          <PortalCredentials />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 lg:gap-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" showCloseButton={false} className="w-80 overflow-y-auto">
              <SheetTitle className="px-6 pt-6 font-serif">Ladies Collection</SheetTitle>
              <nav className="mt-2 flex flex-col gap-1 px-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/shop/orders/mine" className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent">
                  My orders
                </Link>
              </nav>

              <p className="mt-4 px-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Categories
              </p>
              <nav className="mt-1 flex flex-col gap-3 px-3 pb-4">
                {categories.map((cat) => {
                  const subs = subcategories.filter((s) => s.categoryId === cat.id)
                  return (
                    <div key={cat.id} className="rounded-xl px-3 py-2">
                      <Link to={`/shop/collections?cat=${cat.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                        {cat.name}
                      </Link>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                        {subs.map((s) => (
                          <Link key={s.id} to={`/shop/collections?cat=${cat.id}`} className="text-xs text-muted-foreground hover:text-primary">
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </nav>

              <p className="px-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Portals
              </p>
              <nav className="mt-1 flex flex-col gap-1 px-3">
                <Link to={session ? '/shop/profile' : '/shop/login?redirect=/shop/profile'} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent">
                  <User className="size-4" /> Customer account
                </Link>
                {session && (
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                      navigate('/shop', { replace: true })
                    }}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                )}
                <Link to="/vendor/login" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent">
                  <Store className="size-4" /> Vendor login
                </Link>
                <Link to="/login" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent">
                  <Store className="size-4" /> Admin login
                </Link>
              </nav>
              <div className="px-3 pb-6 pt-2">
                <PortalCredentials
                  trigger={
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-medium text-primary hover:bg-blush-50"
                    >
                      <KeyRound className="size-4" /> View demo credentials
                    </button>
                  }
                />
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/shop" className="shrink-0">
            <img src={lcLogo} alt="Ladies Collection" className="h-9 w-auto max-w-[140px] object-contain sm:h-10" />
          </Link>

          <div ref={navRef} className="relative hidden shrink-0 items-center gap-7 lg:flex">
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              onMouseEnter={() => setCategoriesOpen(true)}
              className={cn(
                'flex items-center gap-1 whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-primary',
                (categoriesActive || categoriesOpen) && 'font-semibold text-primary',
              )}
            >
              Categories
              <ChevronDown className={cn('size-3.5 transition-transform', categoriesOpen && 'rotate-180')} />
            </button>
            {NAV_LINKS.map((link) => {
              const [to] = link.to.split('?')
              const active = location.pathname === to
              return (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={cn(
                    'whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-primary',
                    active && 'font-semibold text-primary',
                  )}
                >
                  {link.label}
                </NavLink>
              )
            })}
          </div>

          <form onSubmit={submitSearch} className="relative ml-auto hidden max-w-sm flex-1 md:block lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees, kurtis, lehengas…"
              className="h-10 rounded-full border border-border/80 bg-white pl-9 pr-4 shadow-sm"
            />
          </form>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5 md:ml-6">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate('/shop/search')} aria-label="Search">
              <Search className="size-5" />
            </Button>
            <Link to="/shop/orders/mine" className="hidden whitespace-nowrap pr-1 text-[13px] font-medium text-foreground/80 hover:text-primary xl:inline-block">
              Track order
            </Link>
            <Link to="/shop/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-full border border-border/80 bg-white shadow-sm" aria-label="Notifications">
                <Bell className="size-4" />
                {notificationDot && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />}
              </Button>
            </Link>
            <Link to={session ? '/shop/profile' : '/shop/login?redirect=/shop/profile'} className="hidden sm:inline-flex">
              {!session && (
                <Button variant="ghost" size="icon" className="rounded-full border border-border/80 bg-white shadow-sm" aria-label="Account">
                  <User className="size-4" />
                </Button>
              )}
            </Link>
            {session && (
              <div className="hidden items-center gap-1 sm:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full border border-border/80 bg-white shadow-sm" aria-label="Account">
                      <Avatar className="size-7">
                        <AvatarFallback className={cn('text-[10px] font-semibold', avatarPalette(session.profile.name))}>
                          {initials(session.profile.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="text-sm font-semibold">{session.profile.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">{session.profile.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/shop/profile')}>
                      <UserCog className="size-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/shop/orders/mine')}>
                      <Package className="size-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        logout()
                        navigate('/shop', { replace: true })
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    logout()
                    navigate('/shop', { replace: true })
                  }}
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </Button>
              </div>
            )}
            <Link to="/shop/cart">
              <Button variant="ghost" size="icon" className="relative rounded-full border border-border/80 bg-white shadow-sm" aria-label="Bag">
                <ShoppingBag className="size-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/80 bg-white/80 lg:hidden">
        <nav className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-3 sm:px-6 lg:px-10">
          <Link to="/shop/categories" className="whitespace-nowrap text-sm font-medium text-foreground/70 hover:text-primary">
            Categories
          </Link>
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} className="whitespace-nowrap text-sm font-medium text-foreground/70 hover:text-primary">
              {link.label}
            </Link>
          ))}
          <span className="ml-auto hidden whitespace-nowrap text-[13px] font-medium text-muted-foreground sm:inline-block">
            {storeProducts.length} curated pieces
          </span>
        </nav>
      </div>

      {categoriesOpen && (
        <div ref={menuRef}>
          <CategoryMegaMenu onNavigate={() => setCategoriesOpen(false)} />
        </div>
      )}
    </header>
  )
}