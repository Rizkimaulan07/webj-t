import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { ArrowRight, Boxes, Clock3, Package, Zap } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { rupiah } from "@/lib/format"
import { SERVICE_ORDER, SERVICES } from "@/lib/services"
import type { ServiceId } from "@/types/shipment"

const ICONS: Record<ServiceId, LucideIcon> = {
  REGULER: Package,
  EXPRESS: Zap,
  SAME_DAY: Clock3,
  KARGO: Boxes,
}

export function ServicesSection() {
  return (
    <section id="layanan" className="py-14 sm:py-20">
      <div className="page-container">
        <SectionHeading
          eyebrow="Layanan"
          title="Pilih cara kirim yang paling pas"
          description="Dari dokumen penting hingga barang besar, setiap layanan punya tarif dan estimasi yang jelas."
          action={
            <Button asChild variant="outline">
              <Link to="/tarif">
                Hitung tarif
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_ORDER.map((serviceId) => {
            const service = SERVICES[serviceId]
            const Icon = ICONS[serviceId]
            return (
              <Link
                key={service.id}
                to="/tarif"
                className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift focus-visible:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <Badge variant="accent">{service.tagline}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{service.name}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-5 border-t pt-3">
                  <p className="text-sm font-extrabold text-primary">
                    Mulai {rupiah(service.baseRate)}
                    <span className="font-medium text-muted-foreground">/kg</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Estimasi {service.estimate}
                    {service.id === "KARGO" && " · min. 10 kg"}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
