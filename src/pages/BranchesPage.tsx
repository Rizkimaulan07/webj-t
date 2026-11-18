import { useDeferredValue, useState } from "react"
import { MapPin } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BranchList } from "@/features/branches/BranchList"
import { BranchSearch } from "@/features/branches/BranchSearch"
import { useBranches } from "@/features/branches/useBranches"
import type { Branch } from "@/types/branch"

type BranchFilter = "SEMUA" | Branch["type"]

const TYPE_FILTERS: Array<{ id: BranchFilter; label: string }> = [
  { id: "SEMUA", label: "Semua" },
  { id: "HUB", label: "Hub" },
  { id: "DROP_POINT", label: "Drop Point" },
  { id: "AGEN", label: "Agen" },
]

export function BranchesPage() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState<BranchFilter>("SEMUA")
  const deferredQuery = useDeferredValue(query)
  const { data, isPending, isFetching } = useBranches(deferredQuery)

  const hasil =
    type === "SEMUA" ? data : data?.filter((branch) => branch.type === type)

  return (
    <>
      <PageHeader
        eyebrow="Jaringan cabang"
        title="Temukan hub, drop point, dan agen"
        description="Antarkan paket sendiri untuk menghemat biaya, atau cek layanan yang tersedia di cabang terdekat sebelum berkunjung."
        icon={MapPin}
      />

      <div className="page-container py-8">
        <Card>
          <CardContent className="grid gap-4">
            <BranchSearch value={query} onChange={setQuery} />

            <div
              className="flex flex-wrap gap-2"
              aria-label="Filter jenis cabang"
            >
              {TYPE_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  type="button"
                  size="sm"
                  variant={type === filter.id ? "accent" : "outline"}
                  aria-pressed={type === filter.id}
                  onClick={() => setType(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="flex min-h-6 flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm text-muted-foreground">
              <p aria-live="polite">
                {isPending
                  ? "Memuat cabang…"
                  : `${hasil?.length ?? 0} cabang ditemukan`}
                {isFetching && !isPending && " · memperbarui…"}
              </p>
              <p className="text-xs sm:text-sm">
                Jam operasional dapat berbeda saat libur nasional.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <BranchList
            branches={hasil}
            isLoading={isPending}
            isFetching={isFetching && !isPending}
            emptyTitle={
              deferredQuery
                ? `Tidak ada cabang untuk “${deferredQuery}”`
                : "Belum ada cabang untuk filter ini"
            }
            emptyDescription="Coba kata kunci atau jenis cabang lain, misalnya Bandung, Medan, atau Makassar."
          />
        </div>
      </div>
    </>
  )
}
