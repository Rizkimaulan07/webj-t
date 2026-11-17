import { DEMO_SHIPMENTS } from "@/mocks/shipments"
import type { Shipment } from "@/types/shipment"
import { ApiError, jedaApi } from "./client"
import { cariPesananByAwb } from "./shipments"

export async function getShipmentByAwb(awb: string): Promise<Shipment> {
  await jedaApi()
  const kode = awb.trim().toUpperCase()
  const order = cariPesananByAwb(kode)

  if (order) {
    // Hanya kirim data ringkas untuk halaman pelacakan publik.
    return {
      awb: order.awb,
      status: order.status,
      service: order.service,
      from: order.from,
      to: order.to,
      receiverMasked: order.receiverMasked,
      weightKg: order.weightKg,
      events: order.events,
    }
  }

  const demo = DEMO_SHIPMENTS.find((shipment) => shipment.awb === kode)
  if (demo) return demo

  throw new ApiError(
    "Resi tidak ditemukan. Coba periksa kembali nomor resi atau gunakan resi demo.",
    "NOT_FOUND",
  )
}
