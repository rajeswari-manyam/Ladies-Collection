import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateVendorProduct } from '@/features/vendor/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const VENDOR_CATEGORIES = ['Sarees', 'Kurtas & Tunics', 'Dresses', 'Ethnic Sets', 'Accessories']

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

export function VendorAddProductPage() {
  const navigate = useNavigate()
  const create = useCreateVendorProduct()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
  const [saving, setSaving] = useState(false)

  const submit = async (values: FormValues) => {
    setSaving(true)
    try {
      await create.mutateAsync({
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
      })
      toast.success('Product submitted', {
        description: `${values.name} is now a draft and ready for review.`,
      })
      navigate('/vendor/products')
    } catch {
      toast.error('Could not create product — please retry')
    } finally {
      setSaving(false)
    }
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
        title="Add product"
        description="Create a new listing for Fashion Trends. It will be saved as a draft for review."
        actions={
          <Button onClick={handleSubmit(submit)} disabled={saving}>
            <Save className="size-4" />
            {saving ? 'Saving…' : 'Save product'}
          </Button>
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
                  <SelectValue placeholder="Select category" />
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
            <Plus className="size-4" />
            {saving ? 'Saving…' : 'Save product'}
          </Button>
        </div>
      </form>
    </div>
  )
}