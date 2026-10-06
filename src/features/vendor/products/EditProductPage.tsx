import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorProduct, useUpdateVendorProduct, useCatalogOptions } from '@/features/vendor/hooks'
import { productRefId } from '@/services/product.service'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().min(10, 'Add a short description'),
  images: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SpecRow {
  key: string
  value: string
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseImages(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function VendorEditProductPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading } = useVendorProduct(id)
  const { data: catalog } = useCatalogOptions()
  const update = useUpdateVendorProduct()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: { name: '', slug: '', brand: '', description: '', images: '' },
  })
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [specs, setSpecs] = useState<SpecRow[]>([])
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!product) return
    reset({
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      images: Array.isArray(product.images) ? product.images.join('\n') : '',
    })
  }, [product, reset])

  if (product && product._id !== loadedId) {
    setLoadedId(product._id)
    setCategoryId(productRefId(product.categoryId))
    setSubCategoryId(productRefId(product.subCategoryId))
    const entries = Object.entries(product.specifications ?? {})
    setSpecs(entries.length ? entries.map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }])
  }

  const subcategories = (catalog?.subcategories ?? []).filter((s) => s.categoryId === categoryId)

  const submit = async (values: FormValues) => {
    setSaving(true)
    try {
      await update.mutateAsync({
        id,
        patch: {
          name: values.name,
          slug: slugify(values.slug || values.name),
          brand: values.brand?.trim() || undefined,
          description: values.description,
          images: parseImages(values.images ?? ''),
          specifications: specs.filter((s) => s.key.trim()).reduce<Record<string, string>>((acc, s) => {
            acc[s.key.trim()] = s.value.trim()
            return acc
          }, {}),
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
        description={`${product.brand || 'Unbranded'} · Approval: ${product.approvalStatus || 'pending'}`}
        actions={
          <Button onClick={handleSubmit(submit)} disabled={saving}>
            <Save className="size-4" />
            {saving ? 'Saving…' : 'Save changes'}
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="Auto-generated from name, or set your own" {...register('slug')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="e.g. Saree House" {...register('brand')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="images">Image URLs</Label>
              <Input
                id="images"
                placeholder="https://… , https://… (comma separated)"
                {...register('images')}
              />
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
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Category & specifications</CardTitle>
              <CardDescription>Where the product appears and its key attributes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubCategoryId('') }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(catalog?.categories ?? []).map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {subcategories.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Subcategory</Label>
                  <Select value={subCategoryId} onValueChange={setSubCategoryId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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