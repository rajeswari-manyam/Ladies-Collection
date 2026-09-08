import type { StoreProduct, StoreReview, StoreVendor } from '@/features/customer/types'
import { categories } from '@/features/admin/categories/data/categories'
import { subcategories } from '@/features/admin/subcategories/data/subcategories'
import { discountPercent } from '@/utils'

export const storeVendors: StoreVendor[] = [
  {
    id: 'sv-gulmohar',
    brand: 'Gulmohar',
    name: 'Mumbai Handlooms',
    location: 'Mumbai, Maharashtra',
    rating: 4.8,
    productsCount: 214,
    hue: 350,
    blurb: 'Hand-block printed casuals woven on traditional Mumbai looms.',
  },
  {
    id: 'sv-kanjeevaram',
    brand: 'Kanjeevaram House',
    name: 'Chennai Silks',
    location: 'Kanchipuram, Tamil Nadu',
    rating: 4.9,
    productsCount: 178,
    hue: 18,
    blurb: 'Temple-border weaves and heritage sarees from the weaver estates of Kanchipuram.',
  },
  {
    id: 'sv-niva',
    brand: 'Niva Ethnic',
    name: 'Pune Kraft',
    location: 'Pune, Maharashtra',
    rating: 4.6,
    productsCount: 132,
    hue: 336,
    blurb: 'Everyday ethnic wear in soft breathable cotton for the modern Indian woman.',
  },
  {
    id: 'sv-zari',
    brand: 'Zari & Co',
    name: 'Zara Benares',
    location: 'Varanasi, Uttar Pradesh',
    rating: 4.7,
    productsCount: 96,
    hue: 330,
    blurb: 'Zardozi, gotta-patti and festive couture hand-finished in Varanasi.',
  },
  {
    id: 'sv-suri',
    brand: 'Suri & Sons',
    name: 'Delhi Bloom',
    location: 'Delhi NCR',
    rating: 4.5,
    productsCount: 261,
    hue: 300,
    blurb: 'Casual tops and kurtis with a contemporary street-smart finish.',
  },
  {
    id: 'sv-palazo',
    brand: 'Palazo',
    name: 'Jaipur Heritage',
    location: 'Jaipur, Rajasthan',
    rating: 4.9,
    productsCount: 149,
    hue: 288,
    blurb: 'Banarasi and handloom silks with regal zari accents from the Pink City.',
  },
]

export function storeVendorById(id: string): StoreVendor | undefined {
  return storeVendors.find((v) => v.id === id)
}

function categoryName(id: string) {
  return categories.find((c) => c.id === id)?.name ?? 'Dresses'
}

interface CatalogSeed {
  category: string
  vendorId: string
  mrp: number
  price: number
  rating: number
  ratingCount: number
  sizes: [string, number][]
  colors: string[]
  tags: string[]
  hue: number
  pattern: number
  bestsellers: boolean
  newArrivals: boolean
  createdAt: string
}

