import { Badge } from "@/components/ui/badge"
import type { ShipmentStatus } from "@/types/shipment"
import { STATUS_META } from "@/lib/shipment-status"
import { cn } from "@/lib/utils"

export function StatusBadge({
  status,
  className,
}: {
  status: ShipmentStatus
  className?: string
}) {
  const meta = STATUS_META[status]
  return (
    <Badge variant={meta.variant} className={cn("px-3", className)}>
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {meta.label}
    </Badge>
  )
}
