import { useSearchParams } from 'react-router-dom'
import { ProductExplorer } from '@/features/customer/products/components/product-explorer'

const SUBTITLES: Record<string, string> = {
  bestselling: 'bestsellers',
  newest: 'newest arrivals',
  'price-asc': 'lowest price first',
  'price-desc': 'highest price first',
  rating: 'top rated',
}

export function CollectionPage() {
  const [params] = useSearchParams()
  const sort = params.get('sort') ?? 'bestselling'
  const subtitle = SUBTITLES[sort] ?? 'complete catalogue'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Product listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Showing {subtitle} from a curated Ladies Collection edit — free delivery above ₹1,499 and easy 7-day returns.
        </p>
      </div>
      <ProductExplorer />
    </div>
  )
}