import { useQuery } from "@tanstack/react-query"

import { getOrderByAwb, getOrders } from "@/lib/api/shipments"

export function useOrders(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["orders", ownerId],
    queryFn: () => getOrders(ownerId ?? ""),
    enabled: Boolean(ownerId),
  })
}

export function useOrderByAwb(
  awb: string | undefined,
  userId: string | undefined,
) {
  return useQuery({
    queryKey: ["order", awb, userId],
    queryFn: () => getOrderByAwb(awb ?? "", userId ?? ""),
    enabled: Boolean(awb && userId),
  })
}
