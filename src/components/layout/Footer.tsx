import { Link } from "react-router-dom"
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { Logo } from "@/components/shared/Logo"

const layananLinks = [
  { label: "Lacak Paket", to: "/lacak" },
  { label: "Cek Tarif", to: "/tarif" },
  { label: "Buat Pengiriman", to: "/kirim" },
  { label: "Cari Cabang", to: "/cabang" },
]

const perusahaanLinks = [
  { label: "Layanan", to: "/#layanan" },
  { label: "Cara Kerja", to: "/#cara-kerja" },
  { label: "Pusat Bantuan", to: "/bantuan" },
  { label: "Akun Bisnis", to: "/daftar" },
  { label: "Masuk", to: "/masuk" },
]

const metodePembayaran = ["Virtual Account", "QRIS", "E-Wallet", "COD"]

export function Footer() {
  return (
    <footer className="no-print mt-auto bg-[#171314] text-white">
      <div className="h-1 brand-gradient" aria-hidden="true" />
      <div className="page-container py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_0.9fr_0.9fr_1.2fr]">
          <div className="space-y-5">
            <Logo asLink={false} tone="light" className="h-12" />
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Jaringan pengiriman yang menghubungkan kota-kota di Indonesia.
              Cepat, transparan, dan mudah dipantau dari mana saja.
            </p>
            <div className="flex flex-wrap gap-2">
              {metodePembayaran.map((metode) => (
                <span
                  key={metode}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[0.65rem] font-bold tracking-wide text-white/65"
                >
                  {metode}
                </span>
              ))}
            </div>
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#ff9aa3] uppercase">
              <ShieldCheck className="size-4" aria-hidden="true" />
              500+ kota · 6 hub utama
            </p>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-white">Layanan</h2>
            <ul className="mt-2 grid gap-0.5">
              {layananLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-11 min-w-11 items-center text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-white">Perusahaan</h2>
            <ul className="mt-2 grid gap-0.5">
              {perusahaanLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-11 min-w-11 items-center text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-white">Hubungi kami</h2>
            <ul className="mt-2 grid gap-2.5 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-[#ff6b78]"
                  aria-hidden="true"
                />
                <span>
                  Jl. Melati Raya No. 88, Kebayoran Baru, Jakarta Selatan 12130
                </span>
              </li>
              <li>
                <a
                  href="tel:+622155501122"
                  className="inline-flex min-h-11 min-w-11 items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="size-4 text-[#ff6b78]" aria-hidden="true" />
                  1500-123
                </a>
              </li>
              <li>
                <a
                  href="mailto:halo@jntexpress.id"
                  className="inline-flex min-h-11 min-w-11 items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="size-4 text-[#ff6b78]" aria-hidden="true" />
                  halo@jntexpress.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 J&amp;T Express. Seluruh hak dilindungi.</p>
          <p>
            Situs demo. Nama, resi, harga, dan alamat pada halaman ini adalah
            data contoh.
          </p>
        </div>
      </div>
    </footer>
  )
}
