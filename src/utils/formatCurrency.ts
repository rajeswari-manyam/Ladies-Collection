export function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatINR(value: number, compact = false) {
  return formatCurrency(value, compact)
}

export function discountPercent(mrp: number, price: number) {
  if (mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}