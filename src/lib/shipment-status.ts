import type { BadgeVariant } from "@/components/ui/badge-variants"
import type { ShipmentStatus } from "@/types/shipment"

export const STATUS_META: Record<
  ShipmentStatus,
  { label: string; variant: BadgeVariant }
> = {
  DIPROSES: { label: "Diproses", variant: "secondary" },
  DALAM_PERJALANAN: { label: "Dalam Perjalanan", variant: "warning" },
  DIANTAR: { label: "Diantar", variant: "info" },
  TERKIRIM: { label: "Terkirim", variant: "success" },
  BERMASALAH: { label: "Bermasalah", variant: "destructive" },
}

export const SHIPMENT_STATUSES = Object.keys(STATUS_META) as ShipmentStatus[]
