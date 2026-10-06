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
import { variantName, variantRefName } from '@/services/variant.service'
import type { ApiProductVariant } from '@/services/variant.service'

export function InventoryPage() {
  const { data: variants, isLoading, isError, refetch } = useProductVariants()
  const { data: products } = useProducts()
  const [search, setSearch] = useState('')

  const productMap = useMemo(() => {
    const map = new Map(products?.map((p) => [p.id, p]))
    return map
  }, [products])

  const variantRefId = (variant: ApiProductVariant): string => {
    if (typeof variant.productId === 'string') return variant.productId
    return variant.productId?._id ?? ''
  }

  const rows = useMemo(() => {
    let list = variants ?? []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((v) => {
        const product = productMap.get(variantRefId(v))
        return (
          v.sku.toLowerCase().includes(q) ||
          variantName(v).toLowerCase().includes(q) ||
          (product?.name.toLowerCase().includes(q) ?? false) ||
          variantRefName(v.productId).toLowerCase().includes(q)
        )
      })
    }
    return list
  }, [variants, search, productMap])

  const stockHealth = (stock: number) => (stock === 0 ? 'destructive' : stock < 25 ? 'warning' : 'success')

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
          const product = productMap.get(variantRefId(row.original))
          const name = product?.name ?? variantRefName(row.original.productId) ?? '—'
          return (
            <div className="flex items-center gap-3">
              <ProductThumb seed={name ?? 'Item'} color={product?.color ?? 'transparent'} className="size-9" />
              <div className="min-w-0">
                <p className="max-w-56 truncate font-medium">{name}</p>
                {product?.status === 'draft' && <p className="text-[11px] text-muted-foreground">Draft listing</p>}
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
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5">
            {row.original.color && <span className="size-3 rounded-full border border-border" style={{ background: row.original.color }} />}
            {row.original.color || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'customerSellingPrice',
        header: 'Price',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.customerSellingPrice)}</span>,
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
            onClick={() => refetch().then(() => toast.success('Inventory synced', { description: 'Vendor stock levels refreshed from the API.' }))}
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