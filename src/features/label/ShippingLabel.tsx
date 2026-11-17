import { ArrowRight, ShieldCheck } from "lucide-react"

import { Barcode } from "@/features/label/Barcode"
import { angka, rupiah, tanggalSingkat } from "@/lib/format"
import { DELIVERY_LABEL, PAYMENT_LABEL } from "@/lib/payments"
import { SERVICE_LABEL } from "@/lib/services"
import { getCityName } from "@/mocks/cities"
import type { ShipmentOrder } from "@/types/shipment"

interface ShippingLabelProps {
  order: ShipmentOrder
}

export function ShippingLabel({ order }: ShippingLabelProps) {
  const dimensi =
    order.goods.lengthCm > 0 &&
    order.goods.widthCm > 0 &&
    order.goods.heightCm > 0
      ? `${order.goods.lengthCm} × ${order.goods.widthCm} × ${order.goods.heightCm} cm`
      : "Tidak dicantumkan"

  return (
    <article className="label-sheet mx-auto w-full max-w-[30rem] border border-black/15 bg-white p-4 text-black shadow-soft sm:p-5">
      <header className="flex items-start justify-between gap-3 border-b-2 border-black pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-[0.6rem] font-extrabold tracking-tight text-white">
            JNT
          </span>
          <div>
            <p className="text-sm leading-none font-extrabold tracking-tight">
              J&T Express
            </p>
            <p className="mt-0.5 text-[0.58rem] font-semibold tracking-[0.16em] text-black/60 uppercase">
              Laju sampai tujuan
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-extrabold uppercase">
            {SERVICE_LABEL[order.service]}
          </p>
          <p className="text-[0.6rem] text-black/60">
            {DELIVERY_LABEL[order.deliveryMethod]}
          </p>
          <p className="text-[0.6rem] text-black/60">
            {tanggalSingkat(order.createdAt)}
          </p>
        </div>
      </header>

      <div className="py-2.5 text-center">
        <p className="text-[0.58rem] font-bold tracking-[0.2em] text-black/60 uppercase">
          Nomor resi
        </p>
        <p className="font-mono text-lg font-extrabold tracking-[0.12em]">
          {order.awb}
        </p>
        <Barcode
          value={order.awb}
          className="label-barcode mx-auto mt-1 h-14 max-w-[19rem]"
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-y-2 border-black py-2.5">
        <div className="min-w-0">
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Dari
          </p>
          <p className="text-lg leading-tight font-extrabold break-words uppercase">
            {order.from}
          </p>
          <p className="text-[0.65rem]">{order.sender.postalCode}</p>
        </div>
        <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 text-right">
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Ke
          </p>
          <p className="text-lg leading-tight font-extrabold break-words uppercase">
            {order.to}
          </p>
          <p className="text-[0.65rem]">{order.receiver.postalCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-black py-2.5">
        <div className="min-w-0">
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Penerima
          </p>
          <p className="text-xs leading-snug font-extrabold break-words">
            {order.receiver.name}
          </p>
          <p className="text-[0.65rem]">{order.receiver.phone}</p>
          <p className="mt-0.5 text-[0.65rem] leading-snug break-words">
            {order.receiver.address}, {getCityName(order.receiver.cityId)}{" "}
            {order.receiver.postalCode}
          </p>
        </div>
        <div className="min-w-0 border-l border-black/20 pl-3">
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Pengirim
          </p>
          <p className="text-xs leading-snug font-bold break-words">
            {order.sender.name}
          </p>
          <p className="text-[0.65rem]">{order.sender.phone}</p>
          <p className="mt-0.5 text-[0.65rem] leading-snug break-words">
            {order.sender.address}, {getCityName(order.sender.cityId)}{" "}
            {order.sender.postalCode}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-2.5">
        <div>
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Isi paket
          </p>
          <p className="text-[0.68rem] leading-snug font-semibold break-words">
            {order.goods.description}
          </p>
          <p className="mt-0.5 text-[0.63rem] text-black/70">
            {angka(order.goods.weightKg)} kg aktual · {angka(order.weightKg)} kg
            tertagih
          </p>
          <p className="text-[0.63rem] text-black/70">Dimensi {dimensi}</p>
        </div>
        <div>
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Nilai & asuransi
          </p>
          <p className="text-[0.68rem] font-semibold">
            {rupiah(order.goods.value)}
          </p>
          <p className="text-[0.63rem] text-black/70">
            {order.goods.insurance ? "Asuransi aktif" : "Tanpa asuransi"}
          </p>
          {order.dropBranchName && (
            <p className="mt-0.5 text-[0.63rem] leading-snug text-black/70">
              Drop-off: {order.dropBranchName}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 border-t-2 border-black pt-2">
        <div>
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Pembayaran
          </p>
          <p className="text-[0.7rem] font-bold">
            {PAYMENT_LABEL[order.paymentMethod]}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[0.6rem] font-semibold text-black/70">
            <ShieldCheck className="size-3" aria-hidden="true" />
            {order.paymentMethod === "COD"
              ? `Tagihan ${rupiah(order.total)}`
              : "Lunas (simulasi)"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.55rem] font-bold tracking-wide text-black/60 uppercase">
            Total
          </p>
          <p className="text-sm font-extrabold">{rupiah(order.total)}</p>
        </div>
      </div>

      <p className="mt-2 text-center text-[0.53rem] leading-relaxed text-black/55">
        Label simulasi J&T Express. Bukan dokumen resmi. Jangan lipat bagian
        barcode. Simpan bukti ini sampai paket diterima.
      </p>
    </article>
  )
}
