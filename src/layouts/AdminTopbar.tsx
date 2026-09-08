import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Search, UserCog } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUiStore } from '@/store/uiStore'
import { useAdminStore } from '@/store/appStore'
import { NotificationPanel } from '@/layouts/AdminNotificationPanel'
import { resolveTitle } from '@/layouts/admin-navigation'
import { cn } from '@/utils'

export function Topbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen)
  const setCommandOpen = useUiStore((s) => s.setCommandOpen)
  const session = useAdminStore((s) => s.session)
  const logout = useAdminStore((s) => s.logout)

  const lcLogo = new URL('../assets/Lc.png', import.meta.url).href
  const profile = session?.profile

  return (
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

      <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
        <img src={lcLogo} alt="Ladies Collection" className="h-8 w-auto max-w-[130px] object-contain" />
      </div>

      <div className="hidden min-w-0 lg:block">
        <h2 className="truncate text-sm font-semibold text-foreground">{resolveTitle(pathname)}</h2>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground sm:flex"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="size-4" />
          <span className="pr-6">Search…</span>
          <kbd className="absolute right-2 flex items-center gap-0.5 rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium">
            Ctrl K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground sm:hidden"
          onClick={() => setCommandOpen(true)}
          aria-label="Search"
        >
          <Search className="size-[18px]" />
        </Button>

        <NotificationPanel />

        {profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 rounded-lg px-1.5">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-gradient-to-br from-amber-300 to-rose-400 text-[11px] font-bold text-white">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
                <span className={cn('hidden text-sm font-medium md:block')}>{profile.name}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">{profile.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{profile.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserCog className="size-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
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
  )
}