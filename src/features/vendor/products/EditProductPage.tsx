import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorProduct, useUpdateVendorProduct } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { ProductStatusBadge } from '@/components/common/status-badge'
import { formatCurrency } from '@/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VENDOR_CATEGORIES } from '@/features/vendor/products/AddProductPage'

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category: z.string().min(1, 'Select a category'),
  color: z.string().min(1, 'Add a color'),
  description: z.string().min(10, 'Add a short description'),
  price: z.coerce.number().positive('Price must be positive'),
  mrp: z.string().optional(),
  stock: z.coerce.number().min(0).int(),
  tags: z.string(),
  featured: z.boolean().default(false),
})

type FormValues = z.infer<typeof schema>

export function VendorEditProductPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading } = useVendorProduct(id)
  const update = useUpdateVendorProduct()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues, any, any>,
    defaultValues: {
      name: '',
      category: '',
      color: '',
      description: '',
      price: 0,
      mrp: '',
      stock: 0,
      tags: '',
      featured: false,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category,
        color: product.color,
        description: product.description,
        price: product.price,
        mrp: product.mrp ? String(product.mrp) : '',
        stock: product.stock,
        tags: product.tags.join(', '),
        featured: product.featured,
      })
    }
  }, [product, reset])

  const submit = async (values: FormValues) => {
    setSaving(true)
    try {
      await update.mutateAsync({
        id,
        patch: {
          name: values.name,
          category: values.category,
          color: values.color,
          description: values.description,
          price: values.price,
          mrp: values.mrp ? Number(values.mrp) : null,
          stock: values.stock,
          tags: values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          featured: values.featured,
        },
      })
      toast.success('Product updated', { description: `${values.name} was saved.` })
      navigate('/vendor/products')
    } catch {
      toast.error('Could not save product — please retry')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Product not found"
          description="This listing could not be located in your catalog."
          action={
            <Button variant="outline" asChild>
              <Link to="/vendor/products">All products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
        <Link to="/vendor/products">
          <ArrowLeft className="size-4" />
          All products
        </Link>
      </Button>

      <PageHeader
        eyebrow="Catalog"
        title={product.name}
        description={`Listed ${product.createdAt} · ${product.sold} sold · ${formatCurrency(product.price)}`}
        actions={
          <div className="flex items-center gap-2">
            <ProductStatusBadge status={product.status} />
            <Button onClick={handleSubmit(submit)} disabled={saving}>
              <Save className="size-4" />
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        }
      />

      <form className="grid grid-cols-1 gap-4 xl:grid-cols-3" onSubmit={handleSubmit(submit)}>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>Core information shown on the listing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" placeholder="e.g. Banarasi Silk Saree" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input id="color" placeholder="e.g. Teal" {...register('color')} />
              {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Short description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the fabric, fit and occasion…"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="Comma separated, e.g. best-seller, bridal, saree" {...register('tags')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & stock</CardTitle>
              <CardDescription>Set the selling price and availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" step="1" placeholder="0" {...register('price')} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mrp">Compare-at price (MRP)</Label>
                <Input id="mrp" type="number" step="1" placeholder="optional" {...register('mrp')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock units</Label>
                <Input id="stock" type="number" {...register('stock')} />
                {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Featured listing</p>
                  <p className="text-xs text-muted-foreground">Promote this product on the marketplace</p>
                </div>
                <Switch checked={watch('featured')} onCheckedChange={(v) => setValue('featured', v)} />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" type="submit" disabled={saving}>
            <Save className="size-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}