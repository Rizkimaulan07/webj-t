import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BadgePercent,
  Boxes,
  Clock3,
  Info,
  Package,
  ShieldCheck,
  Weight,
  Zap,
} from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { angka, rupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ServiceId } from "@/types/shipment"
import type { TariffOption } from "@/types/tariff"

const SERVICE_ICONS: Record<ServiceId, LucideIcon> = {
  REGULER: Package,
  EXPRESS: Zap,
  SAME_DAY: Clock3,
  KARGO: Boxes,
}

interface TariffResultListProps {
  options: TariffOption[]
  onSelect: (option: TariffOption) => void
}

function zoneLabel(zone: number): string {
  if (zone === 0) return "Dalam kota"
  if (zone === 1) return "Satu pulau"
  return `Antar pulau · zona ${zone}`
}

export function TariffResultList({ options, onSelect }: TariffResultListProps) {
  if (options.length === 0) {
    return (
      <EmptyState
        title="Belum ada layanan tersedia"
        description="Ubah rute atau berat paket, lalu hitung tarif kembali."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {options.map((option, index) => {
        const Icon = SERVICE_ICONS[option.service]
        return (
          <article
            key={option.service}
            className={cn(
              "group relative rounded-2xl border border-border/80 bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lift sm:p-5",
              index === 0 && "border-primary/40",
            )}
          >
            {index === 0 && (
              <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-3 py-0.5 text-[0.65rem] font-extrabold tracking-wide text-primary-foreground uppercase shadow-sm">
                Termurah
              </span>
            )}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold">{option.name}</h3>
                    <Badge variant="secondary">{option.estimate}</Badge>
                  </div>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {option.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[0.65rem] font-bold tracking-wide text-muted-foreground uppercase">
                  Total
                </p>
                <p className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  {rupiah(option.total)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Weight className="size-3.5" aria-hidden="true" />
                Berat tertagih {angka(option.chargeableWeightKg)} kg
              </span>
              <span>{zoneLabel(option.zone)}</span>
              {option.minWeightApplied && (
                <span className="font-semibold text-foreground">
                  Minimal 10 kg untuk Kargo
                </span>
              )}
              {option.insuranceFee > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  Termasuk asuransi {rupiah(option.insuranceFee)}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <BadgePercent className="size-3.5" aria-hidden="true" />
                {option.shippingCost === option.total
                  ? "Sudah termasuk biaya kirim"
                  : `${rupiah(option.shippingCost)} + asuransi`}
              </p>
              <Button
                type="button"
                variant={index === 0 ? "accent" : "outline"}
                onClick={() => onSelect(option)}
              >
                Pilih
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </article>
        )
      })}

      <p className="flex items-start gap-2 rounded-md bg-secondary px-3 py-2.5 text-xs leading-relaxed text-secondary-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Berat tertagih memakai nilai terbesar antara berat aktual dan berat
          volumetrik (P × L × T ÷ 6.000). Same Day hanya tersedia untuk rute
          dalam satu kota. Harga belum termasuk biaya tambahan di luar ketentuan
          layanan.
        </span>
      </p>
    </div>
  )
}

export function TariffResultsSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true">
      <span className="sr-only">Menghitung tarif…</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5">
          <div className="flex justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-7 w-24" />
          </div>
          <div className="mt-4 flex justify-between gap-4 border-t pt-3">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
