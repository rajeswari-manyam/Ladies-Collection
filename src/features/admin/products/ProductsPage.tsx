import { useCallback, useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ban, BadgeCheck, MoreHorizontal, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  useProductApprovals,
  useUpdateProductStatus,
  useUpdateAdminProduct,
  useDeleteAdminProduct,
  useApproveProduct,
  useRejectProduct,
} from '@/features/admin/hooks'
import { productRefName } from '@/services/product.service'
import { PageHeader } from '@/layouts/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { ProductThumb } from '@/components/common/artwork'
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

interface SpecRow {
  key: string
  value: string
}

function parseImages(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ProductsPage() {
  const { data: products, isLoading, isError, refetch } = useProductApprovals()
  const updateStatus = useUpdateProductStatus()
  const updateProduct = useUpdateAdminProduct()
  const remove = useDeleteAdminProduct()
  const approve = useApproveProduct()
  const reject = useRejectProduct()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [editing, setEditing] = useState<ApiProduct | null>(null)
  const [deleting, setDeleting] = useState<ApiProduct | null>(null)
  const [rejecting, setRejecting] = useState<ApiProduct | null>(null)

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>()
    ;(products ?? []).forEach((p) => {
      const id = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id
      const name = productRefName(p.categoryId)
      if (id && name) map.set(id, name)
    })
    return map
  }, [products])

  const filtered = useMemo(() => {
    let rows = products ?? []
    if (categoryFilter !== 'all') {
      rows = rows.filter((p) => {
        const id = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id
        return id === categoryFilter
      })
    }
    if (approvalFilter !== 'all') rows = rows.filter((p) => p.approvalStatus === approvalFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q),
      )
    }
    return rows
  }, [products, categoryFilter, approvalFilter, search])

  const changeStatus = useCallback(
    (id: string, status: string) => {
      updateStatus.mutate(
        { id, status },
        {
          onSuccess: () => toast.success('Listing updated', { description: `Product moved to ${status}.` }),
          onError: () => toast.error('Update failed — please retry'),
        },
      )
    },
    [updateStatus],
  )

  const confirmDelete = () => {
    if (!deleting) return
    remove.mutate(deleting._id, {
      onSuccess: () => {
        toast.success('Product deleted', { description: `${deleting.name} was removed from the catalog.` })
        setDeleting(null)
      },
      onError: () => toast.error('Delete failed — please retry'),
    })
  }

  const approveProduct = useCallback(
    (product: ApiProduct) => {
      approve.mutate(product._id, {
        onSuccess: () =>
          toast.success('Product approved', { description: `${product.name} is now live in the catalog.` }),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Approval failed — please retry'),
      })
    },
    [approve],
  )

  const confirmReject = () => {
    if (!rejecting) return
    reject.mutate(
      { id: rejecting._id, reason: 'Brand guidelines not met.' },
      {
        onSuccess: () => {
          toast.success('Product rejected', { description: `${rejecting.name} was sent back to the vendor.` })
          setRejecting(null)
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Rejection failed — please retry'),
      },
    )
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
              <p className="text-xs text-muted-foreground">by {row.original.brand || '—'}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'categoryId',
        header: 'Category',
        cell: ({ row }) => <span className="text-muted-foreground">{productRefName(row.original.categoryId) || '—'}</span>,
      },
      {
        accessorKey: 'vendorId',
        header: 'Vendor',
        cell: ({ row }) => <span className="text-muted-foreground">{productRefName(row.original.vendorId) || '—'}</span>,
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
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            {row.original.approvalStatus === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="soft"
                  disabled={approve.isPending}
                  onClick={() => approveProduct(row.original)}
                >
                  <BadgeCheck className="size-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reject.isPending}
                  onClick={() => setRejecting(row.original)}
                >
                  <Ban className="size-4" />
                  Reject
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {row.original.approvalStatus === 'pending' && (
                  <>
                    <DropdownMenuItem onClick={() => approveProduct(row.original)}>
                      <BadgeCheck />
                      Approve product
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => setRejecting(row.original)}>
                      <Ban />
                      Reject product
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setEditing(row.original)}>
                  <Pencil />
                  Edit product
                </DropdownMenuItem>
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
          </div>
        ),
      },
    ],
    [approve.isPending, approveProduct, changeStatus, reject.isPending],
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
        description="Browse and manage every listing across all marketplace vendors."
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
                placeholder="Search products or brands…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-full"
              />
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {Array.from(categoryNames.entries()).map(([id, name]) => (
                      <SelectItem key={id} value={id}>
                        {name}
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
            <p className="text-xs text-muted-foreground">{filtered.length} listing(s)</p>
          </div>
        }
      />

      <EditProductDialog
        product={editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        submit={(patch) =>
          editing
            ? updateProduct.mutate(
                { id: editing._id, patch },
                {
                  onSuccess: () => {
                    toast.success('Product updated', { description: `${editing.name} was saved.` })
                    setEditing(null)
                  },
                  onError: () => toast.error('Save failed — please retry'),
                },
              )
            : undefined
        }
        pending={updateProduct.isPending}
      />

      <Dialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejecting?.name ?? 'product'}?</DialogTitle>
            <DialogDescription>
              The listing goes back to the vendor as rejected and stays hidden from the storefront.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)} disabled={reject.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={reject.isPending}>
              <Ban className="size-4" />
              {reject.isPending ? 'Rejecting…' : 'Reject product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleting?.name ?? 'product'}?</DialogTitle>
            <DialogDescription>
              This permanently removes the listing from the catalog. This action cannot be undone.
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

interface EditProductDialogProps {
  product: ApiProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
  submit: (patch: {
    name: string
    description: string
    images?: string[]
    specifications?: Record<string, string>
  }) => unknown
  pending: boolean
}

const editFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Add a short description'),
  images: z.string().optional(),
})

