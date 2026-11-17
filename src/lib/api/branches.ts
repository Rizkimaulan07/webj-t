import { BRANCHES } from "@/mocks/branches"
import type { Branch } from "@/types/branch"
import { jedaApi } from "./client"

export async function searchBranches(query: string): Promise<Branch[]> {
  await jedaApi()
  const q = query.trim().toLowerCase()
  if (!q) return BRANCHES
  return BRANCHES.filter((branch) => {
    const haystack = [
      branch.name,
      branch.city,
      branch.address,
      branch.type,
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}
