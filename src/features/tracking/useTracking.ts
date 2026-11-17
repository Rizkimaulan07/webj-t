import { useQuery } from "@tanstack/react-query"

import { getShipmentByAwb } from "@/lib/api/tracking"

export function useTracking(awb: string | null) {
  return useQuery({
    queryKey: ["tracking", awb],
    queryFn: () => getShipmentByAwb(awb ?? ""),
    enabled: Boolean(awb),
    retry: false,
    staleTime: 15_000,
  })
}
