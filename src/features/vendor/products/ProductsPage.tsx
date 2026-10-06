import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MoreHorizontal, Pencil, Plus, Boxes, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useVendorProducts,
  useSetVendorProductStatus,
  useDeleteVendorProduct,
  useCatalogOptions,
  useVendorSetupStatus,
} from '@/features/vendor/hooks'
import { productRefId, productRefName } from '@/services/product.service'
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
import type { ApiProduct } from '@/services/product.service'

const approvalTabs = [
  { value: 'all', label: 'All approvals' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function ApprovalStatusBadge({ status }: { status: string }) {
  const tone =
    status === 'approved' ? 'success' : status === 'rejected' ? 'destructive' : 'warning'
  return (
    <Badge variant={tone} className="capitalize">
      {status}
    </Badge>
  )
}

export function VendorProductsPage() {
  const navigate = useNavigate()
  const { data: products, isLoading, isError, refetch } = useVendorProducts()
  const { data: catalog } = useCatalogOptions()
  const setStatus = useSetVendorProductStatus()
  const remove = useDeleteVendorProduct()
  const { isComplete: setupComplete, missing: setupMissing, isLoading: setupLoading, unreachable: setupUnreachable } =
    useVendorSetupStatus()
  const setupDone = setupComplete || setupUnreachable
  const [setupPrompt, setSetupPrompt] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [deleting, setDeleting] = useState<ApiProduct | null>(null)

  const filtered = useMemo(() => {
    let rows = products ?? []
    if (categoryFilter !== 'all') rows = rows.filter((p) => productRefId(p.categoryId) === categoryFilter)
    if (approvalFilter !== 'all') rows = rows.filter((p) => p.approvalStatus === approvalFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
    }
    return rows
  }, [products, categoryFilter, approvalFilter, search])

  const changeStatus = useCallback(
    (id: string, status: string) => {
      setStatus.mutate(
        { id, status },
        {
          onSuccess: () =>
            toast.success('Listing updated', { description: `Product moved to ${status}.` }),
          onError: () => toast.error('Update failed — please retry'),
        },
      )
    },
    [setStatus],
  )

  const confirmDelete = () => {
    if (!deleting) return
    remove.mutate(deleting._id, {
      onSuccess: () => {
        toast.success('Product deleted', { description: `${deleting.name} was removed from your catalog.` })
        setDeleting(null)
      },
      onError: () => toast.error('Delete failed — please retry'),
    })
  }

  const columns = useMemo<AppColumnDef<ApiProduct>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProductThumb seed={row.original.name} color={row.original.brand} />
            <div className="min-w-0">
              <p className="max-w-56 truncate font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.brand || '—'}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'categoryId',
        header: 'Category',
        cell: ({ row }) => (
          <span className="line-clamp-2 text-muted-foreground">
            {productRefName(row.original.categoryId) || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'approvalStatus',
        header: 'Approval',
        cell: ({ row }) => <ApprovalStatusBadge status={row.original.approvalStatus} />,
      },
      {
        accessorKey: 'status',
        header: 'Listing',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'success' : 'neutral'} className="capitalize">
            {row.original.status || 'inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'images',
        header: 'Images',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.images?.length ?? 0}</span>,
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
              <DropdownMenuItem onClick={() => navigate(`/vendor/products/${row.original._id}/edit`)}>
                <Pencil />
                Edit product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/vendor/product-variants')}>
                <Boxes />
                Manage variants
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.status !== 'active' && (
                <DropdownMenuItem onClick={() => changeStatus(row.original._id, 'active')}>
                  Set active
                </DropdownMenuItem>
              )}
              {row.original.status === 'active' && (
                <DropdownMenuItem onClick={() => changeStatus(row.original._id, 'inactive')}>
                  Inactivate
                </DropdownMenuItem>
              )}
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
    [changeStatus, navigate],
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
        description="Manage your listings and track their review status."
        actions={
          <Button size="sm" onClick={() => (setupDone ? navigate('/vendor/products/add') : setSetupPrompt(true))}>
            <Plus className="size-4" />
            Add product
          </Button>
        }
      />

      {!setupLoading && !setupDone && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Finish your business setup to list products</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add your business details, then come back and create your first listing.
            </p>
          </div>
          <Button size="sm" variant="outline" asChild className="shrink-0">
            <Link to="/vendor/business-setup">Complete business setup</Link>
          </Button>
        </div>
      )}

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
                placeholder="Search products or brands…"
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
                    {catalog?.categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {approvalTabs.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Showing {filtered.length} listing(s)</p>
          </div>
        }
      />

      <Dialog open={setupPrompt} onOpenChange={setSetupPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete your business setup first</DialogTitle>
            <DialogDescription>
              We need your business details before you can list a product. It takes a minute — add the
              details below and you can add products right away.
            </DialogDescription>
          </DialogHeader>
          {setupMissing.length > 0 && (
            <ul className="grid grid-cols-1 gap-1.5 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground sm:grid-cols-2">
              {setupMissing.map((field) => (
                <li key={field} className="flex items-center gap-1.5">
                  <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {field}
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupPrompt(false)}>
              Not now
            </Button>
            <Button onClick={() => navigate('/vendor/business-setup')}>
              Add business details
              <ArrowRight className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleting?.name ?? 'product'}?</DialogTitle>
            <DialogDescription>
              This permanently removes the listing from the marketplace. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={remove.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              <Trash2 className="size-4" />
              {remove.isPending ? 'Deleting…' : 'Delete product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}