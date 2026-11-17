import { useQuery } from "@tanstack/react-query"

import { getOrderByAwb, getOrders } from "@/lib/api/shipments"

export function useOrders(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["orders", ownerId],
    queryFn: () => getOrders(ownerId ?? ""),
    enabled: Boolean(ownerId),
  })
}

export function useOrderByAwb(awb: string | undefined) {
  return useQuery({
    queryKey: ["order", awb],
    queryFn: () => getOrderByAwb(awb ?? ""),
    enabled: Boolean(awb),
  })
}
