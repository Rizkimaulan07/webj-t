import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"

const steps = [
  {
    title: "Cek tarif & pilih layanan",
    description:
      "Masukkan rute dan berat paket. Bandingkan estimasi serta harga dari setiap layanan.",
  },
  {
    title: "Isi alamat & detail paket",
    description:
      "Lengkapi data pengirim dan penerima, lalu tentukan dimensi serta opsi asuransi.",
  },
  {
    title: "Bayar & dapat nomor resi",
    description:
      "Selesaikan pembayaran simulasi. Nomor resi dan label pengiriman langsung dibuat.",
  },
  {
    title: "Lacak sampai diterima",
    description:
      "Pantau setiap pergerakan paket lewat halaman lacak atau akunmu, kapan pun.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="bg-muted/60 py-14 sm:py-20">
      <div className="page-container">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Cara kerja"
              title="Empat langkah, paket siap jalan"
              description="Tanpa antre panjang. Buat pengiriman dari rumah dan serahkan paket ke kurir atau drop point terdekat."
            />
            <div className="mt-6 rounded-xl border bg-card p-5 shadow-soft">
              <p className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2
                  className="size-4 text-success"
                  aria-hidden="true"
                />
                Tarif transparan sebelum bayar
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Harga yang tampil sudah memperhitungkan berat tertagih dan
                asuransi bila dipilih.
              </p>
              <Button asChild className="mt-4 w-full sm:w-auto">
                <Link to="/kirim">
                  Mulai kirim sekarang
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/25"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-base font-extrabold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