const catalogSeeds: Record<string, CatalogSeed> = {
  'prd-501': {
    category: 'cat-tops',
    vendorId: 'sv-gulmohar',
    mrp: 1999,
    price: 1299,
    rating: 4.4,
    ratingCount: 312,
    sizes: [['S', 14], ['M', 6], ['L', 22], ['XL', 9], ['XXL', 3]],
    colors: ['#c2185b', '#1565c0', '#e8eaf6', '#4caf50'],
    tags: ['bestseller', 'casual', 'summer'],
    hue: 343,
    pattern: 1,
    bestsellers: true,
    newArrivals: false,
    createdAt: '2026-07-12',
  },
  'prd-502': {
    category: 'cat-ethnic',
    vendorId: 'sv-kanjeevaram',
    mrp: 4499,
    price: 2499,
    rating: 4.7,
    ratingCount: 188,
    sizes: [['Free Size', 12]],
    colors: ['#b71c1c', '#e6a817', '#1a237e', '#37474f'],
    tags: ['festive', 'bridal', 'silk'],
    hue: 13,
    pattern: 2,
    bestsellers: true,
    newArrivals: false,
    createdAt: '2026-06-28',
  },
  'prd-503': {
    category: 'cat-dresses',
    vendorId: 'sv-niva',
    mrp: 2699,
    price: 1799,
    rating: 4.2,
    ratingCount: 264,
    sizes: [['S', 10], ['M', 18], ['L', 4], ['XL', 11]],
    colors: ['#f48fb1', '#8d6e63', '#eceff1', '#7cb342'],
    tags: ['cotton', 'everyday', 'anarkali'],
    hue: 340,
    pattern: 3,
    bestsellers: false,
    newArrivals: true,
    createdAt: '2026-08-02',
  },
  'prd-504': {
    category: 'cat-dresses',
    vendorId: 'sv-zari',
    mrp: 7999,
    price: 4999,
    rating: 4.8,
    ratingCount: 141,
    sizes: [['S', 5], ['M', 8], ['L', 2], ['XL', 6]],
    colors: ['#7b1fa2', '#c62828', '#f9a825', '#0d47a1'],
    tags: ['festive', 'embroidered', 'couture'],
    hue: 295,
    pattern: 4,
    bestsellers: true,
    newArrivals: false,
    createdAt: '2026-05-19',
  },
  'prd-505': {
    category: 'cat-tops',
    vendorId: 'sv-suri',
    mrp: 1399,
    price: 899,
    rating: 4.0,
    ratingCount: 406,
    sizes: [['XS', 16], ['S', 26], ['M', 12], ['L', 3], ['XL', 8]],
    colors: ['#ef5350', '#42a5f5', '#000000', '#ffe082'],
    tags: ['casual', 'top', 'workwear'],
    hue: 4,
    pattern: 5,
    bestsellers: false,
    newArrivals: true,
    createdAt: '2026-08-10',
  },
  'prd-506': {
    category: 'cat-ethnic',
    vendorId: 'sv-palazo',
    mrp: 5499,
    price: 3499,
    rating: 4.9,
    ratingCount: 97,
    sizes: [['Free Size', 7]],
    colors: ['#4a148c', '#880e4f', '#0d2b1f', '#b26a00'],
    tags: ['silk', 'banarasi', 'occasion'],
    hue: 20,
    pattern: 6,
    bestsellers: false,
    newArrivals: true,
    createdAt: '2026-08-20',
  },
}

export const storeProducts: StoreProduct[] = Object.entries(catalogSeeds).map(([id, seed]) => ({
  id,
  name: {
    'prd-501': 'Floral Printed Kurti',
    'prd-502': 'Designer Saree',
    'prd-503': 'Cotton Anarkali Dress',
    'prd-504': 'Embroidered Lehenga',
    'prd-505': 'Women Casual Top',
    'prd-506': 'Silk Designer Saree',
  }[id]!,
  brand: storeVendorById(seed.vendorId)!.brand,
  description:
    {
      'prd-501':
        'A hand-block printed cotton kurti with a relaxed A-line silhouette, three-quarter sleeves and a side slit. Pairs effortlessly with leggings, culottes or denim.',
      'prd-502':
        'A festive designer saree in soft georgette with an elaborate zari border and a pre-stitched fall. A matching blouse piece is included.',
      'prd-503':
        'An ankle-length Anarkali cut from cool, breathable cotton with delicate gota piping on the yoke. Perfect for daytime gatherings and family dinners.',
      'prd-504':
        'A show-stopping embroidered lehenga with a flared skirt, hand-sewn zardozi highlights and a plush adjustable waistband. Includes matching dupatta.',
      'prd-505':
        'An everyday casual top in a rich cotton blend with a round neck, comfortable fit and a subtle sheen that dresses up or down with ease.',
      'prd-506':
        'A regal Banarasi silk saree woven with intricate brocade zari, complete with a fine edge-to-edge pallu and an included unstitched blouse.',
    }[id]!,
  care:
    {
      'prd-501': 'Machine wash cold. Dry in shade. Warm iron.',
      'prd-502': 'Dry clean only. Steam iron on low.',
      'prd-503': 'Machine wash gentle. Medium iron.',
      'prd-504': 'Dry clean only. Store in muslin wrap.',
      'prd-505': 'Machine wash cold. Low tumble or line dry.',
      'prd-506': 'Dry clean only. Avoid direct sunlight.',
    }[id]!,
  categoryId: seed.category,
  categoryName: categoryName(seed.category),
  vendorId: seed.vendorId,
  vendorName: storeVendorById(seed.vendorId)!.name,
  mrp: seed.mrp,
  price: seed.price,
  rating: seed.rating,
  ratingCount: seed.ratingCount,
  sizes: seed.sizes.map(([size, stock]) => ({ size, stock })),
  colors: seed.colors,
  tags: seed.tags,
  hue: seed.hue,
  pattern: seed.pattern,
  inBestsellers: seed.bestsellers,
  inNewArrivals: seed.newArrivals,
  createdAt: seed.createdAt,
}))

