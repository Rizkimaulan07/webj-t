import { MapPinOff } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import type { Branch } from "@/types/branch"
import { BranchCard } from "./BranchCard"

interface BranchListProps {
  branches: Branch[] | undefined
  isLoading: boolean
  isFetching?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function BranchList({
  branches,
  isLoading,
  isFetching,
  emptyTitle = "Cabang tidak ditemukan",
  emptyDescription = "Coba kata kunci lain, misalnya nama kota atau layanan yang dicari.",
}: BranchListProps) {
  if (isLoading) {
    return <BranchListSkeleton />
  }

  if (!branches || branches.length === 0) {
    return (
      <EmptyState
        icon={MapPinOff}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div
      className={isFetching ? "grid gap-4 opacity-70 transition-opacity sm:grid-cols-2 xl:grid-cols-3" : "grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3"}
      aria-busy={isFetching}
    >
      {branches.map((branch) => (
        <BranchCard key={branch.id} branch={branch} />
      ))}
    </div>
  )
}

export function BranchListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      <span className="sr-only">Memuat daftar cabang…</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="mt-6 flex gap-2 border-t pt-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
