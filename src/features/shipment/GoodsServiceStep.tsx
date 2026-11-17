import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Info,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Weight,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { FormField } from "@/components/shared/FormField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { getTariffs } from "@/lib/api/tariff"
import { angka, rupiah } from "@/lib/format"
import { SERVICE_LABEL } from "@/lib/services"
import { getCityById } from "@/mocks/cities"
import type { TariffInput } from "@/types/tariff"
import { cn } from "@/lib/utils"
import { goodsSchema, type GoodsValues } from "./schemas"
import { useShipmentDraft } from "./useShipmentDraft"

const keAngka = (value: unknown): number => {
  if (value === "" || value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function GoodsServiceStep() {
  const senderCity = useShipmentDraft((state) => state.sender.cityId)
  const receiverCity = useShipmentDraft((state) => state.receiver.cityId)
  const goods = useShipmentDraft((state) => state.goods)
  const quotes = useShipmentDraft((state) => state.quotes)
  const service = useShipmentDraft((state) => state.service)
  const saveGoodsAndQuotes = useShipmentDraft(
    (state) => state.saveGoodsAndQuotes,
  )
  const selectService = useShipmentDraft((state) => state.selectService)
  const setStep = useShipmentDraft((state) => state.setStep)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<GoodsValues>({
    resolver: zodResolver(goodsSchema),
    defaultValues: {
      description: goods.description,
      weightKg: goods.weightKg,
      lengthCm: goods.lengthCm,
      widthCm: goods.widthCm,
      heightCm: goods.heightCm,
      value: goods.value,
      insurance: goods.insurance,
    },
  })

  const hitungTarif = useMutation({
    mutationFn: (input: TariffInput) => getTariffs(input),
  })

  const asal = getCityById(senderCity)
  const tujuan = getCityById(receiverCity)

  const hitung = async (values: GoodsValues) => {
    if (!asal || !tujuan) {
      toast.error("Lengkapi kota asal dan tujuan terlebih dahulu.")
      setStep(asal ? 2 : 1)
      return
    }
    try {
      const options = await hitungTarif.mutateAsync({
        originId: asal.id,
        destinationId: tujuan.id,
        weightKg: values.weightKg,
        lengthCm: values.lengthCm,
        widthCm: values.widthCm,
        heightCm: values.heightCm,
        insurance: values.insurance,
        goodsValue: values.value,
      })
      saveGoodsAndQuotes(values, options)
      reset(values)
      toast.success(
        `${options.length} layanan ditemukan untuk rute ini.`,
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghitung tarif. Coba lagi.",
      )
    }
  }

  const lanjut = () => {
    if (isDirty) {
      toast.info("Hitung ulang tarif karena detail paket sudah berubah.")
      return
    }
    if (!service || quotes.length === 0) {
      toast.info("Hitung tarif dan pilih salah satu layanan dulu.")
      return
    }
    setStep(4)
  }

  const bisaLanjut = Boolean(service) && quotes.length > 0 && !isDirty

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
              <Package className="size-5" aria-hidden="true" />
            </span>
            <div>
              <CardTitle>Detail paket & layanan</CardTitle>
              <CardDescription className="mt-1">
                Masukkan berat dan dimensi. Kami hitung berat tertagih lalu
                tampilkan layanan yang tersedia.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{asal?.name ?? "Kota asal"}</span>
            <span aria-hidden="true" className="text-muted-foreground">
              →
            </span>
            <span className="truncate">{tujuan?.name ?? "Kota tujuan"}</span>
          </div>

          <form onSubmit={handleSubmit(hitung)} className="grid gap-4" noValidate>
            <FormField
              id="paket-deskripsi"
              label="Isi paket"
              error={errors.description?.message}
              hint="Misalnya Pakaian, Dokumen, atau Elektronik."
            >
              <Textarea
                id="paket-deskripsi"
                rows={2}
                placeholder="Jelaskan isi paket secara singkat"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? "paket-deskripsi-error"
                    : "paket-deskripsi-hint"
                }
                {...register("description")}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <FormField
                id="paket-berat"
                label="Berat aktual (kg)"
                error={errors.weightKg?.message}
              >
                <Input
                  id="paket-berat"
                  type="number"
                  inputMode="decimal"
                  min={0.1}
                  step="0.1"
                  placeholder="1"
                  aria-invalid={Boolean(errors.weightKg)}
                  aria-describedby={
                    errors.weightKg ? "paket-berat-error" : undefined
                  }
                  {...register("weightKg", { setValueAs: keAngka })}
                />
              </FormField>

              <fieldset className="grid gap-2">
                <legend className="mb-1 text-sm font-semibold">
                  Dimensi paket (cm)
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    opsional
                  </span>
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["lengthCm", "Panjang", "paket-panjang"],
                      ["widthCm", "Lebar", "paket-lebar"],
                      ["heightCm", "Tinggi", "paket-tinggi"],
                    ] as const
                  ).map(([name, label, id]) => (
                    <div key={id} className="grid gap-1.5">
                      <label
                        htmlFor={id}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {label}
                      </label>
                      <Input
                        id={id}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        aria-label={`${label} paket dalam sentimeter`}
                        aria-invalid={Boolean(errors[name])}
                        {...register(name, { setValueAs: keAngka })}
                      />
                    </div>
                  ))}
                </div>
                {(errors.lengthCm || errors.widthCm || errors.heightCm) && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {errors.lengthCm?.message ??
                      errors.widthCm?.message ??
                      errors.heightCm?.message}
                  </p>
                )}
              </fieldset>
            </div>

            <div className="rounded-lg border bg-muted/40 p-3.5">
              <div className="flex items-start gap-3">
                <Controller
                  control={control}
                  name="insurance"
                  render={({ field }) => (
                    <Checkbox
                      id="paket-asuransi"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <div className="grid gap-1">
                  <label
                    htmlFor="paket-asuransi"
                    className="inline-flex min-h-11 items-center text-sm font-semibold"
                  >
                    Tambahkan asuransi pengiriman
                  </label>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Biaya 0,2% dari nilai barang + Rp 5.000. Melindungi paket
                    dari kehilangan atau kerusakan.
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <FormField
                  id="paket-nilai"
                  label="Nilai barang (Rp)"
                  error={errors.value?.message}
                  hint="Isi perkiraan harga barang yang dikirim."
                >
                  <Input
                    id="paket-nilai"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step="1000"
                    placeholder="0"
                    aria-invalid={Boolean(errors.value)}
                    aria-describedby={
                      errors.value
                        ? "paket-nilai-error"
                        : "paket-nilai-hint"
                    }
                    {...register("value", { setValueAs: keAngka })}
                  />
                </FormField>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={hitungTarif.isPending}
            >
              {hitungTarif.isPending ? (
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Calculator className="size-4" aria-hidden="true" />
              )}
              {hitungTarif.isPending
                ? "Menghitung tarif…"
                : "Hitung Tarif"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pilih layanan pengiriman</CardTitle>
          <CardDescription aria-live="polite">
            {isDirty && quotes.length > 0
              ? "Detail paket berubah. Hitung ulang tarif untuk memperbarui pilihan."
              : quotes.length > 0
                ? `${quotes.length} layanan tersedia, diurutkan dari yang termurah.`
                : "Hitung tarif untuk melihat layanan yang tersedia."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hitungTarif.isPending && (
            <div className="grid gap-3" aria-busy="true">
              <span className="sr-only">Menghitung tarif…</span>
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!hitungTarif.isPending && quotes.length === 0 && (
            <EmptyState
              icon={Package}
              title="Belum ada layanan dipilih"
              description="Lengkapi detail paket di atas, lalu tekan Hitung Tarif untuk melihat estimasi biaya dan waktu tiba."
              className="px-4 py-8"
            />
          )}

          {!hitungTarif.isPending && quotes.length > 0 && !isDirty && (
            <RadioGroup
              value={service ?? ""}
              onValueChange={(value) => {
                const option = quotes.find(
                  (quote) => quote.service === value,
                )
                if (option) selectService(option.service)
              }}
              className="gap-2"
              aria-label="Pilihan layanan pengiriman"
            >
              {quotes.map((option, index) => {
                const selected = option.service === service
                return (
                  <div
                    key={option.service}
                    className={cn(
                      "relative rounded-xl border bg-card p-4 pl-12 transition-colors",
                      selected
                        ? "border-primary bg-secondary/40"
                        : "hover:border-primary/30",
                    )}
                  >
                    <RadioGroupItem
                      id={`paket-layanan-${option.service}`}
                      value={option.service}
                      className="absolute top-4 left-4"
                    />
                    <label
                      htmlFor={`paket-layanan-${option.service}`}
                      className="block cursor-pointer"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold">
                              {option.name}
                            </span>
                            <Badge variant="secondary">
                              {option.estimate}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="accent">Termurah</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-extrabold">
                            {rupiah(option.total)}
                          </p>
                          <p className="text-[0.68rem] text-muted-foreground">
                            {angka(option.chargeableWeightKg)} kg tertagih
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Weight className="size-3.5" aria-hidden="true" />
                          {rupiah(option.shippingCost)} ongkir
                        </span>
                        {option.insuranceFee > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            Asuransi {rupiah(option.insuranceFee)}
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                )
              })}
            </RadioGroup>
          )}

          {!hitungTarif.isPending && quotes.length > 0 && !isDirty && (
            <p className="mt-4 flex items-start gap-2 rounded-md bg-secondary px-3 py-2.5 text-xs leading-relaxed text-secondary-foreground">
              <Info
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                Berat tertagih memakai nilai terbesar antara berat aktual dan
                volumetrik (P × L × T ÷ 6.000). Same Day hanya muncul untuk
                rute dalam satu kota.
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={() => setStep(2)}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali
        </Button>
        <Button
          type="button"
          onClick={lanjut}
          disabled={!bisaLanjut || hitungTarif.isPending}
        >
          Lanjut ke pembayaran
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {service && (
        <p className="text-center text-xs text-muted-foreground">
          Layanan terpilih:{" "}
          <span className="font-bold text-foreground">
            {SERVICE_LABEL[service]}
          </span>
        </p>
      )}
    </div>
  )
}
