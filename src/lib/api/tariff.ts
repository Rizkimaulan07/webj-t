import { getCityById, getZone } from "@/mocks/cities"
import { SERVICES, SERVICE_ORDER } from "@/lib/services"
import type { TariffInput, TariffOption } from "@/types/tariff"
import { ApiError, jedaApi } from "./client"

export async function getTariffs(
  input: TariffInput,
): Promise<TariffOption[]> {
  await jedaApi()

  const origin = getCityById(input.originId)
  const destination = getCityById(input.destinationId)

  if (!origin || !destination) {
    throw new ApiError("Kota asal atau tujuan tidak dikenali.", "VALIDATION")
  }
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) {
    throw new ApiError("Berat paket harus lebih dari 0 kg.", "VALIDATION")
  }

  const zone = getZone(origin, destination)
  const volumetrik = (input.lengthCm * input.widthCm * input.heightCm) / 6000
  const beratDasar = Math.max(1, Math.ceil(Math.max(input.weightKg, volumetrik)))

  const options = SERVICE_ORDER.map((serviceId) => {
    const service = SERVICES[serviceId]
    const beratTertagih = Math.max(beratDasar, service.minWeightKg)
    const shippingCost =
      beratTertagih * (service.baseRate + service.zoneRate * zone)
    const insuranceFee = input.insurance
      ? Math.round(input.goodsValue * 0.002) + 5_000
      : 0

    return {
      service: service.id,
      name: service.name,
      description: service.description,
      estimate: service.estimate,
      zone,
      chargeableWeightKg: beratTertagih,
      volumetricWeightKg: Math.round(volumetrik * 10) / 10,
      shippingCost,
      insuranceFee,
      total: shippingCost + insuranceFee,
      minWeightApplied: beratTertagih > beratDasar,
    } satisfies TariffOption
  })
    .filter((option) => {
      if (option.service === "SAME_DAY") return zone === 0
      return true
    })
    .sort((a, b) => a.total - b.total)

  return options
}
