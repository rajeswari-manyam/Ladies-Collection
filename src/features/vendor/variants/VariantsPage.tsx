import { useMemo, useState } from 'react'
import { Boxes, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useVendorProductVariants,
  useVendorProducts,
  useUpdateVendorVariantStock,
  useCreateVendorVariant,
  useUpdateVendorVariant,
  useDeleteVendorVariant,
} from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductThumb } from '@/components/common/artwork'
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
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ErrorState } from '@/components/common/state'
import { formatCurrency } from '@/utils'
import { variantName, variantRefId } from '@/services/variant.service'
import type { ApiProductVariant } from '@/services/variant.service'

export function VendorProductVariantsPage() {
  const { data: variants, isLoading, isError, refetch } = useVendorProductVariants()
  const { data: products } = useVendorProducts()
  const updateStock = useUpdateVendorVariantStock()
  const addVariant = useCreateVendorVariant()
  const updateVariantMut = useUpdateVendorVariant()
  const removeVariant = useDeleteVendorVariant()

  const [search, setSearch] = useState('')
  const [stockVariant, setStockVariant] = useState<ApiProductVariant | null>(null)
  const [stockValue, setStockValue] = useState('')
  const [formVariant, setFormVariant] = useState<ApiProductVariant | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<ApiProductVariant | null>(null)

  const productMap = useMemo(() => {
    const map = new Map((products ?? []).map((p) => [p._id, p]))
    return map
  }, [products])

  const rows = useMemo(() => {
    let list = variants ?? []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((v) => {
        const product = productMap.get(variantRefId(v.productId))
        return (
          v.sku.toLowerCase().includes(q) ||
          variantName(v).toLowerCase().includes(q) ||
          (product?.name.toLowerCase().includes(q) ?? false)
        )
      })
    }
    return list
  }, [variants, search, productMap])

  const openStockDialog = (v: ApiProductVariant) => {
    setStockVariant(v)
    setStockValue(String(v.stock))
  }

  const saveStock = () => {
    if (!stockVariant) return
    const parsed = Number(stockValue)
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error('Enter a valid stock quantity')
      return
    }
    updateStock.mutate(
      { id: stockVariant._id, stock: parsed },
      {
        onSuccess: () => {
          toast.success('Stock updated', { description: `${variantName(stockVariant)} now has ${parsed} units.` })
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed'
      toast.error('Save failed', { description: message })
      throw err instanceof Error ? err : new Error(message)
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

  const storeProducts = useMemo(
    () => (products ?? []).map((p) => ({ _id: p._id, name: p.name })),
    [products],
  )

  const columns = useMemo<AppColumnDef<ApiProductVariant>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <code className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {row.original.sku}
          </code>
        ),
      },
      {
        accessorKey: 'productId',
        header: 'Product',
        cell: ({ row }) => {
          const name =
            typeof row.original.productId === 'object' && row.original.productId?.name
              ? row.original.productId.name
              : productMap.get(variantRefId(row.original.productId))?.name ?? '—'
          return (
            <div className="flex items-center gap-3">
              <ProductThumb seed={name} color="transparent" className="size-9" />
              <div className="min-w-0">
                <p className="max-w-52 truncate font-medium">{name}</p>
              </div>
            </div>
          )
        },
      },
      {
        id: 'variant',
        accessorKey: 'sku',
        header: 'Variant',
        cell: ({ row }) => <span>{variantName(row.original)}</span>,
      },
      {
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => <Badge variant="outline">{row.original.size || '—'}</Badge>,
      },
      {
        accessorKey: 'customerSellingPrice',
        header: 'Price',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.customerSellingPrice)}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <Badge variant={row.original.stock === 0 ? 'destructive' : row.original.stock <= (row.original.lowStockThreshold || 10) ? 'warning' : 'success'}>
            {row.original.stock} units
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
    [productMap],
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
        title="Product variants"
        description="Size and color variants across your catalog, with per-SKU stock and pricing."
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
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by SKU, variant or product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md flex-1"
            />
            <p className="text-xs text-muted-foreground">{rows.length} SKUs</p>
          </div>
        }
      />

      <VariantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        variant={formVariant}
        products={storeProducts}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={stockVariant !== null} onOpenChange={(open) => !open && setStockVariant(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust stock</DialogTitle>
            <DialogDescription>
              Update the available units for {stockVariant ? variantName(stockVariant) : ''} ({stockVariant?.sku}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock units</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setStockVariant(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveStock} disabled={updateStock.isPending}>
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
              This permanently removes the variant from your catalog. This action cannot be undone.
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