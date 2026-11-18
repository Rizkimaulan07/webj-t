import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AlertCircle, Calculator, MapPinned } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { TariffForm } from "@/features/tariff/TariffForm"
import {
  TariffResultList,
  TariffResultsSkeleton,
} from "@/features/tariff/TariffResultList"
import { useTariff } from "@/features/tariff/useTariff"
import { getCityById } from "@/mocks/cities"
import type { TariffInput, TariffOption } from "@/types/tariff"

const RUTE_POPULER = [
  { asal: "bandung", tujuan: "jakarta", berat: 2 },
  { asal: "jakarta", tujuan: "surabaya", berat: 3 },
  { asal: "surabaya", tujuan: "makassar", berat: 5 },
  { asal: "medan", tujuan: "jakarta", berat: 2 },
]

function labelRute(asal: string, tujuan: string) {
  return `${getCityById(asal)?.name ?? asal} → ${getCityById(tujuan)?.name ?? tujuan}`
}

interface InitialTariff {
  form: Partial<TariffInput>
  submitted: TariffInput | null
}

function ambilTarifDariUrl(params: URLSearchParams): InitialTariff {
  const originId = params.get("asal") ?? ""
  const destinationId = params.get("tujuan") ?? ""
  const berat = Number(params.get("berat") ?? "0")
  const form: Partial<TariffInput> = {
    originId,
    destinationId,
    weightKg: Number.isFinite(berat) && berat > 0 ? berat : undefined,
  }
  if (
    getCityById(originId) &&
    getCityById(destinationId) &&
    Number.isFinite(berat) &&
    berat > 0
  ) {
    return {
      form,
      submitted: {
        originId,
        destinationId,
        weightKg: berat,
        lengthCm: 0,
        widthCm: 0,
        heightCm: 0,
        insurance: false,
        goodsValue: 0,
      },
    }
  }
  return { form, submitted: null }
}

export function TariffPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const initial = ambilTarifDariUrl(searchParams)
  const paramKey = searchParams.toString()
  const [submitted, setSubmitted] = useState<TariffInput | null>(
    initial.submitted,
  )
  const [syncedParamKey, setSyncedParamKey] = useState(paramKey)
  const { data, isPending, isError, error, refetch } = useTariff(submitted)

  if (paramKey !== syncedParamKey) {
    setSyncedParamKey(paramKey)
    setSubmitted(ambilTarifDariUrl(searchParams).submitted)
  }

  const pilihLayanan = (option: TariffOption) => {
    if (!user) {
      toast.info("Masuk atau daftar dulu untuk melanjutkan pengiriman.")
      navigate("/masuk", { state: { from: "/kirim" } })
      return
    }
    toast.success(`Layanan ${option.name} dipilih. Lanjut isi alamat pengiriman.`)
    navigate("/kirim")
  }

  const initialValues: Partial<TariffInput> = {
    ...initial.form,
    weightKg: initial.form.weightKg ?? 1,
  }

  return (
    <>
      <PageHeader
        eyebrow="Kalkulator tarif"
        title="Hitung tarif sebelum kirim"
        description="Masukkan rute, berat, dan dimensi paket. Kami hitung berat tertagih serta biaya asuransi bila dipilih, tanpa biaya tersembunyi."
        icon={Calculator}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">
            Rute populer:
          </span>
          {RUTE_POPULER.map((rute) => (
            <Button
              key={`${rute.asal}-${rute.tujuan}`}
              asChild
              variant="outline"
              size="sm"
              className="bg-white"
            >
              <Link
                to={`/tarif?asal=${rute.asal}&tujuan=${rute.tujuan}&berat=${rute.berat}`}
              >
                {labelRute(rute.asal, rute.tujuan)}
                <span className="text-xs font-medium text-muted-foreground">
                  {rute.berat} kg
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </PageHeader>

      <div className="page-container grid gap-6 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <Card className="lg:sticky lg:top-28">
          <CardHeader>
            <CardTitle>Detail pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <TariffForm
              key={searchParams.toString()}
              initial={initialValues}
              isCalculating={Boolean(submitted) && isPending}
              onSubmit={setSubmitted}
            />
          </CardContent>
        </Card>

        <section aria-labelledby="hasil-tarif" className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="hasil-tarif" className="text-xl font-extrabold">
                Pilihan layanan
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data && !isPending
                  ? `${data.length} layanan ditemukan, diurutkan dari yang termurah.`
                  : "Lengkapi detail di samping untuk melihat layanan."}
              </p>
            </div>
          </div>

          {!submitted && (
            <EmptyState
              icon={MapPinned}
              title="Tarif belum dihitung"
              description="Isi kota asal, kota tujuan, dan berat paket untuk melihat perbandingan layanan."
            />
          )}

          {submitted && isPending && <TariffResultsSkeleton />}

          {submitted && isError && (
            <EmptyState
              icon={AlertCircle}
              title="Gagal menghitung tarif"
              description={
                error instanceof Error
                  ? error.message
                  : "Terjadi kendala. Coba hitung ulang."
              }
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void refetch()}
                >
                  Coba lagi
                </Button>
              }
            />
          )}

          {submitted && !isPending && !isError && data && (
            <TariffResultList options={data} onSelect={pilihLayanan} />
          )}
        </section>
      </div>
    </>
  )
}
