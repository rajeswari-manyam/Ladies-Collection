import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { useUpdateSubcategory } from '@/features/admin/hooks'
import type { Category, Subcategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function EditSubcategoryDialog({
  subcategory,
  categories,
  open,
  onOpenChange,
  onUpdated,
}: {
  subcategory: Subcategory
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}) {
  const updateSubcategory = useUpdateSubcategory()

  const [name, setName] = useState(subcategory.name)
  const [categoryId, setCategoryId] = useState(subcategory.categoryId)
  const [pending, setPending] = useState(false)

  const close = () => onOpenChange(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !categoryId) {
      toast.error('Missing fields', { description: 'A name and parent category are required.' })
      return
    }
    setPending(true)
    updateSubcategory.mutate(
      { id: subcategory.id, payload: { name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-'), categoryId } },
      {
        onSuccess: () => {
          toast.success('Sub-category updated', { description: `${name.trim()} was saved.` })
          close()
          onUpdated?.()
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not update sub-category'),
        onSettled: () => setPending(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit sub-category</DialogTitle>
          <DialogDescription>Update this sub-category.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subcat-edit-name">Name</Label>
            <Input id="subcat-edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Parent category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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