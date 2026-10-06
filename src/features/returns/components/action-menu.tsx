import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  ShoppingBag,
  Truck,
  Undo2,
  XCircle,
} from 'lucide-react'
import type { RefundStage, ReturnRecord } from '@/features/returns/types'
import {
  canApproveRefund,
  canDecideReturn,
  canMarkPickedUp,
  canMarkReceived,
  canRunQualityCheck,
  canSchedulePickup,
  isRefundOpen,
} from '@/features/returns/workflow'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Row actions for a return row.
 *
 * Every action the workspace offers is listed, and each one is disabled until the
 * return actually reaches that point in the flow — so the menu doubles as a
 * readout of where the request sits.
 */

export type ReturnAction =
  | 'view'
  | 'approve'
  | 'reject'
  | 'schedule_pickup'
  | 'mark_picked_up'
  | 'mark_received'
  | 'quality_check'
  | 'approve_refund'
  | 'process_refund'
  | 'view_refund'
  | 'view_order'

export function ReturnActionMenu({
  record,
  scope,
  refundStage,
  onAction,
  refundBasePath,
}: {
  record: ReturnRecord
  /** Vendor sees its own returns; admin also gets the refund hand-off. */
  scope: 'vendor' | 'admin'
  refundStage?: RefundStage | null
  onAction: (action: ReturnAction, record: ReturnRecord) => void
  /** `/vendor/refunds` or `/refunds`. */
  refundBasePath: string
}) {
  const navigate = useNavigate()

  const canAdvanceRefund = Boolean(record.refundId) && (refundStage ? isRefundOpen(refundStage) : false)

  const items: { action: ReturnAction; label: string; icon: typeof Eye; enabled: boolean; hint?: string }[] = [
    {
      action: 'view',
      label: 'View details',
      icon: Eye,
      enabled: true,
    },
    {
      action: 'approve',
      label: 'Approve return',
      icon: CheckCircle2,
      enabled: canDecideReturn(record.stage),
      hint: 'Available while the request is awaiting review',
    },
    {
      action: 'reject',
      label: 'Reject return',
      icon: XCircle,
      enabled: canDecideReturn(record.stage),
      hint: 'Available while the request is awaiting review',
    },
    {
      action: 'schedule_pickup',
      label: 'Schedule pickup',
      icon: Truck,
      enabled: canSchedulePickup(record.stage),
      hint: 'Available once the return is approved',
    },
    {
      action: 'mark_picked_up',
      label: 'Mark product picked up',
      icon: PackageOpen,
      enabled: canMarkPickedUp(record.stage),
      hint: 'Available once a pickup is booked',
    },
    {
      action: 'mark_received',
      label: 'Mark product received',
      icon: PackageCheck,
      enabled: canMarkReceived(record.stage),
      hint: 'Available once the courier has collected it',
    },
    {
      action: 'quality_check',
      label: 'Start quality check',
      icon: ClipboardCheck,
      enabled: canRunQualityCheck(record.stage),
      hint: 'Available once the product is received',
    },
    {
      action: 'approve_refund',
      label: 'Approve refund',
      icon: Banknote,
      enabled: canApproveRefund(record.stage),
      hint: 'Available once the quality check passes',
    },
    {
      action: 'process_refund',
      label: 'Process refund',
      icon: Banknote,
      enabled: scope === 'admin' && (canApproveRefund(record.stage) || canAdvanceRefund),
      hint: 'Available once the refund is approved',
    },
    {
      action: 'view_refund',
      label: 'View refund',
      icon: Banknote,
      enabled: canAdvanceRefund,
      hint: 'Available once a refund has been raised',
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${record.returnId}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.action}
            disabled={!item.enabled}
            title={item.enabled ? undefined : item.hint}
            onClick={() => onAction(item.action, record)}
          >
            <item.icon />
            {item.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction('view_order', record)}>
          <ShoppingBag />
          View order
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canAdvanceRefund}
          title={canAdvanceRefund ? undefined : 'Available once a refund has been raised'}
          onClick={() => navigate(refundBasePath)}
        >
          <Undo2 />
          All refunds
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
