import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateCategory } from '@/features/admin/hooks'
import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const ACCENT_HUES = [336, 18, 348, 270, 200, 300, 150, 220]

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onUpdated,
}: {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}) {
  const updateCategory = useUpdateCategory()

  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description)
  const [featured, setFeatured] = useState(category.featured)
  const [hue, setHue] = useState(category.hue)
  const [pending, setPending] = useState(false)

  const close = () => onOpenChange(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Missing fields', { description: 'A category name is required.' })
      return
    }
    setPending(true)
    updateCategory.mutate(
      { id: category.id, payload: { name, description, featured, hue } },
      {
        onSuccess: () => {
          toast.success('Category updated', { description: `${name.trim()} was saved.` })
          close()
          onUpdated?.()
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not update category'),
        onSettled: () => setPending(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
          <DialogDescription>Update this category for the marketplace catalog.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Accent colour</Label>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_HUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Accent ${value}`}
                  onClick={() => setHue(value)}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full transition-transform',
                    hue === value && 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background',
                  )}
                  style={{ backgroundColor: `hsl(${value} 72% 82%)` }}
                >
                  {hue === value && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <span className="text-sm">
              <span className="block font-medium">Featured category</span>
              <span className="block text-xs text-muted-foreground">Show on the storefront home page.</span>
            </span>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}