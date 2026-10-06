import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useCatalog, useLiveCategories } from '@/features/customer/hooks'
import { colorSwatch } from '@/services/catalog.service'
import { ProductGrid } from '@/features/customer/products/components/product-grid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, colorName } from '@/utils'

type SortKey = 'bestselling' | 'newest' | 'price-asc' | 'price-desc'

const SORT_LABELS: Record<SortKey, string> = {
  bestselling: 'Bestselling',
  newest: 'Newest first',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
}

const NEW_ARRIVAL_DAYS = 30

interface ProductExplorerProps {
  categoryId?: string
  query?: string
  showSearchField?: boolean
}

export function ProductExplorer({ categoryId, query = '', showSearchField = false }: ProductExplorerProps) {
  const [params, setParams] = useSearchParams()
  const [editedText, setEditedText] = useState<string | null>(null)
  const [activeSize, setActiveSize] = useState<string | null>(null)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const text = editedText !== null ? editedText : query

  const { data: catalog = [], isLoading } = useCatalog()
  const { data: liveCategories = [] } = useLiveCategories()

  const collection = params.get('collection')
  const defaultSort: SortKey = collection === 'new' ? 'newest' : 'bestselling'
  const sort = (params.get('sort') ?? defaultSort) as SortKey
  const activeCategory = params.get('cat') ?? categoryId ?? null

  const sizes = useMemo(() => {
    return Array.from(new Set(catalog.flatMap((p) => p.variants.map((v) => v.size).filter(Boolean))))
  }, [catalog])

  const colors = useMemo(() => {
    return Array.from(new Set(catalog.flatMap((p) => p.colors)))
  }, [catalog])

  const results = useMemo(() => {
    const term = text.trim().toLowerCase()
    let list = catalog.filter((p) => {
      if (activeCategory && p.categoryId !== activeCategory) return false
      if (activeSize && !p.variants.some((v) => v.size === activeSize)) return false
      if (activeColor && !p.colors.includes(activeColor)) return false
      if (maxPrice && p.price > maxPrice) return false
      if (term) {
        const haystack = [p.name, p.brand, p.categoryName, p.vendorName, p.description].join(' ').toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })

    if (collection === 'new') {
      const cutoff = Date.now() - NEW_ARRIVAL_DAYS * 24 * 60 * 60 * 1000
      const recent = list.filter((p) => +new Date(p.createdAt) >= cutoff)
      list = recent.length > 0 ? recent : [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8)
    } else if (collection === 'best') {
      const inStock = list.filter((p) => p.stock > 0)
      list = [...(inStock.length > 0 ? inStock : list)].sort((a, b) => b.stock - a.stock).slice(0, 8)
    }

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'newest':
        list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
      default:
        list = [...list].sort((a, b) => b.stock - a.stock || +new Date(b.createdAt) - +new Date(a.createdAt))
    }
    return list
  }, [catalog, text, activeCategory, activeSize, activeColor, maxPrice, sort, collection])

  const activeCategoryName = liveCategories.find((c) => c._id === activeCategory)?.name ?? null
  const hasActiveFilters = Boolean(activeSize || activeColor || maxPrice !== null)
  const activeFilterCount =
    (activeSize ? 1 : 0) + (activeColor ? 1 : 0) + (maxPrice !== null ? 1 : 0)

  function clearFilters() {
    setActiveSize(null)
    setActiveColor(null)
    setMaxPrice(null)
  }

  function updateSort(next: SortKey) {
    const url = new URLSearchParams(params)
    if (next === defaultSort) url.delete('sort')
    else url.set('sort', next)
    setParams(url, { replace: true })
  }

  const filterBar = (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setActiveSize(activeSize === size ? null : size)}
              className={cn(
                'min-w-10 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors',
                activeSize === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/50',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setActiveColor(activeColor === color ? null : color)}
              aria-label={`Filter by color ${colorName(color)}`}
              className={cn(
                'size-7 rounded-full border-2 transition-transform hover:scale-110',
                activeColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-border',
              )}
              style={{ background: colorSwatch(color) }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max price</p>
        <div className="flex flex-wrap gap-2">
          {[1500, 2500, 3500, 5000].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMaxPrice(maxPrice === n ? null : n)}
              className={cn(
                'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors',
                maxPrice === n
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/50',
              )}
            >
              Under ₹{n.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button size="sm" variant="ghost" onClick={clearFilters} className="w-full text-destructive">
          <X className="size-4" /> Clear all
        </Button>
      )}
    </div>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-36 rounded-2xl border border-border bg-card p-5">{filterBar}</div>
      </aside>

      <div>
        {showSearchField && (
          <input
            value={text}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Search products, brands, colours…"
            className="mb-5 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
          />
        )}

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen((v) => !v)}>
            <SlidersHorizontal className="size-4" />
            Filters {hasActiveFilters ? `(${activeFilterCount})` : ''}
          </Button>

          <div className="flex flex-wrap items-center gap-1.5">
            {activeCategoryName && (
              <Badge variant="rose" className="gap-1">
                {activeCategoryName}
                <button
                  type="button"
                  onClick={() => {
                    const url = new URLSearchParams(params)
                    url.delete('cat')
                    setParams(url, { replace: true })
                  }}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {activeSize && (
              <Badge variant="outline" className="gap-1">
                {activeSize}
                <button type="button" onClick={() => setActiveSize(null)}><X className="size-3" /></button>
              </Badge>
            )}
            {activeColor && (
              <Badge variant="outline" className="gap-1.5">
                <span className="size-2.5 rounded-full border border-border" style={{ background: colorSwatch(activeColor) }} />
                {colorName(activeColor)}
                <button type="button" onClick={() => setActiveColor(null)}><X className="size-3" /></button>
              </Badge>
            )}
            {maxPrice !== null && (
              <Badge variant="outline" className="gap-1.5">
                Under ₹{maxPrice.toLocaleString('en-IN')}
                <button type="button" onClick={() => setMaxPrice(null)}><X className="size-3" /></button>
              </Badge>
            )}
          </div>

          <span className="ml-auto text-sm text-muted-foreground">{results.length} result(s)</span>

          <Select value={sort} onValueChange={(v) => updateSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-auto gap-2 rounded-full px-3 text-xs font-semibold">
              <SlidersHorizontal className="size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtersOpen && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 lg:hidden">{filterBar}</div>
        )}

        <ProductGrid
          products={results}
          loading={isLoading}
          emptyTitle={results.length === 0 ? 'No products found' : undefined}
        />
      </div>
    </div>
  )
}