import type { StoreProfile } from '@/types'
import { delay } from '@/utils/mock-helpers'
import { ananya } from '@/features/customer/data/account'

export const ADMIN_EMAIL = 'admin@ladiescollection.demo'
export const VENDOR_EMAIL = 'priya@fashiontrends.demo'

export interface AdminProfile {
  name: string
  email: string
  role: string
  initials: string
}

export interface AdminSession {
  profile: AdminProfile
  signedInAt: string
}

export interface VendorSessionProfile {
  name: string
  businessName: string
  vendorId: string
  email: string
  role: string
  initials: string
}

export interface VendorSession {
  profile: VendorSessionProfile
  signedInAt: string
}

export interface CustomerSession {
  profile: StoreProfile
  email: string
  signedInAt: string
}

export interface RegisterCustomerInput {
  name: string
  email: string
  mobile: string
  password: string
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminSession> {
  await delay(700)
  const validEmail = email.trim().toLowerCase()
  if (validEmail !== ADMIN_EMAIL) {
    throw new Error('No admin account found for this email')
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  return {
    profile: {
      name: 'Adriana Moreau',
      email: ADMIN_EMAIL,
      role: 'Marketplace Admin',
      initials: 'AM',
    },
    signedInAt: new Date().toISOString(),
  }
}

export async function authenticateVendor(email: string, password: string): Promise<VendorSession> {
  await delay(700)
  const validEmail = email.trim().toLowerCase()
  if (validEmail !== VENDOR_EMAIL) {
    throw new Error('No vendor account found for this email')
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  return {
    profile: {
      name: 'Priya Sharma',
      businessName: 'Fashion Trends',
      vendorId: 'VEN-1024',
      email: VENDOR_EMAIL,
      role: 'Vendor',
      initials: 'PS',
    },
    signedInAt: new Date().toISOString(),
  }
}

export async function authenticateCustomer(email: string, password: string): Promise<CustomerSession> {
  await delay(700)
  const validEmail = email.trim().toLowerCase()
  if (validEmail !== ananya.email) {
    throw new Error('No account found for this email')
  }
  if (!password || password.length < 4) {
    throw new Error('Incorrect password. Please try again')
  }
  return { profile: ananya, email: validEmail, signedInAt: new Date().toISOString() }
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<CustomerSession> {
  await delay(800)
  const { name, email, mobile, password } = input
  const normalizedEmail = email.trim().toLowerCase()
  if (!name.trim() || !normalizedEmail || !mobile.trim().replace(/\D/g, '')) {
    throw new Error('Please fill in your details')
  }
  if (normalizedEmail === ananya.email) {
    throw new Error('An account with this email already exists')
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  return {
    profile: { ...ananya, name: name.trim(), email: normalizedEmail, mobile: mobile.trim() },
    email: normalizedEmail,
    signedInAt: new Date().toISOString(),
  }
}