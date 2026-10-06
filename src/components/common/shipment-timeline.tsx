import { StatusTimeline } from '@/components/common/status-timeline'
import { shipmentStepTimestamps } from '@/components/common/shipment-timeline-meta'
import {
  SHIPMENT_STEPS,
  shipmentStepIndex,
  shipmentTerminalState,
  type StatusStep,
} from '@/components/common/workflow-status'
import { shipmentMilestone, type Shipment } from '@/services/shipment.service'

/**
 * Courier handover for one parcel, driven entirely by the status the shipment
 * API returned. Each vendor's parcel in a multi-vendor order gets its own
 * timeline, because they are not guaranteed to move together.
 */
export function ShipmentTimeline({
  shipment,
  steps = SHIPMENT_STEPS,
  className,
}: {
  shipment: Shipment
  steps?: StatusStep[]
  className?: string
}) {
  const milestone = shipmentMilestone(shipment)

  return (
    <StatusTimeline
      className={className}
      steps={steps}
      currentIndex={shipmentStepIndex(milestone)}
      terminal={shipmentTerminalState(milestone)}
      stepMeta={shipmentStepTimestamps(shipment)}
    />
  )
}
