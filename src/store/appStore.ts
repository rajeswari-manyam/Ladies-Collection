import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreProfile, TrackStep } from '@/types'
import {
  ADMIN_EMAIL,
  authenticateAdmin,
  authenticateCustomer,
  authenticateVendor,
  changePassword,
  getAllUsers,
  registerCustomer,
  registerVendor,
  updateProfile,
  type AdminSession,
  type ApiUser,
  type CustomerSession,
  type UserQuery,
  type VendorSession,
} from '@/services/auth.service'
import { registerVendor as createVendorProfile } from '@/services/vendor.service'

export { ADMIN_EMAIL }

interface AdminState {
  session: AdminSession | null
  login: (email: string, password: string) => Promise<void>
  updateProfile: (patch: { name?: string; profileImage?: string | null }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  getUsers: (query?: UserQuery) => Promise<{
    users: ApiUser[]
    total: number
    page: number
    totalPages: number
  }>
  logout: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      session: null,

      login: async (email, password) => {
        const session = await authenticateAdmin(email, password)
        set({ session })
      },

      updateProfile: async (patch) => {
        const token = get().session?.token
        if (!token) throw new Error('Sign in again to update your profile')
        const user = await updateProfile(token, patch)
        set((state) =>
          state.session
            ? {
                session: {
                  ...state.session,
                  profile: {
                    ...state.session.profile,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                  },
                },
              }
            : state,
        )
      },

      changePassword: async (currentPassword, newPassword) => {
        const token = get().session?.token
        if (!token) throw new Error('Sign in to change your password')
        await changePassword(token, { currentPassword, newPassword })
      },

      getUsers: async (query) => {
        const token = get().session?.token
        if (!token) throw new Error('Sign in to list users')
        return getAllUsers(query, token)
      },

      logout: () => set({ session: null }),
    }),
    { name: 'lc-admin-session' },
  ),
)

// -------- Vendor session --------

interface VendorState {
  session: VendorSession | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, mobile: string, password: string) => Promise<void>
  updateProfile: (patch: { name?: string }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  logout: () => void
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set, get) => ({
      session: null,

      login: async (email, password) => {
        const session = await authenticateVendor(email, password)
        set({ session })
      },

      register: async (name, email, mobile, password) => {
        const session = await registerVendor({ name, email, mobile, password })
        set({ session })
        // Every vendor-scoped API call resolves against a seller profile, so it has
        // to exist from the start or the whole portal answers 404. Real details get
        // filled in later through Business setup.
        await createVendorProfile(session.token, {
          businessName: `${name.trim()} Store`,
          ownerName: name.trim(),
          email,
          mobile,
          gstNumber: '',
          panNumber: '',
          businessAddress: { addressLine1: '', city: '', state: '', country: 'India', pincode: '' },
        }).catch((err: unknown) => {
          throw new Error(
            `Your account was created, but the seller profile could not be set up (${
              err instanceof Error ? err.message : 'unknown error'
            }). Sign in and complete Business setup.`,
          )
        })
      },

      updateProfile: async (patch) => {
        const token = get().session?.token
        if (!token) throw new Error('Sign in again to update your profile')
        const user = await updateProfile(token, patch)
        set((state) =>
          state.session
            ? {
                session: {
                  ...state.session,
                  profile: { ...state.session.profile, name: user.name, email: user.email },
                },
              }
            : state,
        )
      },

      changePassword: async (currentPassword, newPassword) => {
        const token = get().session?.token
        if (!token) throw new Error('Sign in to change your password')
        await changePassword(token, { currentPassword, newPassword })
      },

      logout: () => set({ session: null }),
    }),
    { name: 'lc-vendor-session' },
  ),
)

// -------- Customer session --------

interface AuthState {
  session: CustomerSession | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, mobile: string, password: string) => Promise<void>
  setProfile: (patch: Partial<StoreProfile>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,

      login: async (email, password) => {
        const session = await authenticateCustomer(email, password)
        set({ session })
      },

      register: async (name, email, mobile, password) => {
        const session = await registerCustomer({ name, email, mobile, password })
        set({ session })
      },

      setProfile: async (patch) => {
        const token = get().session?.token
        const updatedUser = token
          ? await updateProfile(token, { name: patch.name })
          : null
        set((state) =>
          state.session
            ? {
                session: {
                  ...state.session,
                  profile: {
                    ...state.session.profile,
                    ...patch,
                    ...(updatedUser ? { name: updatedUser.name } : {}),
                  },
                },
              }
            : state,
        )
      },

      changePassword: async (currentPassword, newPassword) => {
        const token = get().session?.token
        if (!token) throw new Error('Sign in to change your password')
        await changePassword(token, { currentPassword, newPassword })
      },

      logout: () => set({ session: null }),
    }),
    { name: 'lc-customer-session' },
  ),
)

// -------- Customer wishlist --------

interface WishlistState {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id) ? state.ids.filter((i) => i !== id) : [...state.ids, id],
        })),

      has: (id) => get().ids.includes(id),
    }),
    { name: 'lc-customer-wishlist' },
  ),
)

export type { TrackStep }