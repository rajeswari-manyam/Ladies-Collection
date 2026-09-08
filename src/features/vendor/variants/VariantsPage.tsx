import { useMemo, useState } from 'react'
import { Boxes, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorProductVariants, useVendorProducts, useUpdateVendorVariantStock } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductThumb } from '@/components/common/artwork'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ErrorState } from '@/components/common/state'
import { formatCurrency } from '@/utils'
import type { VendorProductVariant } from '@/features/vendor/data/vendor-portal'

export function VendorProductVariantsPage() {
  const { data: variants, isLoading, isError, refetch } = useVendorProductVariants()
  const { data: products } = useVendorProducts()
  const updateStock = useUpdateVendorVariantStock()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<VendorProductVariant | null>(null)
  const [stockValue, setStockValue] = useState('')

  const productMap = useMemo(() => {
    const map = new Map(products?.map((p) => [p.id, p]))
    return map
  }, [products])

  const rows = useMemo(() => {
    let list = variants ?? []
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
  }, [variants, search, productMap])

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
          toast.success('Stock updated', { description: `${editing.name} now has ${parsed} units.` })
          setEditing(null)
        },
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  const columns = useMemo<AppColumnDef<VendorProductVariant>[]>(
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
          const product = productMap.get(row.original.productId)
          return (
            <div className="flex items-center gap-3">
              <ProductThumb seed={product?.name ?? 'Item'} color={product?.color ?? 'transparent'} className="size-9" />
              <div className="min-w-0">
                <p className="max-w-52 truncate font-medium">{product?.name ?? '—'}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'name',
        header: 'Variant',
        cell: ({ row }) => <span>{row.original.name}</span>,
      },
      {
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => <Badge variant="outline">{row.original.size}</Badge>,
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.price)}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <Badge variant={row.original.stock === 0 ? 'destructive' : row.original.stock <= 10 ? 'warning' : 'success'}>
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
                <Pencil className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openStockDialog(row.original)}>
                <Boxes />
                Adjust stock
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