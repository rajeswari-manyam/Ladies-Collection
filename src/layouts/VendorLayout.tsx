import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useUiStore } from '@/store/uiStore'
import { useVendorStore } from '@/store/appStore'
import { VendorNotificationPanel } from '@/layouts/VendorNotificationPanel'
import { resolveVendorTitle, vendorNavSections } from '@/layouts/vendor-navigation'
import { cn } from '@/utils'

export function VendorShell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen)
  const session = useVendorStore((s) => s.session)
  const logout = useVendorStore((s) => s.logout)

  if (!session) {
    return <Navigate to="/vendor/login" state={{ from: pathname }} replace />
  }

  const lcLogo = new URL('../assets/Lc.png', import.meta.url).href
  const profile = session.profile

  const nav = (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {vendorNavSections.map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/vendor'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors',
                        'hover:bg-blush-100/70 hover:text-foreground',
                        isActive && 'bg-rose-50 font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-600',
                      )
                    }
                  >
                    <Icon className="size-[18px] shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  const brand = (
    <div className="flex min-w-0 items-center">
      <img src={lcLogo} alt="Ladies Collection" className="h-8 w-auto max-w-[150px] object-contain" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-muted/25">
      <div className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-background lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/70 px-4">
          {brand}
        </div>
        {nav}
        {profile && (
          <div className="space-y-2 border-t border-border/70 p-3">
            <div className="flex items-center gap-2.5">
              <NavLink
                to="/vendor/profile"
                title="View profile"
                className={({ isActive }) =>
                  cn(
                    'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg transition-colors hover:bg-blush-100/70',
                    isActive && 'bg-blush-100/70',
                  )
                }
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-xs font-bold text-white shadow-sm">
                  {profile.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{profile.name}</p>
                  <p className="truncate text-[11px] leading-tight text-muted-foreground">{profile.businessName}</p>
                </div>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/vendor/login', { replace: true })
                }}
                aria-label="Sign out"
                title="Sign out"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2.5 lg:hidden">{brand}</div>
          <h2 className="hidden min-w-0 truncate text-sm font-semibold lg:block">{resolveVendorTitle(pathname)}</h2>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {profile && <Badge variant="rose" className="hidden sm:inline-flex">{profile.vendorId}</Badge>}
            <VendorNotificationPanel />
            {profile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 rounded-lg px-1.5">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-gradient-to-br from-amber-300 to-rose-400 text-[11px] font-bold text-white">
                        {profile.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium md:block">{profile.name}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">{profile.businessName}</p>
                    <p className="text-xs font-normal text-muted-foreground">{profile.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      logout()
                      navigate('/vendor/login', { replace: true })
                    }}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col bg-background">
            <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/70 px-4">{brand}</div>
            {nav}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}