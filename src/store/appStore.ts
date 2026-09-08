import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, StoreProfile, TrackStep } from '@/types'
import {
  ADMIN_EMAIL,
  VENDOR_EMAIL,
  authenticateAdmin,
  authenticateCustomer,
  authenticateVendor,
  registerCustomer,
  type AdminSession,
  type CustomerSession,
  type VendorSession,
} from '@/services/auth.service'

export { ADMIN_EMAIL, VENDOR_EMAIL }

interface AdminState {
  session: AdminSession | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      session: null,

      login: async (email, password) => {
        const session = await authenticateAdmin(email, password)
        set({ session })
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
  logout: () => void
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set) => ({
      session: null,

      login: async (email, password) => {
        const session = await authenticateVendor(email, password)
        set({ session })
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
  setProfile: (patch: Partial<StoreProfile>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,

      login: async (email, password) => {
        const session = await authenticateCustomer(email, password)
        set({ session })
      },

      register: async (name, email, mobile, password) => {
        const session = await registerCustomer({ name, email, mobile, password })
        set({ session })
      },

      setProfile: (patch) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, profile: { ...state.session.profile, ...patch } } }
            : state,
        ),

      logout: () => set({ session: null }),
    }),
    { name: 'lc-customer-session' },
  ),
)

// -------- Customer cart --------

interface CartState {
  items: CartItem[]
  couponCode: string | null
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clear: () => void
  applyCoupon: (code: string) => boolean
  clearCoupon: () => void
}

export function cartItemKey(item: Pick<CartItem, 'productId' | 'size' | 'color'>) {
  return `${item.productId}__${item.size}__${item.color}`
}

const COUPON_APPLICABLE = new Set(['LC100', 'LC10'])

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,

      addItem: (item) =>
        set((state) => {
          const key = cartItemKey(item)
          const existing = state.items.find((i) => cartItemKey(i) === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartItemKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            }
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter((i) => cartItemKey(i) !== cartItemKey({ productId, size, color })),
        })),

      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            cartItemKey(i) === cartItemKey({ productId, size, color }) ? { ...i, quantity } : i,
          ),
        })),

      clear: () => set({ items: [], couponCode: null }),

      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase()
        if (!COUPON_APPLICABLE.has(normalized)) return false
        set({ couponCode: normalized })
        return true
      },

      clearCoupon: () => set({ couponCode: null }),
    }),
    { name: 'lc-customer-cart' },
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