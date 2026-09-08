import { useMemo, useState } from 'react'
import { Boxes, PackageSearch } from 'lucide-react'
import { toast } from 'sonner'
import { useProducts, useProductVariants } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ErrorState } from '@/components/common/state'
import { ProductThumb } from '@/components/common/artwork'
import { formatCurrency } from '@/utils'
import type { ProductVariant } from '@/features/admin/types'

export function InventoryPage() {
  const { data: variants, isLoading, isError, refetch } = useProductVariants()
  const { data: products } = useProducts()
  const [search, setSearch] = useState('')

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

  const stockHealth = (stock: number) => (stock === 0 ? 'destructive' : stock < 25 ? 'warning' : 'success')

  const columns = useMemo<AppColumnDef<ProductVariant>[]>(
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
                <p className="max-w-56 truncate font-medium">{product?.name ?? '—'}</p>
                {product?.status === 'draft' && <p className="text-[11px] text-muted-foreground">Draft listing</p>}
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
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full border border-border" style={{ background: row.original.color }} />
            {row.original.color}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.price)}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Availability',
        cell: ({ row }) => {
          const stock = row.original.stock
          return (
            <div className="flex min-w-32 flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{stock} units</span>
                <Badge variant={stockHealth(stock)}>{stock === 0 ? 'Out of stock' : stock < 25 ? 'Low' : 'In stock'}</Badge>
              </div>
              <Progress value={Math.min(100, (stock / 50) * 100)} indicatorClassName={stock === 0 ? 'bg-destructive' : stock < 25 ? 'bg-amber-500' : 'bg-emerald-500'} />
            </div>
          )
        },
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
        description="Track stock across every size, color and SKU variant."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Inventory synced', { description: 'All vendor stock levels refreshed from the mock feed.' })}
          >
            <Boxes className="size-4" />
            Sync stock
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
            <div className="relative max-w-md flex-1">
              <PackageSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by SKU, variant or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">{rows.length} SKUs tracked</p>
          </div>
        }
      />
    </div>
  )
}