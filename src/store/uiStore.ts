import { create } from 'zustand'

interface UiState {
  desktopSidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  notificationPanelOpen: boolean
  commandOpen: boolean
  toggleDesktopSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
  setNotificationPanelOpen: (open: boolean) => void
  setCommandOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  desktopSidebarCollapsed: false,
  mobileSidebarOpen: false,
  notificationPanelOpen: false,
  commandOpen: false,
  toggleDesktopSidebar: () =>
    set((s) => ({ desktopSidebarCollapsed: !s.desktopSidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  setCommandOpen: (open) => set({ commandOpen: open }),
}))