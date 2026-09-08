import type { Product, ProductStatus, ProductVariant } from '@/features/admin/types'
import { vendors } from '@/features/admin/vendors/data/vendors'

interface ProductSeed {
  name: string
  subcategoryId: string
  vendorId: string
  price: number
  compareAtPrice?: number | null
  color: string
  stock: number
  status?: ProductStatus
  rating?: number
  reviews?: number
  sold?: number
  tags: string[]
  featured?: boolean
  createdAt: string
}

const categoryOf = (subcategoryId: string) => subcategoryId.split('-')[1]

function makeProduct(
  id: string,
  seed: ProductSeed,
  index: number,
): Product {
  return {
    id,
    name: seed.name,
    brand: vendors.find((v) => v.id === seed.vendorId)?.brand ?? 'Ladies Collection',
    description: `${seed.name} — a curated piece with premium finishing, designed to flatter every silhouette. Part of the Ladies Collection marketplace edit.`,
    price: seed.price * 8,
    compareAtPrice: seed.compareAtPrice == null ? null : seed.compareAtPrice * 8,
    categoryId: 'cat-' + categoryOf(seed.subcategoryId),
    subcategoryId: seed.subcategoryId,
    vendorId: seed.vendorId,
    color: seed.color,
    rating: seed.rating ?? 4.5,
    reviews: seed.reviews ?? 12 + index * 3,
    sold: seed.sold ?? 40 + index * 9,
    stock: seed.stock,
    status: seed.status ?? 'active',
    featured: seed.featured ?? false,
    tags: seed.tags,
    createdAt: seed.createdAt,
  }
}

