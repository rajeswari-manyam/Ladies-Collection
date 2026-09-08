import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCategories, useAddSubcategory } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { ErrorState, EmptyState } from '@/components/common/state'
import type { Subcategory } from '@/features/admin/types'

export function SubCategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategories()
  const addSubcategory = useAddSubcategory()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [pending, setPending] = useState(false)

  const categoryName = useMemo(() => {
    const map = new Map(data?.categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [data])

  const rows = useMemo(() => {
    if (!data) return []
    if (!search.trim()) return data.subcategories
    const q = search.trim().toLowerCase()
    return data.subcategories.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q) || categoryName(s.categoryId).toLowerCase().includes(q),
    )
  }, [data, search, categoryName])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !categoryId) {
      toast.error('Missing fields', { description: 'A name and parent category are required.' })
      return
    }
    setPending(true)
    addSubcategory.mutate(
      { name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-'), categoryId, productCount: 0 },
      {
        onSuccess: () => {
          toast.success('Sub-category added', { description: `${name.trim()} was created.` })
          setOpen(false)
          setName('')
          setCategoryId('')
        },
        onError: () => toast.error('Could not add sub-category'),
        onSettled: () => setPending(false),
      },
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  const columns = useMemo<AppColumnDef<Subcategory>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Sub-category',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: 'categoryId',
        header: 'Parent category',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{categoryName(row.original.categoryId)}</Badge>
        ),
      },
      {
        id: 'productCount',
        header: 'Product count',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.productCount} items</span>,
      },
    ],
    [categoryName],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Sub-Categories"
        description="Fine-grained buckets under each category, used for navigation and filtering."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add sub-category
          </Button>
        }
      />

      {isLoading || !data ? null : (
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyTitle="No sub-categories found"
          pageSize={10}
          toolbar={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                placeholder="Search sub-categories…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="lg:max-w-xs"
              />
              <p className="text-xs text-muted-foreground">{rows.length} sub-categories</p>
            </div>
          }
        />
      )}

      {!isLoading && (!data || data.subcategories.length === 0) && (
        <EmptyState
          title="No sub-categories"
          description="Add your first sub-category to get started."
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add sub-category</DialogTitle>
            <DialogDescription>Create a new sub-category under an existing category.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subcat-name">Name</Label>
              <Input id="subcat-name" placeholder="e.g. Cocktail Dresses" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Parent category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {data?.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Adding…' : 'Add sub-category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}