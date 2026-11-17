import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

const keunggulan = [
  "Tarif khusus untuk pengiriman rutin",
  "Satu dasbor untuk semua pesanan",
  "Label dan resi dibuat otomatis",
]

export function BusinessCta() {
  return (
    <section className="py-14 sm:py-20">
      <div className="page-container">
        <div className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-10 text-primary-foreground shadow-lift sm:px-10 sm:py-12">
          <div
            className="brand-grid pointer-events-none absolute inset-0 opacity-[0.06]"
            aria-hidden="true"
          />
          <div
            className="absolute -top-24 -right-16 size-72 rounded-full bg-white/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-black/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_auto]">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#ffd7db] uppercase">
                Untuk bisnis
              </p>
              <h2 className="mt-2 max-w-2xl text-2xl leading-tight font-extrabold sm:text-3xl">
                Kirim lebih banyak, kelola lebih rapi.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/75">
                Buat akun bisnis untuk menyimpan alamat pelanggan, mengatur
                pengiriman berulang, dan memantau seluruh resi dalam satu
                tampilan.
              </p>
              <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {keunggulan.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full bg-[#ffd7db]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button asChild variant="on-brand" size="lg">
                <Link to="/daftar">Daftar akun bisnis</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/#layanan">
                  Pelajari layanan
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
