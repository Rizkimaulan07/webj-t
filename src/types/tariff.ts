import type { ServiceId } from "@/types/shipment"

export type IslandId =
  | "JAWA"
  | "SUMATERA"
  | "KALIMANTAN"
  | "SULAWESI"
  | "BALI_NUSA"
  | "PAPUA_MALUKU"

export interface City {
  id: string
  name: string
  province: string
  island: IslandId
}

export interface TariffInput {
  originId: string
  destinationId: string
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  insurance: boolean
  goodsValue: number
}

export interface TariffOption {
  service: ServiceId
  name: string
  description: string
  estimate: string
  zone: number
  chargeableWeightKg: number
  volumetricWeightKg: number
  shippingCost: number
  insuranceFee: number
  total: number
  minWeightApplied: boolean
}
