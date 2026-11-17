import { useMemo } from "react"

import { CITIES } from "@/mocks/cities"
import type { City } from "@/types/tariff"

export function useCities(): City[] {
  return useMemo(
    () => [...CITIES].sort((a, b) => a.name.localeCompare(b.name, "id")),
    [],
  )
}
