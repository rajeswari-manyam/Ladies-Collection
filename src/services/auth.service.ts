import type { StoreProfile } from '@/types'
import { API_BASE_URL, apiRequest } from '@/services/http'

export const AUTH_API_BASE_URL = API_BASE_URL

export const ADMIN_EMAIL = 'admin@ladies.co'

export type UserRole = 'admin' | 'customer' | 'vendor'
export type UserStatus = 'active' | 'blocked'

export interface ApiUser {
  _id: string
  name: string
  email: string
  mobile: string
  role: UserRole
  status: UserStatus
  profileImage: string | null
  isEmailVerified: boolean
  isMobileVerified: boolean
  pushEnabled: boolean
  resetPasswordOtpExpires?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AuthResult {
  user: ApiUser
  token: string
  signedInAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterCustomerInput {
  name: string
  email: string
  mobile: string
  password: string
}

export interface RegisterInput extends RegisterCustomerInput {
  role?: UserRole
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileInput {
  name?: string
  profileImage?: string | null
}

export interface UserQuery {
  page?: number
  limit?: number
  role?: UserRole
}

export interface PaginatedUsers {
  users: ApiUser[]
  total: number
  page: number
  totalPages: number
}

export interface AdminProfile {
  id: string
  name: string
  email: string
  role: string
  initials: string
  profileImage: string | null
}

export interface AdminSession {
  profile: AdminProfile
  token: string
  signedInAt: string
}

export interface VendorSessionProfile {
  id: string
  name: string
  businessName: string
  vendorId: string
  email: string
  role: string
  initials: string
}

export interface VendorSession {
  profile: VendorSessionProfile
  token: string
  signedInAt: string
}

export interface CustomerSession {
  profile: StoreProfile
  email: string
  token: string
  signedInAt: string
}

function roleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Marketplace Admin'
    case 'vendor':
      return 'Vendor'
    case 'customer':
      return 'Customer'
  }
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function assertRole(user: ApiUser, role: UserRole) {
  if (user.role !== role) {
    throw new Error(`This account is not registered as ${role}`)
  }
}

function toStoreProfile(user: ApiUser): StoreProfile {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    city: '',
    joined: (user.createdAt ?? new Date().toISOString()).slice(0, 10),
    membersTier: 'Member',
    ordersCount: 0,
    wishlistCount: 0,
    coupons: 0,
    hue: 336,
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const data = await apiRequest<AuthResult>({ method: 'POST', url: '/auth/login', data: input })
  return { ...data, signedInAt: new Date().toISOString() }
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const data = await apiRequest<AuthResult>({ method: 'POST', url: '/auth/register', data: input })
  return { ...data, signedInAt: new Date().toISOString() }
}

export async function changePassword(token: string, input: ChangePasswordInput): Promise<void> {
  await apiRequest<unknown>({ method: 'PUT', url: '/auth/change-password', data: input, token })
}

export async function getProfile(token: string): Promise<ApiUser> {
  return apiRequest<ApiUser>({ method: 'GET', url: '/auth/profile', token })
}

export async function updateProfile(token: string, input: UpdateProfileInput): Promise<ApiUser> {
  return apiRequest<ApiUser>({ method: 'PUT', url: '/api/auth/profile', data: input, token })
}

export async function getAllUsers(query: UserQuery = {}, token: string): Promise<PaginatedUsers> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.role) params.set('role', query.role)
  const qs = params.toString()
  return apiRequest<PaginatedUsers>({
    method: 'GET',
    url: qs ? `/getallusers?${qs}` : '/getallusers',
    token,
  })
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminSession> {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
    throw new Error(`Admin access is only available for ${ADMIN_EMAIL}`)
  }
  const { user, token, signedInAt } = await login({ email, password })
  assertRole(user, 'admin')
  return {
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: roleLabel(user.role),
      initials: initialsOf(user.name),
      profileImage: user.profileImage,
    },
    token,
    signedInAt,
  }
}

export async function authenticateVendor(email: string, password: string): Promise<VendorSession> {
  const { user, token, signedInAt } = await login({ email, password })
  assertRole(user, 'vendor')
  return {
    profile: {
      id: user._id,
      name: user.name,
      businessName: `${user.name} Store`,
      vendorId: `VEN-${String(user._id).slice(-4).toUpperCase()}`,
      email: user.email,
      role: roleLabel(user.role),
      initials: initialsOf(user.name),
    },
    token,
    signedInAt,
  }
}

export async function authenticateCustomer(email: string, password: string): Promise<CustomerSession> {
  const { user, token, signedInAt } = await login({ email, password })
  assertRole(user, 'customer')
  return { profile: toStoreProfile(user), email: user.email, token, signedInAt }
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<CustomerSession> {
  const { user, token, signedInAt } = await register({ ...input, role: 'customer' })
  return { profile: toStoreProfile(user), email: user.email, token, signedInAt }
}

export async function registerVendor(input: RegisterCustomerInput): Promise<VendorSession> {
  const { user, token, signedInAt } = await register({ ...input, role: 'vendor' })
  return {
    profile: {
      id: user._id,
      name: user.name,
      businessName: `${user.name} Store`,
      vendorId: `VEN-${String(user._id).slice(-4).toUpperCase()}`,
      email: user.email,
      role: roleLabel(user.role),
      initials: initialsOf(user.name),
    },
    token,
    signedInAt,
  }
}