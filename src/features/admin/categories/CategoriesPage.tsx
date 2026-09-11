import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Check, LayoutGrid, Plus, Star } from 'lucide-react'
import { useCategories } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, EmptyState } from '@/components/common/state'
import { GradientArtwork } from '@/components/common/artwork'
import { formatNumber } from '@/utils'
import { NewCategoryDialog } from '@/features/admin/categories/components/NewCategoryDialog'
import { categories as staticCategories } from '@/features/admin/categories/data/categories'
import { subcategories as staticSubcategories } from '@/features/admin/subcategories/data/subcategories'

export function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategories()
  const [view, setView] = useState<'categories' | 'subcategories'>('categories')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)

  const countMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of data?.subcategories ?? staticSubcategories) {
      map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1)
    }
    return map
  }, [data])

  const categories = useMemo(() => {
    let list = data?.categories ?? staticCategories
    if (featuredOnly) list = list.filter((c) => c.featured)
    return list
  }, [data, featuredOnly])

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories & subcategories"
        description="Organise the marketplace taxonomy that powers storefront navigation."
        actions={
          <Button size="sm" onClick={() => setNewCategoryOpen(true)}>
            <Plus className="size-4" />
            New category
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as 'categories' | 'subcategories')}>
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>
        </Tabs>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          Featured only
          <Switch checked={featuredOnly} onCheckedChange={setFeaturedOnly} />
        </label>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : view === 'categories' ? (
        categories.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(61,25,42,0.04)]">
                  <GradientArtwork
                    seed={cat.name}
                    hue={cat.hue}
                    className="h-28 w-full"
                    label={cat.name}
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    {cat.featured && (
                      <Badge variant="rose" className="shadow-sm">
                        <Star className="size-3 fill-current" /> Featured
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="font-serif text-lg font-semibold leading-tight">{cat.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <LayoutGrid className="size-3.5" />
                        {formatNumber(cat.productCount)} products
                      </span>
                      <span className="text-muted-foreground">
                        {countMap.get(cat.id) ?? 0} subcategories
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState title="No categories match" description="Try turning off the featured-only filter." />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data?.subcategories ?? staticSubcategories).map((sub, i) => {
            const cat = (data?.categories ?? staticCategories).find((c) => c.id === sub.categoryId)
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.35 }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-primary">
                  <Check className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.productCount} products · in {cat?.name ?? '—'}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <NewCategoryDialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen} onCreated={refetch} />
    </div>
  )
}