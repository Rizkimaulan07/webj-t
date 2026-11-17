import { getCityName } from "@/mocks/cities"
import { DEMO_ORDERS } from "@/mocks/shipments"
import { samarkanNama } from "@/lib/format"
import { SERVICES } from "@/lib/services"
import type {
  CreateShipmentInput,
  ShipmentOrder,
  TrackingEvent,
} from "@/types/shipment"
import { ApiError, bacaLokal, jedaApi, tulisLokal } from "./client"

const ORDERS_KEY = "orders"

function bacaPesananTersimpan(): ShipmentOrder[] {
  return bacaLokal<ShipmentOrder[]>(ORDERS_KEY, [])
}

export function cariPesananByAwb(awb: string): ShipmentOrder | undefined {
  const kode = awb.trim().toUpperCase()
  const tersimpan = bacaPesananTersimpan()
  return (
    tersimpan.find((order) => order.awb === kode) ??
    DEMO_ORDERS.find((order) => order.awb === kode)
  )
}

export async function getOrders(ownerId: string): Promise<ShipmentOrder[]> {
  await jedaApi()
  const semua = [...bacaPesananTersimpan(), ...DEMO_ORDERS]
  const unik = new Map(semua.map((order) => [order.awb, order]))
  return [...unik.values()]
    .filter((order) => order.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getOrderByAwb(awb: string): Promise<ShipmentOrder> {
  await jedaApi()
  const order = cariPesananByAwb(awb)
  if (!order) {
    throw new ApiError(
      "Pesanan tidak ditemukan. Periksa kembali nomor resi kamu.",
      "NOT_FOUND",
    )
  }
  return order
}

function buatNomorResi(existing: Set<string>): string {
  let candidate = ""
  do {
    const stamp = `${Date.now()}${Math.floor(Math.random() * 10_000)}`
    candidate = `LJX${stamp.slice(-10)}`
  } while (existing.has(candidate))
  return candidate
}

function buatEvents(
  input: CreateShipmentInput,
  now: Date,
  originName: string,
  destinationName: string,
): TrackingEvent[] {
  const doneAt = now.toISOString()
  const jam = 60 * 60 * 1000
  const berikutnya = (offset: number) =>
    new Date(now.getTime() + offset * jam).toISOString()

  const events: TrackingEvent[] = [
    {
      time: doneAt,
      title:
        input.paymentMethod === "COD"
          ? "Pesanan dibuat. Pembayaran dilakukan saat paket diterima (COD)"
          : "Pesanan dibuat dan pembayaran diterima",
      location: originName,
      done: true,
    },
  ]

  if (input.deliveryMethod === "PICKUP") {
    events.push({
      time: berikutnya(2),
      title: "Paket dijemput oleh kurir",
      location: originName,
      done: false,
    })
  } else {
    events.push({
      time: berikutnya(2),
      title: input.dropBranchName
        ? `Paket diantar ke ${input.dropBranchName}`
        : "Paket diantar ke drop point",
      location: originName,
      done: false,
    })
  }

  events.push(
    {
      time: berikutnya(8),
      title: `Paket dalam perjalanan ke ${destinationName}`,
      location: originName,
      done: false,
    },
    {
      time: berikutnya(30),
      title: "Paket diantar ke alamat penerima",
      location: destinationName,
      done: false,
    },
  )

  return events
}

export async function createShipment(
  input: CreateShipmentInput,
): Promise<ShipmentOrder> {
  await jedaApi(500, 900)

  const stored = bacaPesananTersimpan()
  const existing = new Set([
    ...stored.map((order) => order.awb),
    ...DEMO_ORDERS.map((order) => order.awb),
  ])
  const awb = buatNomorResi(existing)
  const now = new Date()
  const originName = getCityName(input.sender.cityId)
  const destinationName = getCityName(input.receiver.cityId)
  const service = SERVICES[input.service]

  const order: ShipmentOrder = {
    awb,
    status: "DIPROSES",
    service: input.service,
    from: originName,
    to: destinationName,
    receiverMasked: samarkanNama(input.receiver.name),
    weightKg: input.chargeableWeightKg,
    events: buatEvents(input, now, originName, destinationName),
    createdAt: now.toISOString(),
    total: input.total,
    estimated: input.estimated || service.estimate,
    paymentMethod: input.paymentMethod,
    deliveryMethod: input.deliveryMethod,
    sender: input.sender,
    receiver: input.receiver,
    goods: input.goods,
    ownerId: input.ownerId,
    zone: input.zone,
    dropBranchName: input.dropBranchName,
  }

  tulisLokal(ORDERS_KEY, [order, ...stored])
  return order
}
