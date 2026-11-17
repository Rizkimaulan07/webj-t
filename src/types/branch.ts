import type { ServiceId } from "@/types/shipment"

export interface Branch {
  id: string
  name: string
  type: "HUB" | "DROP_POINT" | "AGEN"
  city: string
  address: string
  phone: string
  hours: string
  services: ServiceId[]
}
