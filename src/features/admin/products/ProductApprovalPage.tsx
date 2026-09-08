import { useMemo, useState } from 'react'
import { Ban, BadgeCheck, Clock3 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useProductApprovals,
  useApproveProduct,
  useRejectProduct,
  useCategories,
  useVendors,
} from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/common/state'
import { formatCurrency, formatDate, formatNumber } from '@/utils'
import type { ApprovalItem } from '@/features/admin/products/data/product-approvals'

const statusTabs = [
  { value: 'all', label: 'All', icon: null },
  { value: 'pending', label: 'Pending', icon: Clock3 },
  { value: 'approved', label: 'Approved', icon: BadgeCheck },
  { value: 'rejected', label: 'Rejected', icon: Ban },
] as const

export function ProductApprovalPage() {
  const { data: approvals, isLoading, isError, refetch } = useProductApprovals()
  const { data: cats } = useCategories()
  const { data: vendors } = useVendors()
  const approve = useApproveProduct()
  const reject = useRejectProduct()

  const [tab, setTab] = useState('all')
  const [rejecting, setRejecting] = useState<ApprovalItem | null>(null)
  const [reason, setReason] = useState('')
  const [pendingAction, setPendingAction] = useState(false)

  const categoryName = useMemo(() => {
    const map = new Map(cats?.categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [cats])

  const vendorName = useMemo(() => {
    const map = new Map(vendors?.map((v) => [v.id, v.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [vendors])

  const rows = useMemo(() => {
    if (!approvals) return []
    if (tab === 'all') return approvals
    return approvals.filter((a) => a.status === tab)
  }, [approvals, tab])

  const onApprove = (item: ApprovalItem) => {
    setPendingAction(true)
    approve.mutate(item.id, {
      onSuccess: () => toast.success('Product approved', { description: `${item.name} is now live in the catalog.` }),
      onError: () => toast.error('Action failed — please retry'),
      onSettled: () => setPendingAction(false),
    })
  }

  const onReject = () => {
    if (!rejecting) return
    setPendingAction(true)
    reject.mutate(
      { id: rejecting.id, reason: reason.trim() || 'Brand guidelines not met.' },
      {
        onSuccess: () => {
          toast.success('Product rejected', { description: `${rejecting.name} was sent back to the vendor.` })
          setRejecting(null)
          setReason('')
        },
        onError: () => toast.error('Action failed — please retry'),
        onSettled: () => setPendingAction(false),
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

  const columns = useMemo<AppColumnDef<ApprovalItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.brand} · {formatNumber(row.original.variantCount)} variants
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'categoryId',
        header: 'Category',
        cell: ({ row }) => <Badge variant="outline">{categoryName(row.original.categoryId)}</Badge>,
      },
      {
        accessorKey: 'vendorId',
        header: 'Vendor',
        cell: ({ row }) => <span className="text-muted-foreground">{vendorName(row.original.vendorId)}</span>,
      },
      {
        accessorKey: 'price',
        header: 'Listed price',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{formatCurrency(row.original.price)}</p>
            {row.original.compareAtPrice != null && (
              <p className="text-xs text-muted-foreground line-through">
                {formatCurrency(row.original.compareAtPrice)}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted',
        cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.submittedAt)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === 'pending' ? 'outline' : row.original.status === 'approved' ? 'success' : 'destructive'}
          >
            {row.original.status[0].toUpperCase() + row.original.status.slice(1)}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const item = row.original
          if (item.status === 'approved') {
            return <Badge variant="outline">Live in catalog</Badge>
          }
          if (item.status === 'rejected') {
            return (
              <span className="text-xs italic text-muted-foreground" title={item.reason ?? undefined}>
                View rejection
              </span>
            )
          }
          return (
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="soft" onClick={() => onApprove(item)} disabled={pendingAction}>
                <BadgeCheck className="size-3.5" />
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRejecting(item)} disabled={pendingAction}>
                <Ban className="size-3.5" />
                Reject
              </Button>
            </div>
          )
        },
      },
    ],
    [categoryName, vendorName, pendingAction],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Product Approval"
        description="Review listings submitted by vendors before they go live on the storefront."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {statusTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              {t.icon && <t.icon className="size-3.5" />}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="Nothing to review"
        pageSize={8}
        toolbar={
          <p className="text-xs text-muted-foreground">
            {approvals?.filter((a) => a.status === 'pending').length ?? 0} listing(s) awaiting review
          </p>
        }
      />

      <Dialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejecting?.name ?? 'product'}</DialogTitle>
            <DialogDescription>Add a short reason so the vendor knows what to fix.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              rows={4}
              placeholder="e.g. Primary image below 1200px, missing fabric composition."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)} disabled={pendingAction}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onReject} disabled={pendingAction}>
              Reject listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}