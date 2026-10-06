import { useNavigate } from 'react-router-dom'
import { Banknote, CheckCircle2, MoreHorizontal, ShoppingBag, Undo2, XCircle } from 'lucide-react'
import type { RefundRecord } from '@/features/returns/types'
import { canCompleteRefund, canProcessRefund, canRejectRefund } from '@/features/returns/workflow'
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
 * Row actions for a refund.
 *
 * A vendor only gets navigation. Admin also gets the payout controls, each one
 * disabled until the refund actually reaches that step — so the menu doubles as a
 * readout of where the refund sits.
 */

export type RefundListAction =
  | 'view_refund'
  | 'view_order'
  | 'view_return'
  | 'process_refund'
  | 'complete_refund'
  | 'reject_refund'

export function RefundActionMenu({
  record,
  scope = 'vendor',
  onAction,
  returnBasePath,
}: {
  record: RefundRecord
  /** Admin adds the process / complete / reject controls. */
  scope?: 'vendor' | 'admin'
  onAction: (action: RefundListAction, record: RefundRecord) => void
  returnBasePath: string
}) {
  const navigate = useNavigate()
  const isAdmin = scope === 'admin'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${record.refundId}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction('view_refund', record)}>
          <Banknote />
          View refund
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`${returnBasePath}/${record.returnHandle}`)}>
          <Undo2 />
          View return
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!canProcessRefund(record.stage)}
              title={canProcessRefund(record.stage) ? undefined : 'Available once the refund is approved'}
              onClick={() => onAction('process_refund', record)}
            >
              <Banknote />
              Process refund
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!canCompleteRefund(record.stage)}
              title={canCompleteRefund(record.stage) ? undefined : 'Available once the refund is processing'}
              onClick={() => onAction('complete_refund', record)}
            >
              <CheckCircle2 />
              Mark refund completed
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!canRejectRefund(record.stage)}
              title={canRejectRefund(record.stage) ? undefined : 'Available while the refund is open'}
              onClick={() => onAction('reject_refund', record)}
            >
              <XCircle />
              Reject refund
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction('view_order', record)}>
          <ShoppingBag />
          View order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}