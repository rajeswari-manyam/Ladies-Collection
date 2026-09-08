import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Eye, Globe, Mail, MapPin, MoreHorizontal, Pause, Play, Star, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useVendors, useToggleVendorStatus, useCategories } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, EmptyState } from '@/components/common/state'
import { VendorStatusBadge } from '@/components/common/status-badge'
import { BrandMark } from '@/components/common/artwork'
import { formatCurrency, formatDate, formatNumber } from '@/utils'
import type { Vendor } from '@/features/admin/types'

export function VendorsPage() {
  const navigate = useNavigate()
  const { data: vendors, isLoading, isError, refetch } = useVendors()
  const { data: categories } = useCategories()
  const toggleStatus = useToggleVendorStatus()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const categoryName = useMemo(() => {
    const map = new Map(categories?.categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [categories])

  const rows = useMemo(() => {
    let list = vendors ?? []
    if (statusFilter !== 'all') list = list.filter((v) => v.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (v) => v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.location.toLowerCase().includes(q),
      )
    }
    return list
  }, [vendors, statusFilter, search])

  const toggle = (vendor: Vendor) => {
    const action = vendor.status === 'suspended' ? 'reactivated' : 'suspended'
    toggleStatus.mutate(vendor.id, {
      onSuccess: () => toast.success(`Vendor ${action}`, { description: `${vendor.name} was updated.` }),
      onError: () => toast.error('Update failed — please retry'),
    })
  }

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
        eyebrow="Community"
        title="Vendors"
        description="Partner brands selling through the Ladies Collection marketplace."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
          <Input
            placeholder="Search vendor, brand or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">{rows.length} vendor(s)</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No vendors match" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((vendor, i) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              <Card className="relative h-full p-5">
                <div className="absolute right-4 top-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>{vendor.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/vendors/${vendor.id}`)}>
                        <Eye />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Opened vendor dashboard (demo)')}>
                        <Globe />
                        View store
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Opening payout history (demo)')}>
                        <Wallet />
                        Payout history
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggle(vendor)} variant={vendor.status === 'suspended' ? 'default' : 'destructive'}>
                        {vendor.status === 'suspended' ? <Play /> : <Pause />}
                        {vendor.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-start gap-3 pr-10">
                  <BrandMark seed={vendor.name} hue={vendor.logoHue} className="size-12 text-lg" />
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-base font-semibold leading-tight">{vendor.name}</h3>
                    <p className="text-xs text-muted-foreground">{categoryName(vendor.category)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <VendorStatusBadge status={vendor.status} />
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                        <Star className="size-3.5 fill-current" />
                        {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {vendor.location}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-3.5" />
                    {vendor.email}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-xl bg-muted/60 py-3 text-center">
                  <div>
                    <p className="text-sm font-semibold">{formatNumber(vendor.ordersCount)}</p>
                    <p className="text-[11px] text-muted-foreground">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{formatNumber(vendor.productsCount)}</p>
                    <p className="text-[11px] text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{formatCurrency(vendor.revenue, true)}</p>
                    <p className="text-[11px] text-muted-foreground">Revenue</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Commission {(vendor.commissionRate * 100).toFixed(0)}%</span>
                  <span>Joined {formatDate(vendor.joined)}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}