const seeds: [string, ProductSeed][] = [
  ['prd-001', { name: 'Rosette Silk Slip Dress', subcategoryId: 'sub-drs-midi', vendorId: 'ven-rose', price: 189, compareAtPrice: 240, color: 'Blush Rose', stock: 42, rating: 4.9, reviews: 214, sold: 512, tags: ['silk', 'best-seller', 'occasion'], featured: true, createdAt: '2025-11-02' }],
  ['prd-002', { name: 'Velvet Vogue Lace Front Corset', subcategoryId: 'sub-lin-lace', vendorId: 'ven-velvet', price: 94, color: 'Merlot', stock: 67, rating: 4.8, reviews: 172, sold: 430, tags: ['lace', 'lingerie'], featured: true, createdAt: '2025-12-14' }],
  ['prd-003', { name: 'Mira Bloom Silk Wrap Blouse', subcategoryId: 'sub-top-silk', vendorId: 'ven-mira', price: 118, compareAtPrice: 145, color: 'Ivory', stock: 88, rating: 4.7, reviews: 148, sold: 391, tags: ['silk', 'workwear'], featured: true, createdAt: '2025-10-21' }],
  ['prd-004', { name: 'Opal & Ivory Pearl Drop Earrings', subcategoryId: 'sub-jew-ear', vendorId: 'ven-opal', price: 64, color: 'Gold Pearl', stock: 124, rating: 4.9, reviews: 96, sold: 289, tags: ['pearls', 'gift'], createdAt: '2026-01-05' }],
  ['prd-005', { name: 'Velvet Vogue Satin Pajama Set', subcategoryId: 'sub-lin-night', vendorId: 'ven-velvet', price: 132, compareAtPrice: 160, color: 'Champagne', stock: 54, rating: 4.8, reviews: 130, sold: 366, tags: ['satin', 'sleepwear'], featured: true, createdAt: '2026-02-02' }],
  ['prd-006', { name: 'Rosette Pleated Maxi Dress', subcategoryId: 'sub-drs-maxi', vendorId: 'ven-rose', price: 165, color: 'Champagne', stock: 36, rating: 4.7, reviews: 152, sold: 278, tags: ['maxi', 'summer', 'occasion'], createdAt: '2026-03-11' }],
  ['prd-007', { name: 'Lina Toscana Leather Tote', subcategoryId: 'sub-bag-hand', vendorId: 'ven-lina', price: 248, compareAtPrice: 310, color: 'Tan', stock: 29, rating: 4.8, reviews: 88, sold: 145, tags: ['leather', 'handbag', 'luxury'], featured: true, createdAt: '2025-12-01' }],
  ['prd-008', { name: 'Serafine Cashmere Longline Coat', subcategoryId: 'sub-out-coat', vendorId: 'ven-serafine', price: 385, color: 'Oat', stock: 18, rating: 4.9, reviews: 76, sold: 132, tags: ['cashmere', 'winter'], createdAt: '2025-09-19' }],
  ['prd-009', { name: 'Noir Floral High-Waist Trouser', subcategoryId: 'sub-bot-trou', vendorId: 'ven-noir', price: 128, color: 'Charcoal', stock: 73, rating: 4.6, reviews: 121, sold: 249, tags: ['tailored', 'workwear'], createdAt: '2026-02-17' }],
  ['prd-010', { name: 'Ember & Lace Block Heel Sandal', subcategoryId: 'sub-foot-heels', vendorId: 'ven-ember', price: 112, compareAtPrice: 139, color: 'Nude', stock: 61, rating: 4.5, reviews: 94, sold: 217, tags: ['heels', 'summer'], createdAt: '2026-04-03' }],
  ['prd-011', { name: 'Opal & Ivory Tennis Bracelet', subcategoryId: 'sub-jew-ring', vendorId: 'ven-opal', price: 158, color: 'Silver', stock: 47, rating: 4.8, reviews: 67, sold: 174, tags: ['bracelet', 'gift'], createdAt: '2026-01-24' }],
  ['prd-012', { name: 'Mira Bloom Puff Sleeve Blouse', subcategoryId: 'sub-top-tees', vendorId: 'ven-mira', price: 82, color: 'Sky', stock: 95, rating: 4.6, reviews: 133, sold: 311, tags: ['blouse', 'trending'], createdAt: '2026-05-09' }],
  ['prd-013', { name: 'Rosette Off-Shoulder Gown', subcategoryId: 'sub-drs-evening', vendorId: 'ven-rose', price: 295, compareAtPrice: 360, color: 'Midnight', stock: 14, rating: 4.9, reviews: 58, sold: 96, tags: ['gown', 'occasion', 'evening'], featured: true, createdAt: '2025-10-05' }],
  ['prd-014', { name: 'Lina Silk Knot Scarf', subcategoryId: 'sub-bag-scarf', vendorId: 'ven-lina', price: 74, color: 'Rouge', stock: 118, rating: 4.7, reviews: 101, sold: 268, tags: ['silk', 'accessory'], createdAt: '2026-03-28' }],
  ['prd-015', { name: 'Velvet Vogue Balconette Bra', subcategoryId: 'sub-lin-ess', vendorId: 'ven-velvet', price: 58, color: 'Vanilla', stock: 132, rating: 4.7, reviews: 215, sold: 489, tags: ['essentials', 'best-seller'], createdAt: '2026-01-11' }],
  ['prd-016', { name: 'Serafine Tailored Wool Blazer', subcategoryId: 'sub-out-blaze', vendorId: 'ven-serafine', price: 219, color: 'Camel', stock: 26, rating: 4.6, reviews: 71, sold: 121, tags: ['blazer', 'workwear'], createdAt: '2025-11-30' }],
  ['prd-017', { name: 'Noir Floral Pleated Midi Skirt', subcategoryId: 'sub-bot-midi', vendorId: 'ven-noir', price: 96, compareAtPrice: 120, color: 'Sage', stock: 57, rating: 4.5, reviews: 86, sold: 202, tags: ['skirt', 'summer'], createdAt: '2026-05-21' }],
  ['prd-018', { name: 'Ember & Lace Ankle Boot', subcategoryId: 'sub-foot-boot', vendorId: 'ven-ember', price: 174, color: 'Espresso', stock: 44, rating: 4.4, reviews: 63, sold: 158, tags: ['boots', 'winter'], createdAt: '2025-10-28' }],
  ['prd-019', { name: 'Rosette Floral Chiffon Midi', subcategoryId: 'sub-drs-midi', vendorId: 'ven-rose', price: 148, color: 'Coral', stock: 33, rating: 4.6, reviews: 98, sold: 231, tags: ['chiffon', 'spring'], createdAt: '2026-06-14' }],
  ['prd-020', { name: 'Mira Bloom Ribbed Knit Top', subcategoryId: 'sub-top-crop', vendorId: 'ven-mira', price: 54, color: 'Oat', stock: 108, rating: 4.4, reviews: 144, sold: 356, tags: ['knit', 'everyday'], createdAt: '2026-07-02' }],
  ['prd-021', { name: 'Lina Structured Mini Clutch', subcategoryId: 'sub-bag-clutch', vendorId: 'ven-lina', price: 138, compareAtPrice: 170, color: 'Ruby', stock: 51, rating: 4.6, reviews: 54, sold: 119, tags: ['clutch', 'evening'], createdAt: '2026-02-25' }],
  ['prd-022', { name: 'Opal & Ivory Initial Pendant Necklace', subcategoryId: 'sub-jew-neck', vendorId: 'ven-opal', price: 96, color: 'Gold', stock: 89, rating: 4.7, reviews: 83, sold: 205, tags: ['necklace', 'gift', 'personalized'], createdAt: '2026-04-20' }],
  ['prd-023', { name: 'Ember & Lace Leopard Flat', subcategoryId: 'sub-foot-flats', vendorId: 'ven-ember', price: 89, color: 'Leopard', stock: 66, rating: 4.3, reviews: 77, sold: 186, tags: ['flats', 'trending'], createdAt: '2026-06-30' }],
  ['prd-024', { name: 'Serafine Belted Trench', subcategoryId: 'sub-out-jack', vendorId: 'ven-serafine', price: 242, compareAtPrice: 289, color: 'Stone', stock: 21, rating: 4.7, reviews: 49, sold: 108, tags: ['trench', 'classic'], createdAt: '2026-02-09' }],
]

