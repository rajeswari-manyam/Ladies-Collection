import { Package, Store, Truck } from 'lucide-react'
import type { Order } from '@/services/order.service'
import type { Shipment } from '@/services/shipment.service'
import { orderStatusText } from '@/components/common/workflow-status'
import { ShipmentStatusChip } from '@/components/common/status-chips'
import { ShipmentTimeline } from '@/components/common/shipment-timeline'
import { OrderItemDiscount } from '@/features/customer/orders/components/order-item-discount'
import { cn, formatINR } from '@/utils'
import { groupOrderByVendor } from '@/features/customer/orders/components/group-order-by-vendor'

/**
 * Order contents split by vendor, each with its own shipment progress. Used on
 * the order details and tracking screens so a multi-vendor order reads as
 * several parcels rather than one ambiguous status.
 */
export function VendorOrderGroups({
  order,
  shipments,
  showTimeline = true,
  className,
}: {
  order: Order
  shipments?: Shipment[]
  showTimeline?: boolean
  className?: string
}) {
  const groups = groupOrderByVendor(order, shipments ?? [])

  return (
    <div className={cn('space-y-4', className)}>
      {groups.map((group) => (
        <section key={group.vendorId || 'unknown'} className="rounded-3xl border border-border bg-card p-5">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Store className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-serif text-sm font-bold text-foreground">{group.vendorName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {group.items.length} item(s) · {group.items.reduce((n, i) => n + (i.quantity ?? 0), 0)} pc(s)
                </p>
              </div>
            </div>
            {group.mappingStatus && (
              <span className="text-[11px] font-semibold text-muted-foreground">
                {orderStatusText(group.mappingStatus)}
              </span>
            )}
          </header>

          <ul className="divide-y divide-border">
            {group.items.map((item) => (
              <li key={item._id} className="flex items-start gap-3 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Package className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU {item.sku} · Qty {item.quantity}
                  </p>
                  <OrderItemDiscount item={item} className="mt-0.5 text-xs" />
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {formatINR(item.itemTotal ?? 0)}
                </span>
              </li>
            ))}
          </ul>

          {group.shipments.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              No shipment created for this vendor yet. You will see tracking here once the parcel is booked.
            </p>
          ) : (
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              {group.shipments.map((shipment) => (
                <div key={shipment._id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Truck className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">
                      {shipment.courier || 'Courier'}
                      {shipment.awbNumber ? ` · ${shipment.awbNumber}` : ''}
                    </span>
                    <ShipmentStatusChip status={shipment.shipmentStatus} />
                  </div>
                  {shipment.trackingNumber && (
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      Tracking {shipment.trackingNumber}
                    </p>
                  )}
                  {showTimeline && <ShipmentTimeline shipment={shipment} className="mt-3 sm:pl-1" />}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
