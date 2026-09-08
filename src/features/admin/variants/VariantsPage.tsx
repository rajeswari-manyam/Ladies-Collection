import { useMemo, useState } from 'react'
import { Pencil, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useProductVariants, useProducts, useUpdateVariantStock } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/common/state'
import { formatCurrency, formatNumber } from '@/utils'
import type { ProductVariant } from '@/features/admin/types'

export function ProductVariantsPage() {
  const { data: variants, isLoading, isError, refetch } = useProductVariants()
  const { data: products } = useProducts()
  const updateStock = useUpdateVariantStock()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ProductVariant | null>(null)
  const [stockValue, setStockValue] = useState<number>(0)
  const [pending, setPending] = useState(false)

  const productName = useMemo(() => {
    const map = new Map(products?.map((p) => [p.id, p.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [products])

  const rows = useMemo(() => {
    if (!variants) return []
    if (!search.trim()) return variants
    const q = search.trim().toLowerCase()
    return variants.filter(
      (v) =>
        productName(v.productId).toLowerCase().includes(q) ||
        v.sku.toLowerCase().includes(q) ||
        v.size.toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q),
    )
  }, [variants, search, productName])

  const openEdit = (variant: ProductVariant) => {
    setEditing(variant)
    setStockValue(variant.stock)
  }

  const save = () => {
    if (!editing) return
    setPending(true)
    updateStock.mutate(
      { id: editing.id, stock: Math.max(0, Math.round(stockValue)) },
      {
        onSuccess: () => {
          toast.success('Stock updated', { description: `${editing.sku} now has ${Math.max(0, Math.round(stockValue))} units.` })
          setEditing(null)
        },
        onError: () => toast.error('Update failed — please retry'),
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

  const columns = useMemo<AppColumnDef<ProductVariant>[]>(
    () => [
      {
        accessorKey: 'productId',
        header: 'Product',
        cell: ({ row }) => <span className="max-w-56 truncate font-medium">{productName(row.original.productId)}</span>,
      },
      {
        accessorKey: 'name',
        header: 'Variant',
        cell: ({ row }) => (
          <div>
            <p>{row.original.name}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{row.original.sku}</p>
          </div>
        ),
      },
      {
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => <Badge variant="outline">{row.original.size}</Badge>,
      },
      {
        accessorKey: 'color',
        header: 'Colour',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span className="size-3 rounded-full border border-border" style={{ background: row.original.color }} />
            {row.original.color}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.price)}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <Badge variant={row.original.stock > 20 ? 'outline' : row.original.stock > 0 ? 'rose' : 'destructive'}>
            {row.original.stock > 0 ? `${formatNumber(row.original.stock)} in stock` : 'Out of stock'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(row.original)} aria-label="Adjust stock">
            <Pencil className="size-4" />
          </Button>
        ),
      },
    ],
    [productName],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Product Variants"
        description="Size and colour combinations with per-variant pricing and stock."
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No variants found"
        pageSize={10}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search product, SKU, size or colour…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lg:max-w-sm"
            />
            <p className="text-xs text-muted-foreground">{formatNumber(rows.length)} variants</p>
          </div>
        }
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update stock</DialogTitle>
            <DialogDescription>
              {editing?.name} · <span className="font-mono text-xs">{editing?.sku}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="variant-stock">Available units</Label>
            <Input
              id="variant-stock"
              type="number"
              min={0}
              value={Number.isNaN(stockValue) ? '' : stockValue}
              onChange={(e) => setStockValue(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              <RefreshCcw className="size-4" />
              Save stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}