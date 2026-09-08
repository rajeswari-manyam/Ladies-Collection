import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/layouts/AdminSidebar'
import { Topbar } from '@/layouts/AdminTopbar'
import { CommandPalette } from '@/layouts/AdminCommandPalette'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useUiStore } from '@/store/uiStore'
import { useAdminStore } from '@/store/appStore'
import { navSections } from '@/layouts/admin-navigation'

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen)
  const session = useAdminStore((s) => s.session)
  const logout = useAdminStore((s) => s.logout)

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const profile = session.profile
  const footer = profile
    ? {
        title: profile.name,
        subtitle: profile.role,
        initials: profile.initials,
        onSignOut: () => {
          logout()
          navigate('/login', { replace: true })
        },
      }
    : undefined

  return (
    <div className="flex min-h-screen bg-muted/25">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar sections={navSections} footer={footer} />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <CommandPalette />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar variant="mobile" sections={navSections} footer={footer} />
        </SheetContent>
      </Sheet>
    </div>
  )
}