import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  MapPin,
  PackagePlus,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { TrackingPanel } from "@/features/tracking/TrackingPanel"
import { QuickTariffForm } from "@/features/tariff/QuickTariffForm"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TariffInput } from "@/types/tariff"

export function Hero() {
  const navigate = useNavigate()
  const [awb, setAwb] = useState<string | null>(null)

  const cekTarif = (
    input: Pick<TariffInput, "originId" | "destinationId" | "weightKg">,
  ) => {
    const params = new URLSearchParams({
      asal: input.originId,
      tujuan: input.destinationId,
      berat: String(input.weightKg),
    })
    navigate(`/tarif?${params.toString()}`)
  }

  return (
    <section className="brand-gradient relative overflow-hidden text-white">
      <div
        className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 size-[26rem] rounded-full bg-black/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="brand-grid pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none absolute top-16 right-10 hidden h-64 w-80 text-white/15 lg:block"
        viewBox="0 0 320 260"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 204C60 204 64 92 122 92c58 0 54 104 110 104 34 0 46-44 80-44"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="7 9"
          strokeLinecap="round"
        />
        <circle cx="8" cy="204" r="7" fill="currentColor" />
        <circle cx="312" cy="152" r="7" fill="currentColor" />
        <path
          d="M122 92v-18m0 0-8 8m8-8 8 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="page-container relative grid items-center gap-10 py-11 sm:py-14 lg:grid-cols-[1.02fr_1fr] lg:gap-14 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
            <MapPin className="size-3.5 text-[#ffd7db]" aria-hidden="true" />
            500+ kota di Indonesia · sejak 2015
          </p>

          <h1 className="mt-5 max-w-2xl text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-5xl lg:text-[3.6rem]">
            Kirim paket{" "}
            <span className="relative inline-block text-[#ffd7db]">
              lebih laju
              <span
                className="absolute inset-x-0 -bottom-1 h-1.5 rounded-full bg-[#ffd7db]/45"
                aria-hidden="true"
              />
            </span>
            , sampai dengan aman.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Cek tarif, buat pengiriman, dan pantau paket dalam satu tempat.
            Jaringan J&amp;T Express menjangkau kota-kota besar hingga pelosok
            dengan status yang selalu transparan.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="on-brand" size="lg">
              <Link to="/kirim">
                <PackagePlus className="size-4" aria-hidden="true" />
                Buat pengiriman
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white shadow-none hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              <Link to="/lacak">
                <Search className="size-4" aria-hidden="true" />
                Lacak paket
              </Link>
            </Button>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-white/90">
            {[
              { icon: Truck, text: "Jemput paket" },
              { icon: ShieldCheck, text: "Opsi asuransi" },
              { icon: CheckCircle2, text: "Resi bisa dilacak" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2">
                <item.icon
                  className="size-4 text-[#ffd7db]"
                  aria-hidden="true"
                />
                {item.text}
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-white/15 pt-6">
            {[
              { value: "500+", label: "Kota terjangkau" },
              { value: "6", label: "Hub & agen" },
              { value: "1–2", label: "Hari Express" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[0.7rem] text-white/60">{stat.label}</dt>
                <dd className="mt-0.5 text-xl font-extrabold tracking-tight">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="w-full max-w-xl lg:justify-self-end">
          <div className="relative rounded-3xl bg-card p-4 text-card-foreground shadow-hero ring-1 ring-black/5 sm:p-6">
            <div
              className="absolute -top-3 left-5 h-1.5 w-16 rounded-full bg-primary"
              aria-hidden="true"
            />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold tracking-[0.14em] text-primary uppercase">
                  Mulai dari sini
                </p>
                <p className="text-lg font-extrabold">
                  Lacak atau cek tarif
                </p>
              </div>
              <span className="rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-extrabold text-accent-foreground">
                Gratis
              </span>
            </div>

            <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/10 bg-accent/50 p-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-xs">
                <Truck className="size-4" aria-hidden="true" />
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <span className="font-extrabold text-foreground">
                  Tentang J&amp;T Express.
                </span>{" "}
                Layanan pengiriman ekspres untuk kebutuhan pribadi dan bisnis.
                Lacak kiriman dengan nomor resi atau cek tarif sebelum mengirim.
              </p>
            </div>

            <Tabs defaultValue="lacak">
              <TabsList>
                <TabsTrigger value="lacak">
                  <Search className="size-4" aria-hidden="true" />
                  Lacak Paket
                </TabsTrigger>
                <TabsTrigger value="tarif">
                  <Calculator className="size-4" aria-hidden="true" />
                  Cek Tarif
                </TabsTrigger>
              </TabsList>
              <TabsContent value="lacak" className="pt-1">
                <TrackingPanel awb={awb} onSearch={setAwb} />
              </TabsContent>
              <TabsContent value="tarif" className="pt-1">
                <QuickTariffForm onSubmit={cekTarif} />
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-muted/70 px-3 py-2.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
                Pembayaran simulasi, tanpa transaksi nyata
              </span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
