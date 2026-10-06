import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLiveCategories, useLiveSubCategories } from '@/features/customer/hooks'
import { hueFromHex } from '@/services/catalog.service'

interface CategoryMegaMenuProps {
  onNavigate: () => void
}

export function CategoryMegaMenu({ onNavigate }: CategoryMegaMenuProps) {
  const { data: categories = [] } = useLiveCategories()
  const { data: subcategories = [] } = useLiveSubCategories()

  return (
    <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-white shadow-xl shadow-rose-950/10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-7 px-4 py-7 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:px-10">
        {categories.map((cat) => {
          const subs = subcategories.filter((s) => s.categoryId === cat._id)
          const hue = hueFromHex(cat.accentColor)
          return (
            <div key={cat._id}>
              <Link
                to={`/shop/collections?cat=${cat._id}`}
                onClick={onNavigate}
                className="group flex items-center gap-2 border-b border-border/70 pb-2 text-[13px] font-semibold uppercase tracking-wide text-foreground hover:text-primary"
                style={{ borderBottomColor: `hsl(${hue} 55% 88%)` }}
              >
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: `hsl(${hue} 55% 55%)` }} />
                {cat.name}
              </Link>
              <ul className="mt-3 flex flex-col gap-2.5">
                {subs.map((sub) => (
                  <li key={sub._id}>
                    <Link
                      to={`/shop/collections?cat=${cat._id}`}
                      onClick={onNavigate}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to={`/shop/collections?cat=${cat._id}`}
                    onClick={onNavigate}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    Shop all
                    <ArrowRight className="size-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}