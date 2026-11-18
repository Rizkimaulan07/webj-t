import { PackagePlus } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
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
      <PageHeader
        eyebrow="Buat pengiriman"
        title="Kirim paket dalam 4 langkah"
        description="Isi data pengirim dan penerima, pilih layanan, lalu selesaikan pembayaran simulasi. Draft pengiriman tersimpan otomatis di perangkat ini."
        icon={PackagePlus}
      />

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
