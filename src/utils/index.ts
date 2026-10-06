import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

/**
 * Coerces API-supplied values to a Date, or null when unusable. Backend dates
 * arrive as empty strings or nulls, and formatting an Invalid Date throws a
 * RangeError that unmounts the whole tree.
 */
function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
  value: string | number | Date | null | undefined,
  opts?: Intl.DateTimeFormatOptions,
  fallback = '—',
) {
  const date = toDate(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(date)
}

export function formatDateTime(
  value: string | number | Date | null | undefined,
  fallback = '—',
) {
  const date = toDate(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/**
 * The single date format used by the payment, refund and settlement module:
 * `03 Oct 2026, 02:30 PM`. Dates without a time component use `03 Oct 2026`.
 * The value always comes from the API — these formatters never create one.
 */
export function formatDateFull(
  value: string | number | Date | null | undefined,
  fallback = '—',
) {
  const date = toDate(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTimeFull(
  value: string | number | Date | null | undefined,
  fallback = '—',
) {
  const date = toDate(value)
  if (!date) return fallback
  const formatted = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  return formatted.replace(/\s*am$/i, ' AM').replace(/\s*pm$/i, ' PM')
}

/**
 * Whether a deadline the API gave us has already passed. Compares two
 * timestamps; it never produces a date to display.
 */
export function isDeadlinePassed(value: string | number | Date | null | undefined): boolean {
  const date = toDate(value)
  if (!date) return false
  return date.getTime() < Date.now()
}

/** "Return available until 10 Oct 2026", or the expired phrasing. */
export function returnWindowLabel(
  value: string | number | Date | null | undefined,
  fallback = 'Not available',
) {
  if (!toDate(value)) return fallback
  return isDeadlinePassed(value)
    ? `Return period expired on ${formatDateFull(value)}`
    : `Return available until ${formatDateFull(value)}`
}

export function timeAgo(value: string | number | Date | null | undefined, fallback = '—') {
  const date = toDate(value)
  if (!date) return fallback
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units: [number, string][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [2592000, 'day'],
    [31536000, 'month'],
  ]
  let unit = units[0]
  for (const next of units) {
    if (seconds < next[0] * 60) break
    unit = next
  }
  const count = Math.floor(seconds / unit[0])
  return `${count} ${unit[1]}${count === 1 ? '' : 's'} ago`
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const AVATAR_PALETTES = [
  'from-rose-400 to-pink-500',
  'from-fuchsia-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-violet-400 to-fuchsia-500',
  'from-amber-400 to-rose-400',
  'from-sky-400 to-indigo-400',
]

export function avatarPalette(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

export function idColor(seed: string) {
  const palettes = ['rose', 'pink', 'purple', 'violet', 'amber', 'sky', 'emerald', 'slate']
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return palettes[Math.abs(hash) % palettes.length]
}

export const COLOR_NAMES: Record<string, string> = {
  '#c2185b': 'Wine Red',
  '#1565c0': 'Royal Blue',
  '#e8eaf6': 'Ivory White',
  '#4caf50': 'Forest Green',
  '#b71c1c': 'Crimson',
  '#e6a817': 'Zari Gold',
  '#1a237e': 'Midnight Indigo',
  '#37474f': 'Charcoal Grey',
  '#f48fb1': 'Blush Pink',
  '#8d6e63': 'Tan Brown',
  '#eceff1': 'Oyster White',
  '#7cb342': 'Olive Green',
  '#7b1fa2': 'Deep Purple',
  '#c62828': 'Ruby Red',
  '#f9a825': 'Saffron',
  '#0d47a1': 'Navy Blue',
  '#ef5350': 'Coral',
  '#42a5f5': 'Sky Blue',
  '#000000': 'Black',
  '#ffe082': 'Mustard',
  '#4a148c': 'Royal Purple',
  '#880e4f': 'Maroon',
  '#0d2b1f': 'Deep Bottle Green',
  '#b26a00': 'Antique Gold',
}

export function colorName(hex: string) {
  const key = hex.trim().toLowerCase()
  return COLOR_NAMES[key] ?? key
}