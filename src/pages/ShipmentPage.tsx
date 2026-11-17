import { PackagePlus } from "lucide-react"

import { GoodsServiceStep } from "@/features/shipment/GoodsServiceStep"
import { PartyStep } from "@/features/shipment/PartyStep"
import { PaymentStep } from "@/features/shipment/PaymentStep"
import { ShipmentStepper } from "@/features/shipment/ShipmentStepper"
import { useShipmentDraft } from "@/features/shipment/useShipmentDraft"

export function ShipmentPage() {
  const step = useShipmentDraft((state) => state.step)
  const setStep = useShipmentDraft((state) => state.setStep)

  return (
    <>
      <section className="border-b bg-card/60 py-8 sm:py-10">
        <div className="page-container">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent-foreground">
            <PackagePlus className="size-3.5" aria-hidden="true" />
            Buat pengiriman
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Kirim paket dalam 4 langkah
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Isi data pengirim dan penerima, pilih layanan, lalu selesaikan
            pembayaran simulasi. Draft pengiriman tersimpan otomatis di
            perangkat ini.
          </p>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <div className="mb-5 rounded-xl border bg-card p-3.5 shadow-soft sm:p-5">
          <ShipmentStepper step={step} onStepClick={setStep} />
        </div>

        {step === 1 && <PartyStep role="sender" />}
        {step === 2 && <PartyStep role="receiver" />}
        {step === 3 && <GoodsServiceStep />}
        {step === 4 && <PaymentStep />}
      </div>
    </>
  )
}
