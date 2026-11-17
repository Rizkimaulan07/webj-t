import { useDeferredValue, useState } from "react"
import { MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { BranchList } from "@/features/branches/BranchList"
import { BranchSearch } from "@/features/branches/BranchSearch"
import { useBranches } from "@/features/branches/useBranches"

export function BranchesPage() {
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const { data, isPending, isFetching } = useBranches(deferredQuery)

  return (
    <>
      <section className="border-b bg-card/60 py-8 sm:py-12">
        <div className="page-container">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent-foreground">
            <MapPin className="size-3.5" aria-hidden="true" />
            Jaringan cabang
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Temukan hub, drop point, dan agen
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Antarkan paket sendiri untuk menghemat biaya, atau cek layanan yang
            tersedia di cabang terdekat sebelum berkunjung.
          </p>
        </div>
      </section>

      <div className="page-container py-8">
        <Card>
          <CardContent className="pt-0">
            <BranchSearch value={query} onChange={setQuery} />
            <div className="mt-4 flex min-h-6 items-center justify-between gap-3 text-sm text-muted-foreground">
              <p aria-live="polite">
                {isPending
                  ? "Memuat cabang…"
                  : `${data?.length ?? 0} cabang ditemukan`}
                {isFetching && !isPending && " · memperbarui…"}
              </p>
              <p className="hidden sm:block">Jam operasional dapat berbeda saat libur nasional.</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <BranchList
            branches={data}
            isLoading={isPending}
            isFetching={isFetching && !isPending}
            emptyTitle={`Tidak ada cabang untuk “${deferredQuery}”`}
            emptyDescription="Coba cari nama kota lain, misalnya Bandung, Medan, atau Makassar."
          />
        </div>
      </div>
    </>
  )
}
