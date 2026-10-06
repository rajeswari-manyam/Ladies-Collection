import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductExplorer } from '@/features/customer/products/components/product-explorer'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [edited, setEdited] = useState<string | null>(null)
  const text = edited !== null ? edited : urlQuery

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by product name, brand, colour or category across the store.
        </p>

        <form
          className="relative mt-5 max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault()
            setEdited(null)
            setParams(text.trim() ? { q: text.trim() } : {}, { replace: true })
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={text}
            onChange={(e) => setEdited(e.target.value)}
            placeholder="Try “silk saree”, “kurti”, “Gulmohar”…"
            className="h-12 rounded-2xl pl-12 pr-24"
          />
          <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4">
            Search
          </Button>
        </form>
      </div>

      <ProductExplorer query={text} showSearchField={false} />
    </div>
  )
}