export const products: Product[] = seeds.map(([id, seed], index) => makeProduct(id, seed, index))

const variantSets: Record<string, [string, string, string, number, number][]> = {
  'prd-001': [['Blush / S', 'S', 'Blush Rose', 189, 12], ['Blush / M', 'M', 'Blush Rose', 189, 18], ['Blush / L', 'L', 'Blush Rose', 189, 12]],
  'prd-002': [['Merlot / S', 'S', 'Merlot', 94, 22], ['Merlot / M', 'M', 'Merlot', 94, 25], ['Merlot / L', 'L', 'Merlot', 94, 20]],
  'prd-003': [['Ivory / S', 'S', 'Ivory', 118, 30], ['Ivory / M', 'M', 'Ivory', 118, 34], ['Ivory / L', 'L', 'Ivory', 118, 24]],
  'prd-005': [['Champagne / M', 'M', 'Champagne', 132, 20], ['Champagne / L', 'L', 'Champagne', 132, 18], ['Rose / M', 'M', 'Rose', 132, 16]],
  'prd-006': [['Champagne / XS', 'XS', 'Champagne', 165, 12], ['Champagne / S', 'S', 'Champagne', 165, 14], ['Champagne / M', 'M', 'Champagne', 165, 10]],
  'prd-007': [['Tan / One Size', 'OS', 'Tan', 248, 29]],
  'prd-009': [['Charcoal / S', 'S', 'Charcoal', 128, 25], ['Charcoal / M', 'M', 'Charcoal', 128, 26], ['Charcoal / L', 'L', 'Charcoal', 128, 22]],
  'prd-010': [['Nude / 37', '37', 'Nude', 112, 21], ['Nude / 38', '38', 'Nude', 112, 20], ['Nude / 39', '39', 'Nude', 112, 20]],
  'prd-012': [['Sky / S', 'S', 'Sky', 82, 32], ['Sky / M', 'M', 'Sky', 82, 35], ['Sky / L', 'L', 'Sky', 82, 28]],
  'prd-015': [['Vanilla / S', 'S', 'Vanilla', 58, 45], ['Vanilla / M', 'M', 'Vanilla', 58, 44], ['Vanilla / L', 'L', 'Vanilla', 58, 43]],
  'prd-020': [['Oat / S', 'S', 'Oat', 54, 36], ['Oat / M', 'M', 'Oat', 54, 38], ['Oat / L', 'L', 'Oat', 54, 34]],
  'prd-022': [['Gold / One Size', 'OS', 'Gold', 96, 89]],
  'prd-024': [['Stone / S', 'S', 'Stone', 242, 8], ['Stone / M', 'M', 'Stone', 242, 7], ['Stone / L', 'L', 'Stone', 242, 6]],
}

export const productVariants: ProductVariant[] = Object.entries(variantSets).flatMap(
  ([productId, rows]) =>
    rows.map(([name, size, color, price, stock], idx) => ({
      id: `${productId}-v${idx + 1}`,
      productId,
      name,
      size,
      color,
      sku: `LC-${productId.toUpperCase().replace('PRD-', '')}-${size.toUpperCase().replaceAll(' ', '')}-${color.substring(0, 3).toUpperCase()}`,
      price: price * 8,
      stock,
    })),
)

export const stockAlerts = products
  .filter((p) => p.stock < 40)
  .map((p) => ({ productId: p.id, name: p.name, stock: p.stock }))
  .sort((a, b) => a.stock - b.stock)
  .slice(0, 5)