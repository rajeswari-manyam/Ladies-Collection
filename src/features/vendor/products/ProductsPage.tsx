import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Pencil, Plus, Star, Boxes } from 'lucide-react'
import { toast } from 'sonner'
import {
  useVendorProducts,
  useSetVendorProductStatus,
} from '@/features/vendor/hooks'
import { TOTAL_PRODUCTS } from '@/features/vendor/data/vendor-portal'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductThumb } from '@/components/common/artwork'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { ProductStatusBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import { formatCurrency } from '@/utils'
import type { ProductStatus } from '@/features/vendor/types'
import type { VendorProduct } from '@/features/vendor/data/vendor-portal'

const CATEGORIES = ['Sarees', 'Kurtas & Tunics', 'Dresses', 'Ethnic Sets', 'Accessories']

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'out-of-stock', label: 'Out of stock' },
  { value: 'archived', label: 'Archived' },
]

export function VendorProductsPage() {
  const navigate = useNavigate()
  const { data: products, isLoading, isError, refetch } = useVendorProducts()
  const setStatus = useSetVendorProductStatus()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let rows = products ?? []
    if (categoryFilter !== 'all') rows = rows.filter((p) => p.category === categoryFilter)
    if (statusFilter !== 'all') rows = rows.filter((p) => p.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)),
      )
    }
    return rows
  }, [products, categoryFilter, statusFilter, search])

  const changeStatus = (id: string, status: ProductStatus) => {
    setStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success('Product updated', { description: `Listing moved to ${status.replace('-', ' ')}.` }),
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  const columns = useMemo<AppColumnDef<VendorProduct>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProductThumb seed={row.original.name} color={row.original.color} />
            <div className="min-w-0">
              <p className="max-w-56 truncate font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.category}</p>
              {row.original.featured && <Badge variant="rose" className="mt-0.5">Featured</Badge>}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{formatCurrency(row.original.price)}</span>
            {row.original.mrp && (
              <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatCurrency(row.original.mrp)}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <Badge variant={row.original.stock === 0 ? 'destructive' : row.original.stock <= 15 ? 'warning' : 'success'}>
            {row.original.stock} units
          </Badge>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {row.original.rating.toFixed(1)}
            <span className="text-xs">({row.original.reviews})</span>
          </span>
        ),
      },
      {
        accessorKey: 'sold',
        header: 'Sold',
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.sold}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
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
              <DropdownMenuItem onClick={() => navigate(`/vendor/products/${row.original.id}/edit`)}>
                <Pencil />
                Edit product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/vendor/product-variants')}>
                <Boxes />
                Manage variants
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.status !== 'active' && (
                <DropdownMenuItem onClick={() => changeStatus(row.original.id, 'active')}>
                  Set active
                </DropdownMenuItem>
              )}
              {row.original.status !== 'draft' && (
                <DropdownMenuItem onClick={() => changeStatus(row.original.id, 'draft')}>
                  Move to draft
                </DropdownMenuItem>
              )}
              {row.original.status !== 'archived' && (
                <DropdownMenuItem onClick={() => changeStatus(row.original.id, 'archived')}>
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [navigate],
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
        title="Products"
        description={`Manage your listings. Showing your curated edit of the ${TOTAL_PRODUCTS}-product catalog.`}
        actions={
          <Button size="sm" asChild>
            <Link to="/vendor/products/add">
              <Plus className="size-4" />
              Add product
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyTitle="No products found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
              <Input
                placeholder="Search products or tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-full"
              />
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {TOTAL_PRODUCTS} listing(s)
            </p>
          </div>
        }
      />
    </div>
  )
}