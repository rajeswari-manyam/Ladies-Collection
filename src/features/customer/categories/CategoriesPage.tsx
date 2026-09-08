import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { categories } from '@/features/admin/categories/data/categories'
import { subcategories } from '@/features/admin/subcategories/data/subcategories'
import { ProductArt } from '@/features/customer/products/components/product-art'

export function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse the full Ladies Collection catalogue by category and sub-category.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((cat, i) => {
          const subs = subcategories.filter((s) => s.categoryId === cat.id)
          return (
            <Link
              key={cat.id}
              to={`/shop/collections?cat=${cat.id}`}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="grid sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <ProductArt hue={cat.hue} pattern={i % 6} label={cat.name} rounded={false} className="h-full min-h-40 w-full" />
                </div>
                <div className="flex flex-col justify-center gap-2 p-6 sm:col-span-3 sm:p-7">
                  <p className="font-serif text-xl font-bold text-foreground group-hover:text-primary">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {subs.slice(0, 4).map((s) => (
                      <span key={s.id} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {s.name}
                      </span>
                    ))}
                    {subs.length > 4 && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        +{subs.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <span>{cat.productCount} styles</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}