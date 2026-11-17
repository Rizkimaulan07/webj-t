export type ServiceId = "REGULER" | "EXPRESS" | "SAME_DAY" | "KARGO"

export type ShipmentStatus =
  | "DIPROSES"
  | "DALAM_PERJALANAN"
  | "DIANTAR"
  | "TERKIRIM"
  | "BERMASALAH"

export type PaymentMethod = "VA" | "EWALLET" | "QRIS" | "COD"

export type DeliveryMethod = "PICKUP" | "DROP_OFF"

export interface TrackingEvent {
  time: string
  title: string
  location: string
  done: boolean
}

export interface Shipment {
  awb: string
  status: ShipmentStatus
  service: ServiceId
  from: string
  to: string
  receiverMasked: string
  weightKg: number
  events: TrackingEvent[]
}

export interface ShipmentParty {
  name: string
  phone: string
  address: string
  cityId: string
  postalCode: string
}

export interface ShipmentGoods {
  description: string
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  value: number
  insurance: boolean
}

export interface ShipmentOrder extends Shipment {
  createdAt: string
  total: number
  estimated: string
  paymentMethod: PaymentMethod
  deliveryMethod: DeliveryMethod
  sender: ShipmentParty
  receiver: ShipmentParty
  goods: ShipmentGoods
  ownerId: string
  zone: number
  dropBranchName?: string
}

export interface CreateShipmentInput {
  ownerId: string
  sender: ShipmentParty
  receiver: ShipmentParty
  goods: ShipmentGoods
  service: ServiceId
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  total: number
  estimated: string
  zone: number
  chargeableWeightKg: number
  dropBranchName?: string
}
