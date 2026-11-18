import { DEMO_SHIPMENTS } from "@/mocks/shipments"
import type { Shipment } from "@/types/shipment"
import { apiRequest, ApiError } from "./client"

const FALLBACK_CODES: ApiError["code"][] = [
  "NOT_FOUND",
  "UNAVAILABLE",
  "SERVER_ERROR",
]

export async function getShipmentByAwb(awb: string): Promise<Shipment> {
  const kode = awb.trim().toUpperCase()
  try {
    return await apiRequest<Shipment>(
      `/api/tracking/${encodeURIComponent(kode)}`,
    )
  } catch (error) {
    if (!(error instanceof ApiError) || !FALLBACK_CODES.includes(error.code)) {
      throw error
    }

    const demo = DEMO_SHIPMENTS.find((shipment) => shipment.awb === kode)
    if (demo) return demo
    if (error.code !== "NOT_FOUND") throw error
    throw new ApiError(
      "Resi tidak ditemukan. Coba periksa kembali nomor resi atau gunakan resi demo.",
      "NOT_FOUND",
    )
  }
}
