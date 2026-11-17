import { lazy, Suspense } from "react"
import {
  AlertCircle,
  MapPin,
  PackageCheck,
  Route,
  UserRound,
  Weight,
} from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/client"
import { angka } from "@/lib/format"
import { SERVICE_LABEL } from "@/lib/services"
import { TrackTimeline } from "./TrackTimeline"
import { useTracking } from "./useTracking"

const TrackingMap = lazy(() =>
  import("./TrackingMap").then((module) => ({ default: module.TrackingMap })),
)

interface TrackingResultProps {
  awb: string
  onTryDemo?: () => void
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true">
      <span className="sr-only">Memuat data resi…</span>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrackingResult({ awb, onTryDemo }: TrackingResultProps) {
  const { data, isPending, isError, error } = useTracking(awb)

  if (isPending) {
    return (
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <LoadingState />
      </div>
    )
  }

  if (isError || !data) {
    const notFound = error instanceof ApiError && error.code === "NOT_FOUND"
    return (
      <div role="alert" className="rounded-xl border bg-card p-4 sm:p-5">
        <EmptyState
          icon={AlertCircle}
          title={notFound ? "Resi tidak ditemukan" : "Gagal memuat resi"}
          description={
            notFound
              ? "Periksa kembali nomor resi yang kamu masukkan. Pastikan tidak ada karakter yang tertukar."
              : "Terjadi kendala saat memuat data. Coba lagi beberapa saat lagi."
          }
          className="border-0 bg-transparent px-0 py-4"
          action={
            onTryDemo ? (
              <Button type="button" variant="outline" onClick={onTryDemo}>
                Coba resi demo
              </Button>
            ) : undefined
          }
        />
      </div>
    )
  }

  return (
    <section
      aria-label={`Hasil pelacakan ${data.awb}`}
      className="overflow-hidden rounded-xl border bg-card"
    >
      <div className="border-b bg-muted/50 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Nomor resi
            </p>
            <p className="mt-0.5 text-base font-extrabold tracking-wide break-all sm:text-lg">
              {data.awb}
            </p>
          </div>
          <StatusBadge status={data.status} />
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
          <Route className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{data.from}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            →
          </span>
          <span className="truncate">{data.to}</span>
        </div>

        <Suspense
          fallback={
            <div
              role="status"
              className="h-64 animate-pulse rounded-xl bg-muted sm:h-72"
            >
              <span className="sr-only">Memuat peta rute...</span>
            </div>
          }
        >
          <TrackingMap shipment={data} />
        </Suspense>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md border bg-background px-3 py-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <PackageCheck className="size-3.5" aria-hidden="true" />
              Layanan
            </dt>
            <dd className="mt-0.5 font-bold">{SERVICE_LABEL[data.service]}</dd>
          </div>
          <div className="rounded-md border bg-background px-3 py-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Weight className="size-3.5" aria-hidden="true" />
              Berat tertagih
            </dt>
            <dd className="mt-0.5 font-bold">{angka(data.weightKg)} kg</dd>
          </div>
          <div className="rounded-md border bg-background px-3 py-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              Tujuan
            </dt>
            <dd className="mt-0.5 font-bold">{data.to}</dd>
          </div>
          <div className="rounded-md border bg-background px-3 py-2">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserRound className="size-3.5" aria-hidden="true" />
              Penerima
            </dt>
            <dd className="mt-0.5 font-bold">{data.receiverMasked}</dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-3 text-sm font-extrabold">Riwayat pengiriman</h3>
          <TrackTimeline events={data.events} />
        </div>
      </div>
    </section>
  )
}
