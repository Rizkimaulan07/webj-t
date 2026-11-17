import { useQuery } from "@tanstack/react-query"

import { getTariffs } from "@/lib/api/tariff"
import type { TariffInput } from "@/types/tariff"

export function useTariff(input: TariffInput | null) {
  return useQuery({
    queryKey: ["tariff", input],
    queryFn: () => {
      if (!input) {
        return Promise.reject(new Error("Input tarif belum lengkap."))
      }
      return getTariffs(input)
    },
    enabled: input !== null,
    staleTime: 60_000,
  })
}
