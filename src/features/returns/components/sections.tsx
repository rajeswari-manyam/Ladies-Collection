import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Store } from 'lucide-react'
import type { Party, RefundRecord, ReturnRecord, VendorParty } from '@/features/returns/types'
import { Amount, DateField, DetailGrid, MonoField, TextField } from '@/components/common/finance-fields'
import { ProductThumb } from '@/components/common/artwork'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReturnReasonBadge, ReturnStageBadge, RefundStageBadge } from '@/features/returns/components/badges'
import { returnReasonLabel } from '@/features/returns/workflow'

/**
 * Read-only sections shared by the vendor and admin detail screens.
 *
 * Every figure and date is the stored one, presented through the same field
 * primitives the payment and settlement screens use.
 */

export function ReturnInfoCard({ record }: { record: ReturnRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Return information</CardTitle>
        <CardDescription>What the customer asked for and where the request sits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailGrid
          items={[
            { label: 'Return ID', value: <MonoField value={record.returnId} /> },
            {
              label: 'Order ID',
              value: (
                <span className="font-mono text-xs font-medium text-foreground">{record.orderNumber}</span>
              ),
            },
            { label: 'Return requested', value: <DateField value={record.requestedAt} withTime /> },
            { label: 'Return status', value: <ReturnStageBadge stage={record.stage} /> },
            { label: 'Return reason', value: <ReturnReasonBadge reason={record.reason} /> },
            { label: 'Return eligible until', value: <DateField value={record.eligibleUntil} /> },
            { label: 'Refund amount', value: <Amount value={record.refundAmount} /> },
          ]}
        />

        <div className="rounded-2xl bg-muted/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer comments</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{record.comments}</p>
        </div>

        {record.decision && (
          <div
            className={
              record.decision.outcome === 'approved'
                ? 'rounded-2xl bg-emerald-500/10 px-4 py-3'
                : 'rounded-2xl bg-destructive/10 px-4 py-3'
            }
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vendor decision · {record.decision.outcome === 'approved' ? 'Approved' : 'Rejected'}
            </p>
            <p className="mt-1 text-sm text-foreground">{record.decision.reason}</p>
            {record.decision.notes && (
              <p className="mt-1 text-xs text-muted-foreground">{record.decision.notes}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {record.decision.decidedBy} · <DateField value={record.decision.decidedAt} withTime />
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CustomerInfoCard({ customer }: { customer: Party }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer information</CardTitle>
        <CardDescription>Who raised the request and where the product was collected from.</CardDescription>
      </CardHeader>
      <CardContent>
        <DetailGrid
          items={[
            { label: 'Name', value: <TextField value={customer.name} /> },
            {
              label: 'Phone',
              value: (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <TextField value={customer.phone} />
                </span>
              ),
            },
            {
              label: 'Email',
              value: (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="break-all text-sm font-medium">{customer.email}</span>
                </span>
              ),
            },
          ]}
        />
        <div className="mt-4 rounded-2xl bg-muted/60 px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <MapPin className="size-3.5" />
            Delivery address
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{customer.address}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function VendorInfoCard({ vendor }: { vendor: VendorParty }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Store className="size-4 text-muted-foreground" />
          Vendor information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DetailGrid
          columns={1}
          items={[
            { label: 'Vendor name', value: <TextField value={vendor.name} /> },
            { label: 'Vendor ID', value: <MonoField value={vendor.id} /> },
            { label: 'Vendor contact', value: <TextField value={vendor.contact} /> },
            { label: 'Approval status', value: <Badge variant="success">{vendor.approvalStatus}</Badge> },
          ]}
        />
      </CardContent>
    </Card>
  )
}

export function ProductInfoCard({ record }: { record: ReturnRecord }) {
  const { product } = record

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product information</CardTitle>
        <CardDescription>The line being sent back.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <ProductThumb seed={product.name} color={`hsl(${product.hue} 60% 55%)`} className="size-16 rounded-xl" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{product.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.variant} · {product.size} · {product.color}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{product.sku}</p>
          </div>
        </div>

        <DetailGrid
          items={[
            { label: 'SKU', value: <MonoField value={product.sku} /> },
            { label: 'Variant', value: <TextField value={product.variant} /> },
            { label: 'Size', value: <TextField value={product.size} /> },
            { label: 'Color', value: <TextField value={product.color} /> },
            { label: 'Quantity', value: <span>{record.quantity}</span> },
            { label: 'Product price', value: <Amount value={product.price} /> },
            { label: 'Discount', value: <Amount value={-product.discount} /> },
            { label: 'Tax', value: <Amount value={product.tax} /> },
          ]}
        />

        <div className="flex items-center justify-between rounded-2xl bg-blush-100/60 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Final amount</span>
          <span className="font-serif text-xl font-bold text-primary">
            <Amount value={product.finalAmount} />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function OrderSummaryCard({ record, orderBasePath }: { record: ReturnRecord; orderBasePath: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
        <CardDescription>The order this return belongs to.</CardDescription>
      </CardHeader>
      <CardContent>
        <DetailGrid
          items={[
            {
              label: 'Order ID',
              value: (
                <Link to={`${orderBasePath}/${record.orderId}`} className="font-mono text-xs font-medium text-primary hover:underline">
                  {record.orderNumber}
                </Link>
              ),
            },
            { label: 'Order date', value: <DateField value={record.orderDate} /> },
            { label: 'Customer', value: <TextField value={record.customer.name} /> },
            { label: 'Vendor', value: <TextField value={record.vendor.name} /> },
            { label: 'Order amount', value: <Amount value={record.orderAmount} /> },
            { label: 'Delivery status', value: <Badge variant="success">{record.deliveryStatus}</Badge> },
          ]}
        />
      </CardContent>
    </Card>
  )
}

export function PaymentInfoCard({ refund }: { refund: RefundRecord }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Original payment</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailGrid
          columns={1}
          items={[
            { label: 'Order amount', value: <Amount value={refund.originalOrderAmount} /> },
            { label: 'Payment method', value: <TextField value={refund.method} /> },
            {
              label: 'Payment status',
              value: <Badge variant="success">Paid</Badge>,
            },
            {
              label: 'Transaction reference',
              value: <MonoField value={refund.transactionReference ?? `TXN${refund.orderNumber.slice(-8)}`} />,
            },
          ]}
        />
      </CardContent>
    </Card>
  )
}

export function RefundInfoCard({ refund }: { refund: RefundRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Refund information</CardTitle>
        <CardDescription>Identifiers, reason and where the refund sits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailGrid
          items={[
            { label: 'Refund ID', value: <MonoField value={refund.refundId} /> },
            {
              label: 'Return ID',
              value: (
                <span className="font-mono text-xs font-medium text-foreground">{refund.returnId}</span>
              ),
            },
            { label: 'Order ID', value: <span className="font-mono text-xs font-medium">{refund.orderNumber}</span> },
            { label: 'Refund reason', value: <ReturnReasonBadge reason={refund.reason} /> },
            { label: 'Refund status', value: <RefundStageBadge stage={refund.stage} /> },
            { label: 'Refund method', value: <TextField value={refund.method} /> },
            { label: 'Requested', value: <DateField value={refund.requestedAt} withTime /> },
            { label: 'Approved', value: <DateField value={refund.approvedAt} withTime /> },
            { label: 'Processed', value: <DateField value={refund.processedAt} withTime /> },
          ]}
        />

        {refund.failureReason && (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{refund.failureReason}</p>
        )}

        {refund.adminNotes && (
          <div className="rounded-2xl bg-muted/60 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin notes</p>
            <p className="mt-1 text-sm text-foreground">{refund.adminNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BreakdownRow({
  label,
  value,
  emphasis = false,
  negative = false,
}: {
  label: string
  value: string
  emphasis?: boolean
  negative?: boolean
}) {
  return (
    <div
      className={
        emphasis
          ? 'flex items-center justify-between gap-4 border-t-2 border-dashed border-border pt-3'
          : 'flex items-center justify-between gap-4'
      }
    >
      <span className={emphasis ? 'text-sm font-semibold text-foreground' : 'text-sm text-muted-foreground'}>
        {label}
      </span>
      <span
        className={
          emphasis
            ? 'font-serif text-xl font-bold text-primary tabular-nums'
            : negative
              ? 'text-sm font-medium text-rose-600 tabular-nums'
              : 'text-sm font-medium text-foreground tabular-nums'
        }
      >
        {value}
      </span>
    </div>
  )
}

/** Line-by-line refund maths, ending on the amount actually credited. */
export function RefundBreakdownCard({ refund }: { refund: RefundRecord }) {
  const currency = (value: number) => `${value < 0 ? '-' : ''}₹${Math.abs(Math.round(value)).toLocaleString('en-IN')}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refund calculation</CardTitle>
        <CardDescription>How the credited amount is made up.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <BreakdownRow label="Product amount" value={currency(refund.productAmount)} />
        <BreakdownRow label="Discount" value={currency(-refund.discount)} negative={refund.discount > 0} />
        <BreakdownRow label="Tax" value={currency(refund.tax)} />
        <BreakdownRow label="Shipping" value={currency(refund.shipping)} />
        <BreakdownRow label="Return charges" value={currency(-refund.returnCharges)} negative={refund.returnCharges > 0} />
        <BreakdownRow label="Refund deduction" value={currency(-refund.deduction)} negative={refund.deduction > 0} />
        <BreakdownRow label="Refund amount" value={currency(refund.refundAmount)} emphasis />
        <p className="pt-1 text-xs text-muted-foreground">
          Credited back to the original payment method · {returnReasonLabel(refund.reason)}
        </p>
      </CardContent>
    </Card>
  )
}
