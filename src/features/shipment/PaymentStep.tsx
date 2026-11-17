import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Landmark,
  Loader2,
  MapPin,
  QrCode,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { QrSimulasi } from "@/components/shared/QrSimulasi"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { useBranches } from "@/features/branches/useBranches"
import { createShipment } from "@/lib/api/shipments"
import { angka, rupiah } from "@/lib/format"
import {
  DELIVERY_LABEL,
  PAYMENT_DESCRIPTION,
  PAYMENT_LABEL,
  nomorVirtualAccount,
} from "@/lib/payments"
import { getCityName } from "@/mocks/cities"
import { SERVICE_LABEL } from "@/lib/services"
import type { DeliveryMethod, PaymentMethod } from "@/types/shipment"
import { cn } from "@/lib/utils"
import { useShipmentDraft } from "./useShipmentDraft"

interface DeliveryOption {
  id: DeliveryMethod
  icon: LucideIcon
  title: string
  description: string
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "PICKUP",
    icon: Truck,
    title: "Dijemput kurir",
    description:
      "Kurir menjemput paket di alamat pengirim pada jam kerja. Tanpa biaya tambahan pada demo ini.",
  },
  {
    id: "DROP_OFF",
    icon: Store,
    title: "Antar ke cabang",
    description:
      "Antarkan sendiri paket ke hub, drop point, atau agen terdekat yang kamu pilih.",
  },
]

interface PaymentOption {
  id: PaymentMethod
  icon: LucideIcon
  title: string
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "VA", icon: Landmark, title: "Virtual Account" },
  { id: "EWALLET", icon: Wallet, title: "E-Wallet" },
  { id: "QRIS", icon: QrCode, title: "QRIS" },
  { id: "COD", icon: Banknote, title: "COD" },
]

