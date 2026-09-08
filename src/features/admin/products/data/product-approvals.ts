export interface ApprovalItem {
  id: string
  name: string
  brand: string
  categoryId: string
  vendorId: string
  price: number
  compareAtPrice: number | null
  stock: number
  variantCount: number
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
}

export const productApprovals: ApprovalItem[] = [
  {
    id: 'apr-01',
    name: 'Rosewater Anarkali Gown',
    brand: 'Rosette',
    categoryId: 'cat-dresses',
    vendorId: 'ven-rose',
    price: 12499,
    compareAtPrice: 16999,
    stock: 0,
    variantCount: 6,
    submittedAt: '2026-09-07T08:20:00',
    status: 'pending',
    reason: null,
  },
  {
    id: 'apr-02',
    name: 'Zari Embroidered Midi Set',
    brand: 'Mira Bloom',
    categoryId: 'cat-dresses',
    vendorId: 'ven-mira',
    price: 8999,
    compareAtPrice: 11999,
    stock: 24,
    variantCount: 4,
    submittedAt: '2026-09-07T07:40:00',
    status: 'pending',
    reason: null,
  },
  {
    id: 'apr-03',
    name: 'Banarasi Silk Dupatta',
    brand: 'Opal Ivory',
    categoryId: 'cat-bags',
    vendorId: 'ven-opal',
    price: 3299,
    compareAtPrice: 4299,
    stock: 50,
    variantCount: 3,
    submittedAt: '2026-09-06T18:15:00',
    status: 'pending',
    reason: null,
  },
  {
    id: 'apr-04',
    name: 'Chanderi Kurta with Palazzo',
    brand: 'Lina',
    categoryId: 'cat-tops',
    vendorId: 'ven-lina',
    price: 6499,
    compareAtPrice: null,
    stock: 18,
    variantCount: 5,
    submittedAt: '2026-09-06T12:05:00',
    status: 'pending',
    reason: null,
  },
  {
    id: 'apr-05',
    name: 'Velvet Bolero Jacket',
    brand: 'Velvet Vogue',
    categoryId: 'cat-outerwear',
    vendorId: 'ven-velvet',
    price: 7499,
    compareAtPrice: 9999,
    stock: 12,
    variantCount: 4,
    submittedAt: '2026-09-05T16:30:00',
    status: 'pending',
    reason: null,
  },
  {
    id: 'apr-06',
    name: 'Hand-painted Khadi Saree',
    brand: 'Noir Floral',
    categoryId: 'cat-dresses',
    vendorId: 'ven-noir',
    price: 10499,
    compareAtPrice: 13999,
    stock: 9,
    variantCount: 2,
    submittedAt: '2026-09-04T10:00:00',
    status: 'rejected',
    reason: 'Primary image resolution does not meet the 1200px guideline.',
  },
  {
    id: 'apr-07',
    name: 'Earthy Jute Weekend Tote',
    brand: 'Lina',
    categoryId: 'cat-bags',
    vendorId: 'ven-lina',
    price: 1899,
    compareAtPrice: null,
    stock: 60,
    variantCount: 5,
    submittedAt: '2026-09-03T14:22:00',
    status: 'approved',
    reason: null,
  },
  {
    id: 'apr-08',
    name: 'Ikat Co-ord Set',
    brand: 'Serafine',
    categoryId: 'cat-bottoms',
    vendorId: 'ven-serafine',
    price: 5799,
    compareAtPrice: 7499,
    stock: 0,
    variantCount: 4,
    submittedAt: '2026-09-02T09:45:00',
    status: 'rejected',
    reason: 'Brand guidelines require moisture-wicking fabric note for activewear.',
  },
]