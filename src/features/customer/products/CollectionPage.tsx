import { useSearchParams } from 'react-router-dom'
import { ProductExplorer } from '@/features/customer/products/components/product-explorer'
import { useLiveCategories } from '@/features/customer/hooks'

const SORT_LABELS: Record<string, string> = {
  bestselling: 'bestsellers first',
  newest: 'newest first',
  'price-asc': 'lowest price first',
  'price-desc': 'highest price first',
  rating: 'top rated first',
}

export function CollectionPage() {
  const [params] = useSearchParams()
  const { data: liveCategories = [] } = useLiveCategories()

  const sortParam = params.get('sort')
  const collection = params.get('collection')
  const catId = params.get('cat')
  const categoryName = catId ? liveCategories.find((c) => c._id === catId)?.name ?? null : null
  const sortLabel = SORT_LABELS[sortParam ?? 'bestselling'] ?? 'complete catalogue'

  let title = 'Product listings'
  let subtitle = `Showing the complete catalogue, ${sortLabel}`

  if (categoryName) {
    title = categoryName
    subtitle = `Showing ${categoryName.toLowerCase()}, ${sortLabel}`
  } else if (collection === 'new') {
    title = 'New arrivals'
    subtitle = 'Pieces added to Ladies Collection in the last 30 days'
  } else if (collection === 'best') {
    title = 'Bestsellers'
    subtitle = 'Top in-stock pieces, ready to ship'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle} — free delivery above ₹1,499 and easy 7-day returns.
        </p>
      </div>
      <ProductExplorer />
    </div>
  )
}
