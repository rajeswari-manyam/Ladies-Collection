import { useMemo, useState } from 'react'
import { Boxes, MoreHorizontal, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useProductVariants,
  useProducts,
  useUpdateVariantStock,
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { VariantFormDialog } from '@/components/variants/variant-form-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ErrorState } from '@/components/common/state'
import { formatCurrency, formatNumber } from '@/utils'
import { variantName } from '@/services/variant.service'
import type { ApiProductVariant } from '@/services/variant.service'

export function ProductVariantsPage() {
  const { data: variants, isLoading, isError, refetch } = useProductVariants()
  const { data: products } = useProducts()
  const updateStock = useUpdateVariantStock()
  const addVariant = useAddVariant()
  const updateVariantMut = useUpdateVariant()
  const removeVariant = useDeleteVariant()

  const [search, setSearch] = useState('')
  const [stockVariant, setStockVariant] = useState<ApiProductVariant | null>(null)
  const [stockValue, setStockValue] = useState<number>(0)
  const [formVariant, setFormVariant] = useState<ApiProductVariant | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<ApiProductVariant | null>(null)

  const productName = useMemo(() => {
    const map = new Map(products?.map((p) => [p.id, p.name]))
    return (variant: ApiProductVariant) => {
      if (typeof variant.productId === 'object' && variant.productId?.name) return variant.productId.name
      const id = typeof variant.productId === 'string' ? variant.productId : (variant.productId?._id ?? '')
      return map.get(id) ?? '—'
    }
  }, [products])

  const rows = useMemo(() => {
    if (!variants) return []
    if (!search.trim()) return variants
    const q = search.trim().toLowerCase()
    return variants.filter(
      (v) =>
        productName(v).toLowerCase().includes(q) ||
        v.sku.toLowerCase().includes(q) ||
        v.size.toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q),
    )
  }, [variants, search, productName])

  const openStockDialog = (variant: ApiProductVariant) => {
    setStockVariant(variant)
    setStockValue(variant.stock)
  }

  const saveStock = () => {
    if (!stockVariant) return
    const next = Math.max(0, Math.round(stockValue))
    updateStock.mutate(
      { id: stockVariant._id, stock: next },
      {
        onSuccess: () => {
          toast.success('Stock updated', { description: `${stockVariant.sku} now has ${next} units.` })
          setStockVariant(null)
        },
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  const handleFormSubmit = async (input: Parameters<typeof addVariant.mutate>[0]) => {
    try {
      if (formVariant) {
        await updateVariantMut.mutateAsync({ id: formVariant._id, patch: input })
        toast.success('Variant updated')
      } else {
        await addVariant.mutateAsync(input)
        toast.success('Variant created')
      }
    } catch {
      toast.error('Save failed — please retry')
      throw new Error('Save failed')
    }
  }

  const confirmDelete = () => {
    if (!deleting) return
    removeVariant.mutate(deleting._id, {
      onSuccess: () => {
        toast.success('Variant deleted', { description: `${deleting.sku} was removed.` })
        setDeleting(null)
      },
      onError: () => toast.error('Delete failed — please retry'),
    })
  }

  const columns = useMemo<AppColumnDef<ApiProductVariant>[]>(
    () => [
      {
        accessorKey: 'productId',
        header: 'Product',
        cell: ({ row }) => <span className="max-w-56 truncate font-medium">{productName(row.original)}</span>,
      },
      {
        accessorKey: 'sku',
        header: 'Variant',
        cell: ({ row }) => (
          <div>
            <p>{variantName(row.original)}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{row.original.sku}</p>
          </div>
        ),
      },
      {
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => <Badge variant="outline">{row.original.size || '—'}</Badge>,
      },
      {
        accessorKey: 'color',
        header: 'Colour',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm">
            {row.original.color && <span className="size-3 rounded-full border border-border" style={{ background: row.original.color }} />}
            {row.original.color || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'customerSellingPrice',
        header: 'Selling price',
        cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.customerSellingPrice)}</span>,
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => openStockDialog(row.original)}>
                <Boxes />
                Adjust stock
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setFormVariant(row.original)
                  setFormOpen(true)
                }}
              >
                <Pencil />
                Edit variant
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleting(row.original)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [productName],
  )

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
        title="Product Variants"
        description="Size and colour combinations with per-variant pricing and stock."
        actions={
          <Button size="sm" onClick={() => { setFormVariant(null); setFormOpen(true) }}>
            <Plus className="size-4" />
            Add variant
          </Button>
        }
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

      <VariantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        variant={formVariant}
        products={(products ?? []).map((p) => ({ _id: p.id, name: p.name }))}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={stockVariant !== null} onOpenChange={(open) => !open && setStockVariant(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update stock</DialogTitle>
            <DialogDescription>
              {stockVariant ? variantName(stockVariant) : ''} · <span className="font-mono text-xs">{stockVariant?.sku}</span>
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
            <Button variant="outline" onClick={() => setStockVariant(null)} disabled={updateStock.isPending}>
              Cancel
            </Button>
            <Button onClick={saveStock} disabled={updateStock.isPending}>
              <RefreshCcw className="size-4" />
              Save stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleting?.sku ?? 'variant'}?</DialogTitle>
            <DialogDescription>
              This permanently removes the variant and its stock records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={removeVariant.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={removeVariant.isPending}>
              <Trash2 className="size-4" />
              {removeVariant.isPending ? 'Deleting…' : 'Delete variant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}