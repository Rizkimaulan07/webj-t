import {
  BadgeCheck,
  CreditCard,
  MapPinned,
  PackageSearch,
} from "lucide-react"

const items = [
  {
    icon: MapPinned,
    title: "Jemput di rumah",
    description: "Pilih pickup kurir atau antar sendiri ke cabang.",
  },
  {
    icon: BadgeCheck,
    title: "Asuransi opsional",
    description: "Lindungi paket bernilai dengan premi transparan.",
  },
  {
    icon: CreditCard,
    title: "Bayar fleksibel",
    description: "VA, e-wallet, QRIS, atau COD saat paket tiba.",
  },
  {
    icon: PackageSearch,
    title: "Lacak real-time",
    description: "Status pengiriman selalu bisa dipantau kapan saja.",
  },
]

export function TrustStrip() {
  return (
    <section aria-label="Keunggulan layanan" className="relative z-10 -mt-7 pb-2">
      <div className="page-container">
        <div className="grid gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-lift sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
