import { useMemo, useState } from 'react'
import { Mail, MoreHorizontal, Phone, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomers } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type AppColumnDef } from '@/components/ui/data-table'
import { CustomerStatusBadge, CustomerTierBadge } from '@/components/common/status-badge'
import { ErrorState } from '@/components/common/state'
import { avatarPalette, formatCurrency, formatDate, initials } from '@/utils'
import type { Customer } from '@/features/admin/types'

export function CustomersPage() {
  const { data: customers, isLoading, isError, refetch } = useCustomers()
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')

  const rows = useMemo(() => {
    let list = customers ?? []
    if (tierFilter !== 'all') list = list.filter((c) => c.tier === tierFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q),
      )
    }
    return list
  }, [customers, tierFilter, search])

  const columns = useMemo<AppColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className={avatarPalette(row.original.name)}>
                {initials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium">{row.original.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="size-3" />
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.city}, {row.original.country}
          </span>
        ),
      },
      {
        accessorKey: 'tier',
        header: 'Tier',
        cell: ({ row }) => <CustomerTierBadge tier={row.original.tier} />,
      },
      {
        accessorKey: 'orders',
        header: 'Orders',
        cell: ({ row }) => <span className="font-medium">{row.original.orders}</span>,
      },
      {
        accessorKey: 'totalSpent',
        header: 'Lifetime spend',
        cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.totalSpent)}</span>,
      },
      {
        accessorKey: 'lastOrder',
        header: 'Last order',
        cell: ({ row }) => (
          <div>
            <p>{formatDate(row.original.lastOrder)}</p>
            <p className="text-xs text-muted-foreground">joined {formatDate(row.original.joined)}</p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <CustomerStatusBadge status={row.original.status} />,
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
              <DropdownMenuLabel>{row.original.name}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => toast.info(`Emailing ${row.original.email}`)}>
                <Mail />
                Send email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(`Calling ${row.original.phone}`)}>
                <Phone />
                Call
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.success('Customer flagged')}>
                <ShieldCheck />
                Verify identity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
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
        eyebrow="Community"
        title="Customers"
        description="Profiles, orders and lifetime value for every shopper on the platform."
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">{customers?.length ?? 0} customers</Badge>
        <Badge variant="info">
          {(customers ?? []).filter((c) => c.tier === 'platinum').length} platinum
        </Badge>
        <Badge variant="success">
          {(customers ?? []).filter((c) => c.status === 'active').length} active
        </Badge>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyTitle="No customers found"
        pageSize={8}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl">
              <Input
                placeholder="Search name, email or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{rows.length} customer(s)</p>
          </div>
        }
      />
    </div>
  )
}