type EditFormValues = z.infer<typeof editFormSchema>

function EditProductDialog({ product, open, onOpenChange, submit, pending }: EditProductDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema) as unknown as Resolver<EditFormValues>,
    defaultValues: { name: '', description: '', images: '' },
  })

  const [specs, setSpecs] = useState<SpecRow[]>([])

  const openWith = (item: ApiProduct) => {
    reset({
      name: item.name,
      description: item.description,
      images: Array.isArray(item.images) ? item.images.join('\n') : '',
    })
    const entries = Object.entries(item.specifications ?? {})
    setSpecs(entries.length ? entries.map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onOpenChange(false)
          return
        }
        if (product) openWith(product)
        onOpenChange(true)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {product?.name}</DialogTitle>
          <DialogDescription>Update listing details that vendors submitted.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={handleSubmit((values) => {
            void submit({
              name: values.name,
              description: values.description,
              images: parseImages(values.images ?? ''),
              specifications: specs.filter((s) => s.key.trim()).reduce<Record<string, string>>((acc, s) => {
                acc[s.key.trim()] = s.value.trim()
                return acc
              }, {}),
            })
          })}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" placeholder="e.g. Rosewater Anarkali Gown" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Short description</Label>
            <Textarea id="description" placeholder="Describe the fabric, fit and occasion…" {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="images">Image URLs</Label>
            <Textarea
              id="images"
              rows={3}
              placeholder="One URL per line"
              {...register('images')}
            />
          </div>
          <div className="space-y-2">
            <Label>Specifications</Label>
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Key (e.g. fabric)"
                  value={spec.key}
                  onChange={(e) => setSpecs((list) => list.map((s, j) => (j === i ? { ...s, key: e.target.value } : s)))}
                />
                <Input
                  placeholder="Value (e.g. Pure Silk)"
                  value={spec.value}
                  onChange={(e) => setSpecs((list) => list.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSpecs((list) => list.filter((_, j) => j !== i))}
                  aria-label="Remove specification"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSpecs((list) => [...list, { key: '', value: '' }])}
            >
              <Plus className="size-3.5" />
              Add specification
            </Button>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              <Save className="size-4" />
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}