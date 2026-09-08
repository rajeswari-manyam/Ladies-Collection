import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Globe,
  Mail,
  MapPin,
  Pause,
  Play,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { useVendors, useProducts, useCategories, useSettlements, useToggleVendorStatus } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/common/state'
import { BrandMark } from '@/components/common/artwork'
import { VendorStatusBadge, SettlementStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate, formatNumber } from '@/utils'
import type { Vendor } from '@/features/admin/types'

export function VendorDetailsPage() {
  const { id = '' } = useParams()
  const { data: vendors, isLoading, isError, refetch } = useVendors()
  const { data: products } = useProducts()
  const { data: cats } = useCategories()
  const { data: settlements } = useSettlements()
  const toggleStatus = useToggleVendorStatus()

  const vendor = vendors?.find((v) => v.id === id)

  const categoryName = useMemo(() => {
    const map = new Map(cats?.categories.map((c) => [c.id, c.name]))
    return (catId: string) => map.get(catId) ?? '—'
  }, [cats])

  const vendorProducts = useMemo(
    () => (products ? products.filter((p) => p.vendorId === id) : []),
    [products, id],
  )

  const vendorSettlements = useMemo(
    () => (settlements ? settlements.filter((s) => s.vendorId === id) : []),
    [settlements, id],
  )

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  if (isLoading || !vendor) {
    if (!isLoading && !vendor) {
      return (
        <div className="rounded-2xl border border-border bg-card p-8">
          <EmptyState
            title="Vendor not found"
            description="This vendor may have been removed from the marketplace."
            action={
              <Button variant="outline" asChild>
                <Link to="/vendors">All vendors</Link>
              </Button>
            }
          />
        </div>
      )
    }
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-44 w-full" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72 xl:col-span-2" />
        </div>
      </div>
    )
  }

  const toggle = (v: Vendor) => {
    const action = v.status === 'suspended' ? 'reactivated' : 'suspended'
    toggleStatus.mutate(v.id, {
      onSuccess: () => toast.success(`Vendor ${action}`, { description: `${v.name} was updated.` }),
      onError: () => toast.error('Update failed — please retry'),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
          <Link to="/vendors">
            <ArrowLeft className="size-4" />
            All vendors
          </Link>
        </Button>
        <PageHeader
          eyebrow="Sellers"
          title={vendor.name}
          description={`${categoryName(vendor.category)} partner since ${formatDate(vendor.joined)}`}
          actions={
            <Button
              variant={vendor.status === 'suspended' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggle(vendor)}
            >
              {vendor.status === 'suspended' ? <Play className="size-4" /> : <Pause className="size-4" />}
              {vendor.status === 'suspended' ? 'Reactivate' : 'Suspend vendor'}
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <BrandMark seed={vendor.name} hue={vendor.logoHue} className="size-16 text-2xl" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold">{vendor.name}</h2>
                  <VendorStatusBadge status={vendor.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {vendor.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {vendor.email}
                  </span>
                  {vendor.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="size-3.5" />
                      {vendor.phone}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <Star className="size-3.5 fill-current" />
                    {vendor.rating > 0 ? `${vendor.rating.toFixed(1)} rating` : 'New vendor'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
              {[
                { label: 'Products', value: formatNumber(vendor.productsCount) },
                { label: 'Orders', value: formatNumber(vendor.ordersCount) },
                { label: 'Revenue', value: formatCurrency(vendor.revenue, true) },
                { label: 'Commission', value: `${Math.round(vendor.commissionRate * 100)}%` },
              ].map((stat) => (
                <div key={stat.label} className="bg-card px-4 py-3">
                  <p className="font-serif text-lg font-semibold">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active catalog</CardTitle>
              <CardDescription>Products listed by this vendor</CardDescription>
            </div>
            <Badge variant="outline">{vendorProducts.length} in catalog</Badge>
          </CardHeader>
          <CardContent>
            {vendorProducts.length === 0 ? (
              <EmptyState
                title="No products yet"
                description="This vendor has not published any products to the marketplace."
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/product-approval">Review approvals</Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {vendorProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{categoryName(p.categoryId)}</p>
                    </div>
                    <Badge variant={p.stock > 0 ? 'outline' : 'destructive'}>{p.stock} in stock</Badge>
                    <span className="w-20 shrink-0 text-right text-sm font-semibold">{formatCurrency(p.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Settlement history</CardTitle>
              <CardDescription>Payout cycles for this vendor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {vendorSettlements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No settlements yet for this vendor.</p>
              ) : (
                vendorSettlements.map((s) => (
                  <Link
                    key={s.id}
                    to={`/settlements/${s.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:border-blush-300"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.period}</p>
                      <p className="text-xs text-muted-foreground">{s.settlementId}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">{formatCurrency(s.netAmount)}</p>
                      <SettlementStatusBadge status={s.status} />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
              <CardDescription>Vendor documents & terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  KYC verified
                </span>
                <Badge variant="success">Verified</Badge>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="size-4 text-primary" />
                  Payout frequency
                </span>
                <span className="font-medium">Bi-weekly</span>
              </p>
              <p className="flex items-center gap-2 rounded-xl bg-blush-50 px-3 py-2 text-xs text-muted-foreground">
                Contracts and bank details are stored encrypted on the vendor file (demo).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}