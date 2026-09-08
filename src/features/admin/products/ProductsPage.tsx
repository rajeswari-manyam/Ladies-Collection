import { useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MoreHorizontal, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCategories, useProducts, useVendors, useAddProduct } from '@/features/admin/hooks'
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
import { ProductStatusBadge } from '@/components/common/status-badge'
import { ProductThumb } from '@/components/common/artwork'
import { ErrorState } from '@/components/common/state'
import { formatCurrency } from '@/utils'
import type { Product } from '@/features/admin/types'

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Add a short description'),
  vendorId: z.string().min(1, 'Select a vendor'),
  categoryId: z.string().min(1, 'Select a category'),
  subcategoryId: z.string().min(1, 'Select a subcategory'),
  color: z.string().min(1, 'Add a color'),
  price: z.coerce.number().positive('Price must be positive'),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal('')),
  stock: z.coerce.number().min(0).int(),
  brand: z.string().min(1, 'Select a brand'),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductsPage() {
  const { data: products, isLoading, isError, refetch } = useProducts()
  const { data: categories } = useCategories()
  const { data: vendors } = useVendors()
  const addProduct = useAddProduct()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const categoryName = useMemo(() => {
    const map = new Map(categories?.categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [categories])

  const vendorName = useMemo(() => {
    const map = new Map(vendors?.map((v) => [v.id, v.brand]))
    return (id: string) => map.get(id) ?? '—'
  }, [vendors])

  const filtered = useMemo(() => {
    let rows = products ?? []
    if (categoryFilter !== 'all') rows = rows.filter((p) => p.categoryId === categoryFilter)
    if (statusFilter !== 'all') rows = rows.filter((p) => p.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)),
      )
    }
    return rows
  }, [products, categoryFilter, statusFilter, search])

  const columns = useMemo<AppColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProductThumb seed={row.original.name} color={row.original.color} />
            <div className="min-w-0">
              <p className="max-w-56 truncate font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">by {row.original.brand}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'categoryId',
        header: 'Category',
        cell: ({ row }) => <span className="text-muted-foreground">{categoryName(row.original.categoryId)}</span>,
      },
      {
        accessorKey: 'vendorId',
        header: 'Vendor',
        cell: ({ row }) => <span className="text-muted-foreground">{vendorName(row.original.vendorId)}</span>,
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{formatCurrency(row.original.price)}</span>
            {row.original.compareAtPrice && (
              <span className="ml-1.5 text-xs text-muted-foreground line-through">
                {formatCurrency(row.original.compareAtPrice)}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <Badge variant={row.original.stock === 0 ? 'destructive' : row.original.stock < 40 ? 'warning' : 'success'}>
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info(`Opened edit view for ${row.original.name}`)}>
                <Pencil />
                Edit product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(`Opened inventory for ${row.original.name}`)}>
                <Star />
                Manage variants
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => toast.error('Cannot delete — demo mode')}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [categoryName, vendorName],
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
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Add product
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
                placeholder="Search products, brands or tags…"
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
                    {categories?.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="out-of-stock">Out of stock</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{filtered.length} listing(s)</p>
          </div>
        }
      />

      <AddProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ship={{
          categories: categories?.categories ?? [],
          subcategories: categories?.subcategories ?? [],
          vendors: vendors ?? [],
          loading: addProduct.isPending,
          submit: async (values) => {
            await addProduct.mutateAsync({
              ...values,
              featured: values.featured,
              tags: values.tags,
              compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
            })
            toast.success('Product published', { description: `${values.name} has been added to the catalog.` })
            setDialogOpen(false)
          },
        }}
      />
    </div>
  )
}

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ship: {
    categories: { id: string; name: string }[]
    subcategories: { id: string; categoryId: string; name: string }[]
    vendors: { id: string; brand: string }[]
    loading: boolean
    submit: (values: ProductFormValues) => Promise<void>
  }
}

function AddProductDialog({ open, onOpenChange, ship }: AddProductDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues, any, any>,
    defaultValues: {
      name: '',
      description: '',
      vendorId: '',
      categoryId: '',
      subcategoryId: '',
      color: '',
      price: 0,
      compareAtPrice: '',
      stock: 0,
      brand: '',
      featured: false,
      tags: [],
    },
  })

  const categoryId = watch('categoryId')
  const subcategories = ship.subcategories.filter((s) => s.categoryId === categoryId)

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) reset()
        onOpenChange(value)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a product</DialogTitle>
          <DialogDescription>
            Publish a new listing to the catalog. Variants can be configured afterwards from inventory.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={handleSubmit((values) =>
            ship.submit(values).catch(() => toast.error('Could not publish product — please retry')),
          )}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" placeholder="e.g. Rosette Silk Slip Dress" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Short description</Label>
              <Textarea id="description" placeholder="Describe the fabric, fit and occasion…" {...register('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Select
                value={watch('vendorId')}
                onValueChange={(v) => {
                  register('vendorId').onChange({ target: { value: v } })
                  const vendor = ship.vendors.find((x) => x.id === v)
                  if (vendor) setValue('brand', vendor.brand)
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {ship.vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendorId && <p className="text-xs text-destructive">{errors.vendorId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input placeholder="e.g. Blush Rose" {...register('color')} />
              {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(v) => register('categoryId').onChange({ target: { value: v } })}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {ship.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Select
                value={watch('subcategoryId')}
                onValueChange={(v) => register('subcategoryId').onChange({ target: { value: v } })}
              >
                <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                <SelectContent>
                  {subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subcategoryId && <p className="text-xs text-destructive">{errors.subcategoryId.message}</p>}
            </div>
            <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00" {...register('price')} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compareAt">Compare-at price</Label>
                <Input id="compareAt" type="number" step="0.01" placeholder="optional" {...register('compareAtPrice')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock units</Label>
                <Input id="stock" type="number" {...register('stock')} />
                {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={ship.loading}>
              <Plus className="size-4" />
              {ship.loading ? 'Publishing…' : 'Publish product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}