export function storeProductById(id: string): StoreProduct | undefined {
  return storeProducts.find((p) => p.id === id)
}

export function storeProductDiscount(product: StoreProduct) {
  return discountPercent(product.mrp, product.price)
}

const HOME_BANNER_HUES: [string, number][] = [
  ['New Season Ethnic', 350],
  ['Festive Edit', 300],
  ['Handloom Treasures', 20],
]

export const homeBanners = HOME_BANNER_HUES.map(([label, hue], i) => ({
  id: `banner-${i + 1}`,
  label,
  hue,
  cta: i === 0 ? 'Shop the collection' : 'Explore',
}))

export const storeReviews: StoreReview[] = [
  {
    id: 'rev-1',
    productId: 'prd-501',
    author: 'Sneha Kulkarni',
    rating: 5,
    title: 'Lovely print, true to size',
    body: 'The fabric is feather-light and the floral print is exactly like the picture. Bought an XL and it fits perfectly over kurti sets.',
    createdAt: '2026-08-30',
  },
  {
    id: 'rev-2',
    productId: 'prd-501',
    author: 'Meera Iyer',
    rating: 4,
    title: 'Good everyday kurti',
    body: 'Colour is rich and the linen mix keeps it breathable in summer. Slightly long but easy to alter.',
    createdAt: '2026-08-24',
  },
  {
    id: 'rev-3',
    productId: 'prd-502',
    author: 'Ritika Kapoor',
    rating: 5,
    title: 'Wedding-ready saree',
    body: 'The zari border shimmers beautifully. Received compliments all evening. Delivery was quick too.',
    createdAt: '2026-08-18',
  },
  {
    id: 'rev-4',
    productId: 'prd-502',
    author: 'Divya Menon',
    rating: 4,
    title: 'Elegant and lightweight',
    body: 'Very easy to drape and pleat. Would have loved a brighter border shade but overall a great value saree.',
    createdAt: '2026-08-02',
  },
  {
    id: 'rev-5',
    productId: 'prd-503',
    author: 'Pooja Deshmukh',
    rating: 5,
    title: 'Perfect Anarkali',
    body: 'Soft cotton, beautiful fall and the gota piping is delicate without being fragile. Wore it to a pooja and felt lovely.',
    createdAt: '2026-08-11',
  },
  {
    id: 'rev-6',
    productId: 'prd-504',
    author: 'Anita Rao',
    rating: 5,
    title: 'Heavy yet comfy lehenga',
    body: 'The embroidery is dense and the skirt flares beautifully. Waistband is adjustable so no tailoring needed.',
    createdAt: '2026-07-28',
  },
  {
    id: 'rev-7',
    productId: 'prd-505',
    author: 'Kavya Nair',
    rating: 4,
    title: 'Nice casual top',
    body: 'Perfect office top — the fit is flattering and it survived many machine washes. Colour runs a little in the first wash.',
    createdAt: '2026-08-26',
  },
  {
    id: 'rev-8',
    productId: 'prd-506',
    author: 'Manisha Gupta',
    rating: 5,
    title: 'Heirloom-quality silk',
    body: 'The Banarasi weave and zari are superb for the price. It drapes like a dream. My mother now wants one too!',
    createdAt: '2026-09-01',
  },
]

export function storeReviewsForProduct(productId: string): StoreReview[] {
  return storeReviews.filter((r) => r.productId === productId)
}

export { subcategories }