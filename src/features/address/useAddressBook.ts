import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/lib/api/addresses"
import type { AddressInput } from "@/types/user"

export function useAddresses(userId: string | undefined) {
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getAddresses(userId ?? ""),
    enabled: Boolean(userId),
  })
}

export function useCreateAddress(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AddressInput) => createAddress(userId ?? "", input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] }),
  })
}

export function useUpdateAddress(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddressInput }) =>
      updateAddress(userId ?? "", id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] }),
  })
}

export function useDeleteAddress(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAddress(userId ?? "", id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] }),
  })
}
