import { NavLink } from 'react-router-dom'
import { ChevronsLeft, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils'

const lcLogo = new URL('../assets/Lc.png', import.meta.url).href

export interface SidebarLink {
  title: string
  to: string
  icon: LucideIcon
}

export interface SidebarSection {
  title: string
  items: SidebarLink[]
}

interface SidebarProps {
  sections: SidebarSection[]
  footer?: {
    title: string
    subtitle: string
    initials: string
    onSignOut?: () => void
  }
  variant?: 'desktop' | 'mobile'
}

export function Sidebar({ sections, footer, variant = 'desktop' }: SidebarProps) {
  const collapsed = useUiStore((s) => s.desktopSidebarCollapsed)
  const toggleCollapsed = useUiStore((s) => s.toggleDesktopSidebar)
  const isDesktop = variant === 'desktop'

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-border/70 bg-background',
        isDesktop && collapsed && 'w-[4.5rem]',
        isDesktop && !collapsed && 'w-64',
      )}
      data-collapsed={isDesktop ? collapsed : undefined}
    >
      <div className={cn('flex h-16 shrink-0 items-center gap-2.5 border-b border-border/70 px-4', collapsed && isDesktop && 'justify-center px-0')}>
        <img src={lcLogo} alt="Ladies Collection" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
        {(!collapsed || !isDesktop) && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">Ladies Collection</p>
            <p className="truncate text-[11px] font-medium text-muted-foreground">Admin Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title}>
            {(!collapsed || !isDesktop) && (
              <p className="mb-1.5 truncate px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      aria-label={item.title}
                      title={isDesktop && collapsed ? item.title : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors',
                          'hover:bg-blush-100/70 hover:text-foreground',
                          isActive && 'bg-rose-50 font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-600',
                          isDesktop && collapsed && 'justify-center px-0',
                        )
                      }
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {(!collapsed || !isDesktop) && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-border/70 p-3">
        {footer && (
          <div className={cn('flex items-center gap-2.5', collapsed && isDesktop && 'justify-center')}>
            <NavLink
              to="/profile"
              title="View profile"
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 items-center gap-2.5 rounded-lg transition-colors hover:bg-blush-100/70',
                  isActive && 'bg-blush-100/70',
                )
              }
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-xs font-bold text-white shadow-sm">
                {footer.initials}
              </div>
              {(!collapsed || !isDesktop) && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{footer.title}</p>
                  <p className="truncate text-[11px] leading-tight text-muted-foreground">{footer.subtitle}</p>
                </div>
              )}
            </NavLink>
            {footer.onSignOut && (!collapsed || !isDesktop) && (
              <button
                type="button"
                onClick={footer.onSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        )}
        {footer?.onSignOut && collapsed && isDesktop && (
          <button
            type="button"
            onClick={footer.onSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
          </button>
        )}
        {isDesktop && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/70 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronsLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  )
}