import { Clock3, MapPin, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SERVICE_LABEL } from "@/lib/services"
import type { Branch } from "@/types/branch"

const TYPE_LABEL: Record<Branch["type"], string> = {
  HUB: "Hub",
  DROP_POINT: "Drop Point",
  AGEN: "Agen",
}

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base leading-snug font-extrabold">{branch.name}</h3>
        <Badge variant={branch.type === "HUB" ? "default" : "secondary"}>
          {TYPE_LABEL[branch.type]}
        </Badge>
      </div>

      <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          {branch.address}
          <span className="mt-0.5 block font-semibold text-foreground">
            {branch.city}
          </span>
        </span>
      </p>

      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>{branch.hours}</span>
      </p>

      <a
        href={`tel:${branch.phone.replace(/[^\d+]/g, "")}`}
        className="mt-2 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <Phone className="size-4" aria-hidden="true" />
        {branch.phone}
      </a>

      <div className="mt-auto flex flex-wrap gap-1.5 border-t pt-3">
        {branch.services.map((service) => (
          <span
            key={service}
            className="rounded-full bg-muted px-2 py-1 text-[0.68rem] font-semibold text-muted-foreground"
          >
            {SERVICE_LABEL[service]}
          </span>
        ))}
      </div>
    </article>
  )
}
