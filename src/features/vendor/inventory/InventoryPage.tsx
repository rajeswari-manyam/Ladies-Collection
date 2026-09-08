import { useMemo, useState } from 'react'
import { Boxes, PackageSearch, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorProductVariants, useVendorProducts, useUpdateVendorVariantStock } from '@/features/vendor/hooks'
import { LOW_STOCK_THRESHOLD, lowStockCount } from '@/features/vendor/data/vendor-portal'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProductThumb } from '@/components/common/artwork'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ErrorState } from '@/components/common/state'
import type { VendorProductVariant } from '@/features/vendor/data/vendor-portal'

export function VendorInventoryPage() {
  const { data: variants, isLoading, isError, refetch } = useVendorProductVariants()
  const { data: products } = useVendorProducts()
  const updateStock = useUpdateVendorVariantStock()
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [editing, setEditing] = useState<VendorProductVariant | null>(null)
  const [stockValue, setStockValue] = useState('')

  const productMap = useMemo(() => {
    const map = new Map(products?.map((p) => [p.id, p]))
    return map
  }, [products])

  const rows = useMemo(() => {
    let list = variants ?? []
    if (lowOnly) list = list.filter((v) => v.stock <= LOW_STOCK_THRESHOLD)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((v) => {
        const product = productMap.get(v.productId)
        return (
          v.sku.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q) ||
          (product?.name.toLowerCase().includes(q) ?? false)
        )
      })
    }
    return list
  }, [variants, search, lowOnly, productMap])

  const openStockDialog = (v: VendorProductVariant) => {
    setEditing(v)
    setStockValue(String(v.stock))
  }

  const saveStock = () => {
    if (!editing) return
    const parsed = Number(stockValue)
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error('Enter a valid stock quantity')
      return
    }
    updateStock.mutate(
      { id: editing.id, stock: parsed },
      {
        onSuccess: () => {
          toast.success('Stock updated', { description: `${editing.sku} now has ${parsed} units.` })
          setEditing(null)
        },
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  const stockHealth = (stock: number) => (stock === 0 ? 'destructive' : stock <= LOW_STOCK_THRESHOLD ? 'warning' : 'success')

  const columns = useMemo<AppColumnDef<VendorProductVariant>[]>(
    () => [
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <code className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{row.original.sku}</code>
        ),
      },
      {
        accessorKey: 'productId',
        header: 'Product',
        cell: ({ row }) => {
          const product = productMap.get(row.original.productId)
          return (
            <div className="flex items-center gap-3">
              <ProductThumb seed={product?.name ?? 'Item'} color={product?.color ?? 'transparent'} className="size-9" />
              <div className="min-w-0">
                <p className="max-w-52 truncate font-medium">{product?.name ?? '—'}</p>
                <p className="text-[11px] text-muted-foreground">{row.original.size} · {row.original.color}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'stock',
        header: 'Availability',
        cell: ({ row }) => {
          const stock = row.original.stock
          return (
            <div className="flex min-w-36 flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{stock} units</span>
                <Badge variant={stockHealth(stock)}>
                  {stock === 0 ? 'Out of stock' : stock <= LOW_STOCK_THRESHOLD ? 'Low' : 'In stock'}
                </Badge>
              </div>
              <Progress
                value={Math.min(100, (stock / 40) * 100)}
                indicatorClassName={stock === 0 ? 'bg-destructive' : stock <= LOW_STOCK_THRESHOLD ? 'bg-amber-500' : 'bg-emerald-500'}
              />
            </div>
          )
        },
      },
      {
        accessorKey: 'name',
        header: 'Variant',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.name}</span>,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => openStockDialog(row.original)}>
            Adjust
          </Button>
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
        title="Inventory"
        description="Track stock across every size, color and SKU variant. You have 7 low-stock items to review."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Inventory synced', { description: 'Stock levels refreshed from the mock feed.' })}
          >
            <Boxes className="size-4" />
            Sync stock
          </Button>
        }
      />

      <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
        <TriangleAlert className="size-4 text-amber-600" />
        <span className="text-amber-800">
          <span className="font-semibold">{lowStockCount} low-stock item(s)</span> are at or below {LOW_STOCK_THRESHOLD} units —
          restock to avoid losing sales.
        </span>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No variants found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <PackageSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by SKU, variant or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={lowOnly ? 'soft' : 'outline'}
                size="sm"
                onClick={() => setLowOnly((v) => !v)}
              >
                <TriangleAlert className="size-3.5" />
                Low stock only
              </Button>
              <p className="text-xs text-muted-foreground">{rows.length} SKUs tracked</p>
            </div>
          </div>
        }
      />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust stock</DialogTitle>
            <DialogDescription>
              Update the available units for {editing?.name} ({editing?.sku}).
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
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveStock} disabled={updateStock.isPending}>
              Save stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}