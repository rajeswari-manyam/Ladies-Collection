import { useMemo } from 'react'
import { storeProductById } from '@/features/customer/products/data/products'
import { useCartStore } from '@/store/appStore'

export const FREE_SHIPPING_AT = 1499
export const SHIPPING_FLAT = 49
export const COD_FEE = 20
export const COUPON_DISCOUNT: Record<string, number> = { LC100: 100, LC10: 10 }

export function useCartTotals() {
  const items = useCartStore((s) => s.items)
  const couponCode = useCartStore((s) => s.couponCode)

  return useMemo(() => {
    const enriched = items
      .map((item) => ({ item, product: storeProductById(item.productId) }))
      .filter((x): x is { item: (typeof items)[number]; product: NonNullable<ReturnType<typeof storeProductById>> } => Boolean(x.product))

    const subtotal = enriched.reduce((s, x) => s + x.item.unitPrice * x.item.quantity, 0)
    const mrpTotal = enriched.reduce((s, x) => s + (x.product?.mrp ?? x.item.unitPrice) * x.item.quantity, 0)
    const discount = Math.max(0, mrpTotal - subtotal)
    const couponValue = couponCode ? COUPON_DISCOUNT[couponCode] ?? 0 : 0
    const shipping =
      enriched.length === 0 ? 0 : subtotal - discount - couponValue >= FREE_SHIPPING_AT ? 0 : SHIPPING_FLAT
    const total = Math.max(0, subtotal - discount - couponValue + shipping)

    return { items, enriched, subtotal, mrpTotal, discount, couponValue, couponCode, shipping, total }
  }, [items, couponCode])
}