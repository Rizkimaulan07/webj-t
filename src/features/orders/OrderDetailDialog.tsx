import { Link } from "react-router-dom"
import { MapPin, MessageSquareText, Printer, Search } from "lucide-react"

import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TrackTimeline } from "@/features/tracking/TrackTimeline"
import { angka, rupiah, tanggal } from "@/lib/format"
import { DELIVERY_LABEL, PAYMENT_LABEL } from "@/lib/payments"
import { SERVICE_LABEL } from "@/lib/services"
import type { ShipmentOrder } from "@/types/shipment"

interface OrderDetailDialogProps {
  order: ShipmentOrder | null
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({
  order,
  onOpenChange,
}: OrderDetailDialogProps) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={onOpenChange}>
      {order && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  Detail pesanan
                </p>
                <DialogTitle className="mt-0.5 font-mono text-lg tracking-wide break-all">
                  {order.awb}
                </DialogTitle>
                <DialogDescription>
                  Dibuat {tanggal(order.createdAt)}
                </DialogDescription>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{order.from}</span>
            <span aria-hidden="true" className="text-muted-foreground">
              →
            </span>
            <span className="truncate">{order.to}</span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border bg-background px-3 py-2">
              <dt className="text-xs text-muted-foreground">Layanan</dt>
              <dd className="mt-0.5 font-bold">
                {SERVICE_LABEL[order.service]} · {order.estimated}
              </dd>
            </div>
            <div className="rounded-md border bg-background px-3 py-2">
              <dt className="text-xs text-muted-foreground">Berat tertagih</dt>
              <dd className="mt-0.5 font-bold">{angka(order.weightKg)} kg</dd>
            </div>
            <div className="rounded-md border bg-background px-3 py-2">
              <dt className="text-xs text-muted-foreground">Pengantaran</dt>
              <dd className="mt-0.5 font-bold">
                {DELIVERY_LABEL[order.deliveryMethod]}
              </dd>
            </div>
            <div className="rounded-md border bg-background px-3 py-2">
              <dt className="text-xs text-muted-foreground">Pembayaran</dt>
              <dd className="mt-0.5 font-bold">
                {PAYMENT_LABEL[order.paymentMethod]}
              </dd>
            </div>
          </dl>

          {order.dropBranchName && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Drop-off di <strong>{order.dropBranchName}</strong>
            </p>
          )}

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
              <MessageSquareText
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Riwayat perjalanan
            </h3>
            <TrackTimeline events={order.events} />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 text-sm">
              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Pengirim
              </p>
              <p className="mt-1 font-bold break-words">{order.sender.name}</p>
              <p className="text-xs text-muted-foreground">{order.sender.phone}</p>
              <p className="mt-0.5 text-xs leading-relaxed break-words text-muted-foreground">
                {order.sender.address}, {order.sender.postalCode}
              </p>
            </div>
            <div className="min-w-0 text-sm">
              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Penerima
              </p>
              <p className="mt-1 font-bold break-words">{order.receiver.name}</p>
              <p className="text-xs text-muted-foreground">
                {order.receiver.phone}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed break-words text-muted-foreground">
                {order.receiver.address}, {order.receiver.postalCode}
              </p>
            </div>
          </div>

          <div className="grid gap-1.5 rounded-lg border bg-muted/40 px-3.5 py-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Isi paket</span>
              <span className="text-right font-semibold">
                {order.goods.description}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Nilai barang</span>
              <span className="text-right font-semibold">
                {rupiah(order.goods.value)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Asuransi</span>
              <span className="text-right font-semibold">
                {order.goods.insurance ? "Aktif" : "Tidak dipilih"}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex items-end justify-between gap-3">
              <span className="font-bold">Total</span>
              <span className="text-lg font-extrabold">
                {rupiah(order.total)}
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Tutup
              </Button>
            </DialogClose>
            <Button asChild variant="outline">
              <Link to={`/label/${order.awb}`}>
                <Printer className="size-4" aria-hidden="true" />
                Label
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/lacak/${encodeURIComponent(order.awb)}`}>
                <Search className="size-4" aria-hidden="true" />
                Lacak paket
              </Link>
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
