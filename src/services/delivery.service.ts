import { FREE_SHIPPING_AT, SHIPPING_FLAT } from '@/utils/constants'

/**
 * The API has no delivery-rate endpoint, so the charge is derived on the client from
 * the pincode the customer is delivering to. The backend still authorises the final
 * amount when the order is created, so treat everything here as a preview.
 */

/** Pincodes we do not courier to. Fill from your courier's unserviceable list. */
export const UNSERVICEABLE_PINCODE_PREFIXES: string[] = []

/** Pincodes charged the extended rate (hills, islands, north-east). */
export const REMOTE_PINCODE_PREFIXES: string[] = []

export const REMOTE_DELIVERY_FEE = 99

export type DeliveryZone = 'standard' | 'remote' | 'unserviceable' | 'unknown'

export interface DeliveryEstimate {
  zone: DeliveryZone
  /** `null` when the pincode is missing or cannot be rated, so no fee is invented. */
  fee: number | null
  isFree: boolean
  /** Subtotal still required to unlock free delivery, or `0` when already free. */
  freeDeliveryGap: number
}

function matchesPrefix(pincode: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pincode.startsWith(prefix))
}

/** India uses 6-digit pincodes; anything else cannot be rated. */
export function isRateablePincode(pincode: string | undefined | null): boolean {
  return /^[1-9]\d{5}$/.test((pincode ?? '').trim())
}

export function deliveryZone(pincode: string | undefined | null): DeliveryZone {
  const code = (pincode ?? '').trim()
  if (!isRateablePincode(code)) return 'unknown'
  if (matchesPrefix(code, UNSERVICEABLE_PINCODE_PREFIXES)) return 'unserviceable'
  if (matchesPrefix(code, REMOTE_PINCODE_PREFIXES)) return 'remote'
  return 'standard'
}

/**
 * Delivery charge for `subtotal` to `pincode`: free once the basket clears the
 * threshold, otherwise the flat or remote rate for that zone.
 */
export function estimateDelivery(subtotal: number, pincode: string | undefined | null): DeliveryEstimate {
  const zone = deliveryZone(pincode)
  const amount = Math.max(0, subtotal ?? 0)

  if (zone === 'unserviceable') {
    return { zone, fee: null, isFree: false, freeDeliveryGap: 0 }
  }
  if (zone === 'unknown') {
    return { zone, fee: null, isFree: false, freeDeliveryGap: 0 }
  }
  if (amount >= FREE_SHIPPING_AT) {
    return { zone, fee: 0, isFree: true, freeDeliveryGap: 0 }
  }
  return {
    zone,
    fee: zone === 'remote' ? REMOTE_DELIVERY_FEE : SHIPPING_FLAT,
    isFree: false,
    freeDeliveryGap: FREE_SHIPPING_AT - amount,
  }
}
