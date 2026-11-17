import { Link } from "react-router-dom"
import { ArrowRight, Printer, Search } from "lucide-react"

import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { angka, rupiah, tanggal } from "@/lib/format"
import { SERVICE_LABEL } from "@/lib/services"
import type { ShipmentOrder } from "@/types/shipment"

interface OrderCardProps {
  order: ShipmentOrder
  onDetail: (order: ShipmentOrder) => void
}

export function OrderCard({ order, onDetail }: OrderCardProps) {
  return (
    <article className="rounded-xl border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Nomor resi
          </p>
          <p className="mt-0.5 font-mono text-base font-extrabold tracking-wide break-all">
            {order.awb}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tanggal(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
        <span className="truncate">{order.from}</span>
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="truncate">{order.to}</span>
        <Badge variant="secondary">{SERVICE_LABEL[order.service]}</Badge>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Penerima</dt>
          <dd className="mt-0.5 truncate font-bold">{order.receiverMasked}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Berat tertagih</dt>
          <dd className="mt-0.5 font-bold">{angka(order.weightKg)} kg</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="mt-0.5 font-bold">{rupiah(order.total)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap justify-end gap-1 border-t pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDetail(order)}
        >
          Detail
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={`/label/${order.awb}`}>
            <Printer className="size-4" aria-hidden="true" />
            Label
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to={`/lacak/${encodeURIComponent(order.awb)}`}>
            <Search className="size-4" aria-hidden="true" />
            Lacak
          </Link>
        </Button>
      </div>
    </article>
  )
}
