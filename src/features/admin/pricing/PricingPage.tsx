import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { IndianRupee, Pencil, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useProducts, useCategories, useUpdateProductPricing } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/common/state'
import { formatCurrency } from '@/utils'
import type { Product } from '@/features/admin/types'

const GST_BY_CATEGORY: Record<string, { gst: number; hsn: string }> = {
  'cat-dresses': { gst: 12, hsn: '6204' },
  'cat-tops': { gst: 12, hsn: '6206' },
  'cat-bottoms': { gst: 12, hsn: '6204' },
  'cat-outerwear': { gst: 12, hsn: '6202' },
  'cat-lingerie': { gst: 12, hsn: '6108' },
  'cat-bags': { gst: 18, hsn: '4202' },
  'cat-footwear': { gst: 18, hsn: '6403' },
  'cat-jewelry': { gst: 3, hsn: '7113' },
}

export function PricingOptionsPage() {
  const { data: products, isLoading, isError, refetch } = useProducts()
  const { data: cats } = useCategories()
  const updatePricing = useUpdateProductPricing()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [pending, setPending] = useState(false)

  const [form, setForm] = useState({
    price: 0,
    compareAtPrice: '',
    stock: 0,
    featured: false,
    tags: '',
  })

  const categoryName = useMemo(() => {
    const map = new Map(cats?.categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [cats])

  const rows = useMemo(() => {
    if (!products) return []
    if (!search.trim()) return products
    const q = search.trim().toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
  }, [products, search])

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      price: product.price,
      compareAtPrice: product.compareAtPrice == null ? '' : String(Math.round(product.compareAtPrice)),
      stock: product.stock,
      featured: product.featured,
      tags: product.tags.join(', '),
    })
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setPending(true)
    updatePricing.mutate(
      {
        id: editing.id,
        price: Math.max(0, Math.round(form.price)),
        compareAtPrice: form.compareAtPrice.trim() ? Math.max(0, Math.round(Number(form.compareAtPrice))) : null,
        stock: Math.max(0, Math.round(form.stock)),
        featured: form.featured,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success('Pricing saved', { description: `${editing.name} was updated.` })
          setEditing(null)
        },
        onError: () => toast.error('Save failed — please retry'),
        onSettled: () => setPending(false),
      },
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  const columns = useMemo<AppColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.brand}</p>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{formatCurrency(row.original.price)}</p>
            {row.original.compareAtPrice != null && (
              <p className="text-xs text-muted-foreground line-through">{formatCurrency(row.original.compareAtPrice)}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <Badge variant={row.original.stock > 40 ? 'outline' : row.original.stock > 0 ? 'rose' : 'destructive'}>
            {row.original.stock} units
          </Badge>
        ),
      },
      {
        accessorKey: 'categoryId',
        header: 'GST',
        cell: ({ row }) => {
          const meta = GST_BY_CATEGORY[row.original.categoryId] ?? { gst: 12, hsn: '6204' }
          return <span className="text-muted-foreground">{meta.gst}% · HSN {meta.hsn}</span>
        },
      },
      {
        accessorKey: 'featured',
        header: 'Badges',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.featured && (
              <Badge variant="rose">
                <Star className="size-3 fill-current" />
                Featured
              </Badge>
            )}
            {row.original.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline">#{t}</Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ),
      },
    ],
    [],
  )

  const gstMeta = GST_BY_CATEGORY[editing?.categoryId ?? ''] ?? { gst: 12, hsn: '6204' }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Pricing & Additional Options"
        description="Set selling price, MRP, stock and listing options for every product."
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No products found"
        pageSize={10}
        toolbar={
          <Input
            placeholder="Search product or brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lg:max-w-sm"
          />
        }
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.name}</DialogTitle>
            <DialogDescription>
              {categoryName(editing?.categoryId ?? '')} · {editing?.brand}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="max-h-[60vh] space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Selling price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compare">MRP (₹, optional)</Label>
                <Input
                  id="compare"
                  type="number"
                  min={0}
                  placeholder="Leave blank for no discount"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="stock">Available stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end justify-between gap-4 rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Cash on delivery</p>
                  <p className="text-xs text-muted-foreground">COD is enabled on this listing</p>
                </div>
                <Switch defaultChecked disabled aria-readonly />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="summer, occasion-wear, new-arrival"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            <div className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <IndianRupee className="size-4 text-primary" />
                Additional options
              </p>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>GST rate (marketplace rule)</span>
                <span className="font-medium text-foreground">{gstMeta.gst}%</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>HSN / SAC code</span>
                <span className="font-mono font-medium text-foreground">{gstMeta.hsn}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Shipping class</span>
                <span className="font-medium text-foreground">Standard — 2 to 5 days</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Discount shown to buyer</span>
                <span className="font-medium text-foreground">
                  {form.compareAtPrice.trim() && form.price > 0
                    ? `${Math.max(0, Math.round(((Number(form.compareAtPrice) - form.price) / Number(form.compareAtPrice)) * 100))}% off`
                    : '—'}
                </span>
              </div>
              <label className="flex cursor-pointer items-center justify-between">
                <span>Feature on storefront</span>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                  aria-label="Featured listing"
                />
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Save pricing'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}