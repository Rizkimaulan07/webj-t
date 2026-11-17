import type { ServiceId } from "@/types/shipment"

export interface ServiceConfig {
  id: ServiceId
  name: string
  tagline: string
  description: string
  estimate: string
  baseRate: number
  zoneRate: number
  minWeightKg: number
  sameCityOnly: boolean
}

export const SERVICES: Record<ServiceId, ServiceConfig> = {
  REGULER: {
    id: "REGULER",
    name: "Reguler",
    tagline: "Paling ekonomis",
    description:
      "Pilihan hemat untuk paket sehari-hari ke seluruh Indonesia dengan jaringan agen luas.",
    estimate: "2–4 hari",
    baseRate: 9_000,
    zoneRate: 2_500,
    minWeightKg: 1,
    sameCityOnly: false,
  },
  EXPRESS: {
    id: "EXPRESS",
    name: "Express",
    tagline: "Lebih cepat",
    description:
      "Prioritas jalur cepat untuk paket penting. Cocok untuk dokumen dan barang bernilai.",
    estimate: "1–2 hari",
    baseRate: 14_000,
    zoneRate: 3_500,
    minWeightKg: 1,
    sameCityOnly: false,
  },
  SAME_DAY: {
    id: "SAME_DAY",
    name: "Same Day",
    tagline: "Tiba hari ini",
    description:
      "Pengiriman dalam kota yang tiba di hari yang sama. Tersedia untuk rute satu kota.",
    estimate: "Hari ini",
    baseRate: 30_000,
    zoneRate: 0,
    minWeightKg: 1,
    sameCityOnly: true,
  },
  KARGO: {
    id: "KARGO",
    name: "Kargo",
    tagline: "Untuk barang besar",
    description:
      "Tarif khusus barang bervolume besar. Berat tertagih minimal 10 kg per pengiriman.",
    estimate: "4–7 hari",
    baseRate: 6_000,
    zoneRate: 1_800,
    minWeightKg: 10,
    sameCityOnly: false,
  },
}

export const SERVICE_ORDER: ServiceId[] = [
  "REGULER",
  "EXPRESS",
  "SAME_DAY",
  "KARGO",
]

export const SERVICE_LABEL: Record<ServiceId, string> = {
  REGULER: "Reguler",
  EXPRESS: "Express",
  SAME_DAY: "Same Day",
  KARGO: "Kargo",
}
