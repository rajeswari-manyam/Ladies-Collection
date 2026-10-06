import { useMemo } from 'react'
import { useVendorStore } from '@/store/appStore'
import type { VendorParty } from '@/features/returns/types'
import { DEMO_VENDORS } from '@/features/returns/demo-data'

/**
 * The vendor whose rows the seller portal shows.
 *
 * The demo workspace is local state, so the signed-in seller's name is matched
 * against the seeded vendors by name; anything else falls back to the first
 * vendor rather than showing an empty portal. Once the endpoints exist this
 * becomes the vendor id the API scopes by.
 */
export function useVendorScope(): VendorParty {
  const vendorName = useVendorStore((state) => state.session?.profile.name)

  return useMemo(() => {
    const match = DEMO_VENDORS.find((vendor) => vendor.name.toLowerCase() === vendorName?.trim().toLowerCase())
    return match ?? DEMO_VENDORS[0]
  }, [vendorName])
}