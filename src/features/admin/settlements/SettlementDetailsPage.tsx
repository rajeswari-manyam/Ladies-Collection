import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Landmark,
  ReceiptText,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettlements, useVendors, useUpdateSettlementStatus } from '@/features/admin/hooks'
import { PageHeader } from '@/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { SettlementStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDateTime, formatNumber } from '@/utils'
import type { SettlementStatus } from '@/features/admin/types'

const BANK_ACCOUNTS: Record<string, { bank: string; account: string; ifsc: string; holder: string }> = {
  'ven-rose': { bank: 'HDFC Bank', account: '•••• 7421', ifsc: 'HDFC0000004', holder: 'Rosette Atelier Pvt Ltd' },
  'ven-opal': { bank: 'Axis Bank', account: '•••• 3308', ifsc: 'UTIB0000450', holder: 'Opal & Ivory' },
  'ven-velvet': { bank: 'ICICI Bank', account: '•••• 9187', ifsc: 'ICIC0001201', holder: 'Velvet Vogue Studio' },
  'ven-mira': { bank: 'Kotak Mahindra', account: '•••• 5539', ifsc: 'KKBK0000150', holder: 'Mira & Bloom' },
  'ven-lina': { bank: 'Yes Bank', account: '•••• 6620', ifsc: 'YESB0000147', holder: 'Lina Boutique' },
  'ven-serafine': { bank: 'HDFC Bank', account: '•••• 2844', ifsc: 'HDFC0000186', holder: 'Serafine Studio' },
  'ven-noir': { bank: 'SBI', account: '•••• 8710', ifsc: 'SBIN0000382', holder: 'Noir Floral' },
  'ven-ember': { bank: 'ICICI Bank', account: '•••• 0057', ifsc: 'ICIC0000932', holder: 'Ember & Lace' },
}

export function SettlementDetailsPage() {
  const { id = '' } = useParams()
  const { data: settlements, isLoading } = useSettlements()
  const { data: vendors } = useVendors()
  const updateStatus = useUpdateSettlementStatus()

  const settlement = settlements?.find((s) => s.id === id)
  const vendor = useMemo(() => vendors?.find((v) => v.id === settlement?.vendorId), [vendors, settlement])
  const bank = settlement ? BANK_ACCOUNTS[settlement.vendorId] : undefined

  const advance = (to: SettlementStatus, verb: string) => {
    if (!settlement) return
    updateStatus.mutate(
      { id: settlement.id, status: to },
      {
        onSuccess: () => toast.success(`Settlement ${verb}`, { description: `${settlement.settlementId} was updated.` }),
        onError: () => toast.error('Update failed — please retry'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-56 w-full" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Skeleton className="h-72 xl:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  if (!settlement) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <EmptyState
          title="Settlement not found"
          description="This payout cycle could not be located."
          action={
            <Button variant="outline" asChild>
              <Link to="/settlements">All settlements</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const canProcess = settlement.status === 'pending'
  const canPay = settlement.status === 'processed'

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
          <Link to="/settlements">
            <ArrowLeft className="size-4" />
            All settlements
          </Link>
        </Button>
        <PageHeader
          eyebrow="Payouts"
          title={settlement.settlementId}
          description={`${settlement.vendor} · ${settlement.period}`}
          actions={
            <div className="flex items-center gap-2">
              {canProcess && (
                <Button size="sm" onClick={() => advance('processed', 'processed')}>
                  <CheckCircle2 className="size-4" />
                  Process payout
                </Button>
              )}
              {canPay && (
                <Button size="sm" variant="soft" onClick={() => advance('paid', 'paid')}>
                  <Banknote className="size-4" />
                  Mark as paid
                </Button>
              )}
            </div>
          }
        />
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Net payout</p>
            <p className="mt-1 font-serif text-3xl font-semibold tracking-tight text-primary">
              {formatCurrency(settlement.netAmount)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SettlementStatusBadge status={settlement.status} />
              <Badge variant="outline">{settlement.payoutMethod}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:col-span-2">
            {[
              { label: 'Gross sales', value: formatCurrency(settlement.grossSales) },
              { label: 'Orders', value: formatNumber(settlement.orders) },
              { label: 'Commission', value: `${Math.round(settlement.commissionRate * 100)}% · ${formatCurrency(settlement.commission)}` },
              { label: 'Refunds', value: formatCurrency(settlement.refunds) },
            ].map((stat) => (
              <div key={stat.label} className="bg-card px-4 py-3">
                <p className="font-serif text-lg font-semibold">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
            <CardDescription>How the net payout was calculated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Gross sales ({formatNumber(settlement.orders)} orders)</span>
              <span className="font-medium text-foreground">{formatCurrency(settlement.grossSales)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Marketplace commission ({Math.round(settlement.commissionRate * 100)}%)</span>
              <span>−{formatCurrency(settlement.commission)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Refunds</span>
              <span>−{formatCurrency(settlement.refunds)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Gateway & platform fees</span>
              <span>−{formatCurrency(settlement.fees)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Vendor payout</span>
              <span>{formatCurrency(settlement.netAmount)}</span>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              Settlement computed from the Aug 16 – 31, 2026 cycle ledger. GST invoices are attached to this cycle.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout details</CardTitle>
              <CardDescription>Where funds are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Landmark className="size-4 text-primary" />
                  Bank
                </span>
                <span className="font-medium">{bank?.bank ?? '—'}</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ReceiptText className="size-4 text-primary" />
                  Account
                </span>
                <span className="font-mono font-medium">{bank?.account ?? '—'}</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="size-4 text-primary" />
                  Payee
                </span>
                <span className="font-medium">{bank?.holder ?? settlement.vendor}</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="size-4 text-primary" />
                  Processed
                </span>
                <span className="font-medium">
                  {settlement.processedAt ? formatDateTime(settlement.processedAt) : 'Not yet'}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor</CardTitle>
              <CardDescription>This payout belongs to</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{vendor?.name ?? settlement.vendor}</p>
              <p className="text-xs text-muted-foreground">{vendor?.location}</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to={`/vendors/${settlement.vendorId}`}>
                  Open vendor profile
                  <ArrowLeft className="size-3.5 rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}