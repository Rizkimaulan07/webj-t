import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Clock3, PackageCheck, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

const benefits = [
  {
    icon: PackageCheck,
    title: "Kelola semua paket",
    description: "Riwayat pesanan, label, dan status pengiriman di satu tempat.",
  },
  {
    icon: Clock3,
    title: "Lebih hemat waktu",
    description: "Alamat tersimpan dan tarif transparan setiap kali mengirim.",
  },
  {
    icon: ShieldCheck,
    title: "Aman sampai tujuan",
    description: "Opsi asuransi dan pelacakan resi yang mudah dipantau.",
  },
]

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="page-container py-8 sm:py-12">
      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
        <aside className="relative hidden overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div
            className="absolute -top-20 -right-16 size-72 rounded-full bg-accent/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-16 size-72 rounded-full bg-info/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">
              Akun J&T Express
            </p>
            <h2 className="mt-4 max-w-md text-3xl leading-tight font-extrabold">
              Satu akun untuk semua kebutuhan pengirimanmu.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/75">
              Daftar gratis, atur pengiriman dengan cepat, dan pantau paket
              tanpa perlu mencatat nomor resi di tempat lain.
            </p>
          </div>

          <ul className="relative mt-10 grid gap-5">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
                  <benefit.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold">{benefit.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/70">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="relative mt-10 text-xs text-primary-foreground/60">
            <Link to="/lacak" className="underline underline-offset-4 hover:text-white">
              Lacak paket tanpa akun
            </Link>
          </p>
        </aside>

        <div className="flex items-center">
          <div className="w-full rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            {children}
            <div className={cn("mt-6 border-t pt-5 text-sm text-muted-foreground")}>
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
