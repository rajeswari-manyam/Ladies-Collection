import { apiRequest } from '@/services/http'

export interface ApiVendorAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  pincode: string
}

export interface ApiVendorBankDetails {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
}

export interface ApiVendorProfile {
  _id: string
  userId: string | { _id: string; name?: string; email?: string; mobile?: string; status?: string }
  businessName: string
  ownerName: string
  email: string
  mobile: string
  businessAddress: ApiVendorAddress
  gstNumber: string
  panNumber: string
  logo: string | null
  status: string
  verificationStatus: string
  bankDetails: ApiVendorBankDetails
  createdAt?: string
  updatedAt?: string
}

export interface VendorRegisterInput {
  businessName: string
  ownerName: string
  email: string
  mobile: string
  businessAddress: ApiVendorAddress
  gstNumber: string
  panNumber: string
}

export type VendorProfilePatch = Partial<
  Pick<VendorRegisterInput, 'businessName' | 'ownerName' | 'email' | 'mobile'> & {
    logo?: string | null
    gstNumber?: string
    panNumber?: string
    businessAddress?: ApiVendorAddress
  }
>

export interface VendorDashboardResponse {
  vendor: ApiVendorProfile
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalRevenue: number
}

export interface VendorQuery {
  page?: number
  limit?: number
  verificationStatus?: string
}

export interface PaginatedVendors {
  vendors: ApiVendorProfile[]
  total: number
  page: number
  totalPages: number
}

export function registerVendor(token: string, input: VendorRegisterInput): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'POST', url: '/vendorregister', data: input, token })
}

export function getVendorProfile(token: string): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'GET', url: '/getvendorprofile', token })
}

export function updateVendorProfile(token: string, input: VendorProfilePatch): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'PUT', url: '/updatevendorprofile', data: input, token })
}

export function updateVendorBankDetails(token: string, bank: ApiVendorBankDetails): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'PUT', url: '/updatevendorbank-details', data: bank, token })
}

export function getVendorDashboard(token: string): Promise<VendorDashboardResponse> {
  return apiRequest<VendorDashboardResponse>({ method: 'GET', url: '/getvendordashboard', token })
}

export function getAllVendors(token: string, query: VendorQuery = {}): Promise<PaginatedVendors> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.verificationStatus) params.set('verificationStatus', query.verificationStatus)
  const qs = params.toString()
  return apiRequest<PaginatedVendors>({
    method: 'GET',
    url: qs ? `/getallvendors?${qs}` : '/getallvendors',
    token,
  })
}

export function getVendorById(token: string, id: string): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'GET', url: `/getvendorById/${id}`, token })
}

export function approveVendor(token: string, id: string): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'PUT', url: `/vendor/${id}/approve`, token })
}

export function rejectVendor(token: string, id: string): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'PUT', url: `/vendor/${id}/reject`, token })
}

export function updateVendorStatus(token: string, id: string, status: string): Promise<ApiVendorProfile> {
  return apiRequest<ApiVendorProfile>({ method: 'PUT', url: `/vendor/${id}/status`, data: { status }, token })
}