export function PaymentStep() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const sender = useShipmentDraft((state) => state.sender)
  const receiver = useShipmentDraft((state) => state.receiver)
  const goods = useShipmentDraft((state) => state.goods)
  const quotes = useShipmentDraft((state) => state.quotes)
  const service = useShipmentDraft((state) => state.service)
  const deliveryMethod = useShipmentDraft((state) => state.deliveryMethod)
  const dropBranchId = useShipmentDraft((state) => state.dropBranchId)
  const paymentMethod = useShipmentDraft((state) => state.paymentMethod)
  const setStep = useShipmentDraft((state) => state.setStep)
  const setDeliveryMethod = useShipmentDraft(
    (state) => state.setDeliveryMethod,
  )
  const setDropBranchId = useShipmentDraft((state) => state.setDropBranchId)
  const setPaymentMethod = useShipmentDraft(
    (state) => state.setPaymentMethod,
  )
  const resetDraft = useShipmentDraft((state) => state.resetDraft)

  const { data: branches, isPending: branchesLoading } = useBranches("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const quote = quotes.find((item) => item.service === service)
  const asal = getCityName(sender.cityId)
  const tujuan = getCityName(receiver.cityId)
  const cabangKota = (branches ?? []).filter(
    (branch) => branch.city === asal,
  )
  const cabangPilihan =
    cabangKota.length > 0 ? cabangKota : (branches ?? [])
  const cabangTerpilih = (branches ?? []).find(
    (branch) => branch.id === dropBranchId,
  )

  const bayar = async () => {
    if (!user || !quote || !service) {
      toast.error("Ringkasan pesanan belum lengkap. Kembali ke langkah layanan.")
      return
    }
    if (deliveryMethod === "DROP_OFF" && !dropBranchId) {
      toast.error("Pilih cabang drop-off terlebih dahulu.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)
    try {
      const order = await createShipment({
        ownerId: user.id,
        sender,
        receiver,
        goods,
        service,
        deliveryMethod,
        paymentMethod,
        total: quote.total,
        estimated: quote.estimate,
        zone: quote.zone,
        chargeableWeightKg: quote.chargeableWeightKg,
        dropBranchName:
          deliveryMethod === "DROP_OFF" ? cabangTerpilih?.name : undefined,
      })
      resetDraft()
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Pengiriman berhasil dibuat.")
      navigate(`/kirim/sukses/${order.awb}`, { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal membuat pengiriman. Coba lagi.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!quote || !service) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={ShieldCheck}
            title="Layanan belum dipilih"
            description="Kembali ke langkah paket & layanan, hitung tarif, lalu pilih layanan sebelum membayar."
            action={
              <Button type="button" onClick={() => setStep(3)}>
                Kembali ke layanan
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  const layananTerpilih = SERVICE_LABEL[service]

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setStep(3)}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke layanan
        </Button>
        <span className="text-xs font-semibold text-muted-foreground">
          Langkah 4 dari 4
        </span>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Metode pengantaran</CardTitle>
              <CardDescription>
                Pilih apakah paket dijemput kurir atau kamu antar sendiri ke
                cabang.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => {
                  const option = DELIVERY_OPTIONS.find(
                    (item) => item.id === value,
                  )
                  if (option) setDeliveryMethod(option.id)
                }}
                aria-label="Metode pengantaran paket"
              >
                {DELIVERY_OPTIONS.map((option) => {
                  const selected = deliveryMethod === option.id
                  const Icon = option.icon
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "relative rounded-xl border bg-card p-4 pl-12 transition-colors",
                        selected
                          ? "border-primary bg-secondary/40"
                          : "hover:border-primary/30",
                      )}
                    >
                      <RadioGroupItem
                        id={`antar-${option.id}`}
                        value={option.id}
                        className="absolute top-4 left-4"
                      />
                      <label
                        htmlFor={`antar-${option.id}`}
                        className="block cursor-pointer"
                      >
                        <span className="flex items-center gap-2 text-sm font-bold">
                          <Icon
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </span>
                      </label>
                    </div>
                  )
                })}
              </RadioGroup>

              {deliveryMethod === "DROP_OFF" && (
                <div className="grid gap-2 rounded-lg border bg-muted/40 p-3.5">
                  <Label htmlFor="cabang-dropoff">Cabang drop-off</Label>
                  <Select
                    value={dropBranchId || undefined}
                    onValueChange={setDropBranchId}
                    disabled={branchesLoading}
                  >
                    <SelectTrigger id="cabang-dropoff">
                      <SelectValue
                        placeholder={
                          branchesLoading
                            ? "Memuat cabang…"
                            : "Pilih cabang terdekat"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cabangPilihan.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} — {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {cabangKota.length === 0
                      ? `Belum ada cabang di ${asal}. Daftar menampilkan cabang lain yang tersedia.`
                      : "Pastikan paket tiba di cabang sebelum jam operasional berakhir."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metode pembayaran</CardTitle>
              <CardDescription>
                Semua pembayaran pada situs ini adalah simulasi. Tidak ada uang
                yang benar-benar ditagih.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => {
                  const option = PAYMENT_OPTIONS.find(
                    (item) => item.id === value,
                  )
                  if (option) setPaymentMethod(option.id)
                }}
                aria-label="Metode pembayaran"
                className="sm:grid-cols-2"
              >
                {PAYMENT_OPTIONS.map((option) => {
                  const selected = paymentMethod === option.id
                  const Icon = option.icon
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "relative rounded-xl border bg-card p-4 pl-12 transition-colors",
                        selected
                          ? "border-primary bg-secondary/40"
                          : "hover:border-primary/30",
                      )}
                    >
                      <RadioGroupItem
                        id={`bayar-${option.id}`}
                        value={option.id}
                        className="absolute top-4 left-4"
                      />
                      <label
                        htmlFor={`bayar-${option.id}`}
                        className="block cursor-pointer"
                      >
                        <span className="flex items-center gap-2 text-sm font-bold">
                          <Icon
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {PAYMENT_DESCRIPTION[option.id]}
                        </span>
                      </label>
                    </div>
                  )
                })}
              </RadioGroup>

              <div className="rounded-lg border border-dashed bg-muted/40 p-4">
                {paymentMethod === "VA" && (
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      Nomor virtual account simulasi
                    </p>
                    <p className="mt-1 font-mono text-xl font-extrabold tracking-wider">
                      {nomorVirtualAccount(sender.phone)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Bank BCA (simulasi). Tekan tombol bayar untuk menandai
                      pembayaran berhasil secara otomatis.
                    </p>
                  </div>
                )}

                {paymentMethod === "EWALLET" && (
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      Dompet digital simulasi
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      GoPay · OVO · DANA
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Pembayaran e-wallet disimulasikan sebagai berhasil saat
                      kamu menekan tombol bayar.
                    </p>
                  </div>
                )}

                {paymentMethod === "QRIS" && (
                  <div className="flex items-center gap-4">
                    <QrSimulasi
                      value={`QRIS-${quote.total}-${sender.phone}`}
                      className="size-28 shrink-0 text-primary"
                    />
                    <div>
                      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                        QRIS simulasi
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        Pindai dengan aplikasi pembayaran
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Kode ini hanya ilustrasi dan tidak bisa dipakai untuk
                        transaksi nyata.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === "COD" && (
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      Bayar di tempat
                    </p>
                    <p className="mt-1 text-xl font-extrabold">
                      {rupiah(quote.total)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Siapkan uang tunai sejumlah total pesanan saat kurir
                      menyerahkan paket. Resi tetap dibuat sekarang.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Ringkasan pesanan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{asal}</span>
                <span aria-hidden="true" className="text-muted-foreground">
                  →
                </span>
                <span className="truncate">{tujuan}</span>
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {sender.name || "Pengirim"} → {receiver.name || "Penerima"}
              </p>
            </div>

            <dl className="grid gap-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Layanan</dt>
                <dd className="text-right font-semibold">
                  {layananTerpilih}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Berat tertagih</dt>
                <dd className="text-right font-semibold">
                  {angka(quote.chargeableWeightKg)} kg
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Estimasi tiba</dt>
                <dd className="text-right font-semibold">{quote.estimate}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Biaya kirim</dt>
                <dd className="text-right font-semibold">
                  {rupiah(quote.shippingCost)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Asuransi</dt>
                <dd className="text-right font-semibold">
                  {quote.insuranceFee > 0
                    ? rupiah(quote.insuranceFee)
                    : "Tidak dipilih"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Pengantaran</dt>
                <dd className="text-right font-semibold">
                  {DELIVERY_LABEL[deliveryMethod]}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Pembayaran</dt>
                <dd className="text-right font-semibold">
                  {PAYMENT_LABEL[paymentMethod]}
                </dd>
              </div>
            </dl>

            <Separator />

            <div className="flex items-end justify-between gap-3">
              <span className="text-sm font-bold">Total</span>
              <span className="text-2xl font-extrabold tracking-tight">
                {rupiah(quote.total)}
              </span>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-800"
              >
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {errorMessage}
              </p>
            )}

            <Button
              type="button"
              size="lg"
              onClick={() => void bayar()}
              disabled={
                submitting ||
                (deliveryMethod === "DROP_OFF" && !dropBranchId)
              }
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-4" aria-hidden="true" />
              )}
              {submitting
                ? "Memproses…"
                : paymentMethod === "COD"
                  ? "Buat Resi (COD)"
                  : "Bayar & Buat Resi"}
            </Button>

            <p className="text-center text-[0.68rem] leading-relaxed text-muted-foreground">
              Dengan melanjutkan, kamu menyetujui ketentuan demo J&T Express.
              Nomor resi baru akan langsung diterbitkan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
