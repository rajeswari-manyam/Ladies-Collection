import { apiRequest } from '@/services/http'
import type { StoreAddress } from '@/types'

export type AddressType = 'home' | 'work' | 'other'

export interface ApiAddress {
  _id: string
  userId: string
  fullName: string
  mobile: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  pincode: string
  landmark: string
  addressType: AddressType
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAddressInput {
  fullName: string
  mobile: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country?: string
  pincode: string
  landmark?: string
  addressType: AddressType
  isDefault: boolean
}

export type UpdateAddressInput = Partial<CreateAddressInput>

const TYPE_LABELS: Record<AddressType, string> = {
  home: 'Home',
  work: 'Work',
  other: 'Other',
}

export function addressTypeLabel(type: AddressType): string {
  return TYPE_LABELS[type] ?? 'Home'
}

export function toStoreAddress(a: ApiAddress): StoreAddress {
  return {
    id: a._id,
    label: addressTypeLabel(a.addressType ?? 'other'),
    name: a.fullName,
    phone: a.mobile,
    line1: a.addressLine1,
    line2: a.addressLine2 ?? '',
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    isDefault: Boolean(a.isDefault),
  }
}

export async function getAddresses(token: string): Promise<ApiAddress[]> {
  const data = await apiRequest<ApiAddress[]>({ method: 'GET', url: '/getalladdress', token })
  return (data ?? []) as ApiAddress[]
}

export async function createAddress(token: string, input: CreateAddressInput): Promise<ApiAddress> {
  return apiRequest<ApiAddress>({ method: 'POST', url: '/createaddress', data: input, token })
}

export async function updateAddress(
  token: string,
  id: string,
  patch: UpdateAddressInput,
): Promise<ApiAddress> {
  return apiRequest<ApiAddress>({ method: 'PUT', url: `/updateaddressById/${id}`, data: patch, token })
}

export async function deleteAddress(token: string, id: string): Promise<ApiAddress> {
  return apiRequest<ApiAddress>({ method: 'DELETE', url: `/deleteaddressById/${id}`, token })
}

export async function setDefaultAddress(token: string, id: string): Promise<ApiAddress> {
  return apiRequest<ApiAddress>({ method: 'PUT', url: `/address/${id}/set-default`, data: {}, token })
}