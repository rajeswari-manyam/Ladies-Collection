export const FREE_SHIPPING_AT = 1499
export const SHIPPING_FLAT = 49
export const COD_FEE = 20
export const COUPON_DISCOUNT: Record<string, number> = { LC100: 100, LC10: 10 }

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