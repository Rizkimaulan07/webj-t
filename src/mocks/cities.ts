import type { City, IslandId } from "@/types/tariff"

export const CITIES: City[] = [
  { id: "jakarta", name: "Jakarta", province: "DKI Jakarta", island: "JAWA" },
  { id: "bandung", name: "Bandung", province: "Jawa Barat", island: "JAWA" },
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", island: "JAWA" },
  {
    id: "yogyakarta",
    name: "Yogyakarta",
    province: "DI Yogyakarta",
    island: "JAWA",
  },
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", island: "JAWA" },
  { id: "malang", name: "Malang", province: "Jawa Timur", island: "JAWA" },
  { id: "denpasar", name: "Denpasar", province: "Bali", island: "BALI_NUSA" },
  {
    id: "mataram",
    name: "Mataram",
    province: "Nusa Tenggara Barat",
    island: "BALI_NUSA",
  },
  { id: "medan", name: "Medan", province: "Sumatera Utara", island: "SUMATERA" },
  {
    id: "palembang",
    name: "Palembang",
    province: "Sumatera Selatan",
    island: "SUMATERA",
  },
  {
    id: "padang",
    name: "Padang",
    province: "Sumatera Barat",
    island: "SUMATERA",
  },
  {
    id: "bandar-lampung",
    name: "Bandar Lampung",
    province: "Lampung",
    island: "SUMATERA",
  },
  {
    id: "balikpapan",
    name: "Balikpapan",
    province: "Kalimantan Timur",
    island: "KALIMANTAN",
  },
  {
    id: "pontianak",
    name: "Pontianak",
    province: "Kalimantan Barat",
    island: "KALIMANTAN",
  },
  {
    id: "banjarmasin",
    name: "Banjarmasin",
    province: "Kalimantan Selatan",
    island: "KALIMANTAN",
  },
  {
    id: "makassar",
    name: "Makassar",
    province: "Sulawesi Selatan",
    island: "SULAWESI",
  },
  {
    id: "manado",
    name: "Manado",
    province: "Sulawesi Utara",
    island: "SULAWESI",
  },
  { id: "jayapura", name: "Jayapura", province: "Papua", island: "PAPUA_MALUKU" },
  { id: "ambon", name: "Ambon", province: "Maluku", island: "PAPUA_MALUKU" },
]

const PAIR_ZONE: Record<string, number> = {
  "BALI_NUSA|JAWA": 2,
  "BALI_NUSA|KALIMANTAN": 3,
  "BALI_NUSA|PAPUA_MALUKU": 4,
  "BALI_NUSA|SULAWESI": 3,
  "BALI_NUSA|SUMATERA": 3,
  "JAWA|KALIMANTAN": 3,
  "JAWA|PAPUA_MALUKU": 4,
  "JAWA|SULAWESI": 4,
  "JAWA|SUMATERA": 2,
  "KALIMANTAN|PAPUA_MALUKU": 4,
  "KALIMANTAN|SULAWESI": 2,
  "KALIMANTAN|SUMATERA": 3,
  "PAPUA_MALUKU|SULAWESI": 3,
  "PAPUA_MALUKU|SUMATERA": 4,
  "SULAWESI|SUMATERA": 4,
}

export function getCityById(id: string): City | undefined {
  return CITIES.find((city) => city.id === id)
}

export function getCityName(id: string): string {
  return getCityById(id)?.name ?? "-"
}

export function getZone(origin: City, destination: City): number {
  if (origin.id === destination.id) return 0
  if (origin.island === destination.island) return 1
  const key = [origin.island, destination.island].sort().join("|")
  return PAIR_ZONE[key] ?? 3
}

export const ISLAND_LABEL: Record<IslandId, string> = {
  JAWA: "Jawa",
  SUMATERA: "Sumatera",
  KALIMANTAN: "Kalimantan",
  SULAWESI: "Sulawesi",
  BALI_NUSA: "Bali & Nusa Tenggara",
  PAPUA_MALUKU: "Papua & Maluku",
}
