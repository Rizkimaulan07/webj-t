import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { searchBranches } from "@/lib/api/branches"

export function useBranches(query: string) {
  return useQuery({
    queryKey: ["branches", query],
    queryFn: () => searchBranches(query),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}
