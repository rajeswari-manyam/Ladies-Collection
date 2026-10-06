import { useEffect, useState } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { ApiProductVariant, CreateVariantInput } from '@/services/variant.service'

const schema = z
  .object({
    productId: z.string().min(1, 'Select a product'),
    sku: z.string().min(1, 'SKU is required'),
    size: z.string(),
    color: z.string(),
    material: z.string(),
    design: z.string(),
    attributesText: z.string(),
    imagesText: z.string(),
    stock: z.string(),
    lowStockThreshold: z.string(),
    vendorBasePrice: z.string().min(1, 'Base price is required'),
    vendorDiscountPercent: z.string(),
    adminAdditionalPercent: z.string(),
  })
  .superRefine((values, ctx) => {
    const discount = Number(values.vendorDiscountPercent || 0)
    if (discount < 0 || discount > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['vendorDiscountPercent'], message: 'Must be between 0 and 100' })
    }
    const additional = Number(values.adminAdditionalPercent || 0)
    if (additional < 0 || additional > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['adminAdditionalPercent'], message: 'Must be between 0 and 100' })
    }
    const stock = Number(values.stock || 0)
    if (!Number.isFinite(stock) || stock < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stock'], message: 'Stock must be 0 or more' })
    }
  })

type FormValues = z.infer<typeof schema>

export interface VariantProductOption {
  _id: string
  name: string
}

interface VariantFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: VariantProductOption[]
  variant?: ApiProductVariant | null
  onSubmit: (input: CreateVariantInput) => Promise<unknown> | unknown
  submitLabel?: string
  title?: string
  description?: string
}

function numberOr(value: string, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const line of raw.split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (key) attributes[key] = value
  }
  return attributes
}

function parseImages(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function VariantFormDialog({
  open,
  onOpenChange,
  products,
  variant,
  onSubmit,
  submitLabel = 'Save variant',
  title = variant ? 'Edit variant' : 'Add variant',
  description = 'Configure the SKU, attributes, stock and pricing for this variant.',
}: VariantFormDialogProps) {
  const [pending, setPending] = useState(false)
  const isEdit = Boolean(variant)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      productId: variant?.productId && typeof variant.productId !== 'string' ? variant.productId._id : (variant?.productId as string) ?? '',
      sku: variant?.sku ?? '',
      size: variant?.size ?? '',
      color: variant?.color ?? '',
      material: variant?.material ?? '',
      design: variant?.design ?? '',
      attributesText: variant ? Object.entries(variant.attributes ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
      imagesText: variant?.images?.join('\n') ?? '',
      stock: variant ? String(variant.stock) : '0',
      lowStockThreshold: variant ? String(variant.lowStockThreshold) : '10',
      vendorBasePrice: variant ? String(variant.vendorBasePrice) : '',
      vendorDiscountPercent: variant ? String(variant.vendorDiscountPercent) : '0',
      adminAdditionalPercent: variant ? String(variant.adminAdditionalPercent) : '0',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      productId: variant && typeof variant.productId !== 'string' ? variant.productId._id : ((variant?.productId as string) ?? ''),
      sku: variant?.sku ?? '',
      size: variant?.size ?? '',
      color: variant?.color ?? '',
      material: variant?.material ?? '',
      design: variant?.design ?? '',
      attributesText: variant ? Object.entries(variant.attributes ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
      imagesText: variant?.images?.join('\n') ?? '',
      stock: variant ? String(variant.stock) : '0',
      lowStockThreshold: variant ? String(variant.lowStockThreshold) : '10',
      vendorBasePrice: variant ? String(variant.vendorBasePrice) : '',
      vendorDiscountPercent: variant ? String(variant.vendorDiscountPercent) : '0',
      adminAdditionalPercent: variant ? String(variant.adminAdditionalPercent) : '0',
    })
  }, [open, variant, reset])

  const productId = useWatch({ control, name: 'productId' })

  const submit = handleSubmit(async (values) => {
    if (pending) return
    setPending(true)
    try {
      await onSubmit({
        productId: values.productId,
        sku: values.sku.trim(),
        size: values.size.trim() || undefined,
        color: values.color.trim() || undefined,
        material: values.material.trim() || undefined,
        design: values.design.trim() || undefined,
        attributes: parseAttributes(values.attributesText),
        images: parseImages(values.imagesText),
        stock: numberOr(values.stock, 0),
        lowStockThreshold: numberOr(values.lowStockThreshold, 10),
        vendorBasePrice: numberOr(values.vendorBasePrice, 0),
        vendorDiscountPercent: numberOr(values.vendorDiscountPercent, 0),
        adminAdditionalPercent: numberOr(values.adminAdditionalPercent, 0),
      })
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  })

  const errorCls = (hasError: boolean) => (hasError ? 'border-destructive focus-visible:ring-destructive/50' : '')

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Product</Label>
              <Select
                value={productId}
                onValueChange={(v) => setValue('productId', v, { shouldValidate: true })}
                disabled={isEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">No products available</div>
                  )}
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-xs text-destructive">{errors.productId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-sku">SKU</Label>
              <Input id="v-sku" placeholder="e.g. SH-SILK-RED-M" {...register('sku')} className={errorCls(Boolean(errors.sku))} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-size">Size</Label>
              <Input id="v-size" placeholder="e.g. M" {...register('size')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-color">Colour</Label>
              <Input id="v-color" placeholder="e.g. Red" {...register('color')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-material">Material</Label>
              <Input id="v-material" placeholder="e.g. Silk" {...register('material')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-design">Design</Label>
              <Input id="v-design" placeholder="e.g. Zari Border" {...register('design')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-threshold">Low stock threshold</Label>
              <Input id="v-threshold" type="number" min={0} placeholder="10" {...register('lowStockThreshold')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-stock">Stock</Label>
              <Input id="v-stock" type="number" min={0} placeholder="0" {...register('stock')} className={errorCls(Boolean(errors.stock))} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="v-attributes">Attributes</Label>
              <Textarea id="v-attributes" rows={2} placeholder={'One per line, e.g.\nborderWidth: 2 inch'} {...register('attributesText')} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="v-images">Image URLs</Label>
              <Textarea id="v-images" rows={2} placeholder="https://… , https://… (one per line or comma separated)" {...register('imagesText')} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Pricing</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-base">Base price (₹)</Label>
                <Input id="v-base" type="number" min={0} step="0.01" placeholder="e.g. 1000" {...register('vendorBasePrice')} className={errorCls(Boolean(errors.vendorBasePrice))} />
                {errors.vendorBasePrice && <p className="text-xs text-destructive">{errors.vendorBasePrice.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-discount">Vendor discount (%)</Label>
                <Input id="v-discount" type="number" min={0} max={100} step="0.1" placeholder="0" {...register('vendorDiscountPercent')} className={errorCls(Boolean(errors.vendorDiscountPercent))} />
                {errors.vendorDiscountPercent && <p className="text-xs text-destructive">{errors.vendorDiscountPercent.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-admin">Admin add-on (%)</Label>
                <Input id="v-admin" type="number" min={0} max={100} step="0.1" placeholder="0" {...register('adminAdditionalPercent')} className={errorCls(Boolean(errors.adminAdditionalPercent))} />
                {errors.adminAdditionalPercent && <p className="text-xs text-destructive">{errors.adminAdditionalPercent.message}</p>}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              <Save className="size-4" />
              {pending ? 'Saving…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}