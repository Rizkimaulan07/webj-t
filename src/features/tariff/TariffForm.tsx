import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator, Loader2 } from "lucide-react"
import { z } from "zod"

import { FormField } from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { TariffInput } from "@/types/tariff"
import { CityCombobox } from "./CityCombobox"

const keAngka = (value: unknown): number => {
  if (value === "" || value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const tarifSchema = z
  .object({
    originId: z.string().min(1, "Pilih kota asal."),
    destinationId: z.string().min(1, "Pilih kota tujuan."),
    weightKg: z
      .number()
      .positive("Berat harus lebih dari 0 kg.")
      .max(1_000, "Maksimal 1.000 kg per pengiriman."),
    lengthCm: z
      .number()
      .min(0, "Dimensi tidak boleh negatif.")
      .max(500, "Maksimal 500 cm."),
    widthCm: z
      .number()
      .min(0, "Dimensi tidak boleh negatif.")
      .max(500, "Maksimal 500 cm."),
    heightCm: z
      .number()
      .min(0, "Dimensi tidak boleh negatif.")
      .max(500, "Maksimal 500 cm."),
    insurance: z.boolean(),
    goodsValue: z
      .number()
      .min(0, "Nilai barang tidak boleh negatif.")
      .max(1_000_000_000, "Nilai barang terlalu besar."),
  })
  .superRefine((data, ctx) => {
    if (data.insurance && data.goodsValue <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["goodsValue"],
        message: "Isi nilai barang jika memilih asuransi.",
      })
    }
  })

type TarifFormValues = z.infer<typeof tarifSchema>

interface TariffFormProps {
  initial?: Partial<TariffInput>
  isCalculating?: boolean
  onSubmit: (input: TariffInput) => void
}

export function TariffForm({
  initial,
  isCalculating,
  onSubmit,
}: TariffFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TarifFormValues>({
    resolver: zodResolver(tarifSchema),
    defaultValues: {
      originId: initial?.originId ?? "",
      destinationId: initial?.destinationId ?? "",
      weightKg: initial?.weightKg ?? 1,
      lengthCm: initial?.lengthCm ?? 0,
      widthCm: initial?.widthCm ?? 0,
      heightCm: initial?.heightCm ?? 0,
      insurance: initial?.insurance ?? false,
      goodsValue: initial?.goodsValue ?? 0,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="originId"
          render={({ field }) => (
            <FormField
              id="tarif-asal"
              label="Kota asal"
              error={errors.originId?.message}
            >
              <CityCombobox
                id="tarif-asal"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Cari kota asal…"
                invalid={Boolean(errors.originId)}
                describedBy={
                  errors.originId ? "tarif-asal-error" : undefined
                }
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="destinationId"
          render={({ field }) => (
            <FormField
              id="tarif-tujuan"
              label="Kota tujuan"
              error={errors.destinationId?.message}
            >
              <CityCombobox
                id="tarif-tujuan"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Cari kota tujuan…"
                invalid={Boolean(errors.destinationId)}
                describedBy={
                  errors.destinationId ? "tarif-tujuan-error" : undefined
                }
              />
            </FormField>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <FormField
          id="tarif-berat"
          label="Berat aktual (kg)"
          error={errors.weightKg?.message}
        >
          <Input
            id="tarif-berat"
            type="number"
            inputMode="decimal"
            min={0.1}
            step="0.1"
            placeholder="1"
            aria-invalid={Boolean(errors.weightKg)}
            aria-describedby={
              errors.weightKg ? "tarif-berat-error" : "tarif-berat-hint"
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
            <div className="grid gap-1.5">
              <label
                htmlFor="tarif-panjang"
                className="text-xs font-medium text-muted-foreground"
              >
                Panjang
              </label>
              <Input
                id="tarif-panjang"
                type="number"
                inputMode="numeric"
                min={0}
                aria-label="Panjang paket dalam sentimeter"
                aria-invalid={Boolean(errors.lengthCm)}
                {...register("lengthCm", { setValueAs: keAngka })}
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="tarif-lebar"
                className="text-xs font-medium text-muted-foreground"
              >
                Lebar
              </label>
              <Input
                id="tarif-lebar"
                type="number"
                inputMode="numeric"
                min={0}
                aria-label="Lebar paket dalam sentimeter"
                aria-invalid={Boolean(errors.widthCm)}
                {...register("widthCm", { setValueAs: keAngka })}
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="tarif-tinggi"
                className="text-xs font-medium text-muted-foreground"
              >
                Tinggi
              </label>
              <Input
                id="tarif-tinggi"
                type="number"
                inputMode="numeric"
                min={0}
                aria-label="Tinggi paket dalam sentimeter"
                aria-invalid={Boolean(errors.heightCm)}
                {...register("heightCm", { setValueAs: keAngka })}
              />
            </div>
          </div>
          {(errors.lengthCm || errors.widthCm || errors.heightCm) && (
            <p role="alert" className="text-xs font-medium text-destructive">
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
                id="tarif-asuransi"
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
              htmlFor="tarif-asuransi"
              className="inline-flex min-h-11 items-center text-sm font-semibold"
            >
              Tambahkan asuransi pengiriman
            </label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Biaya 0,2% dari nilai barang + Rp 5.000. Melindungi paket dari
              kehilangan atau kerusakan.
            </p>
          </div>
        </div>
        <div className="mt-3">
          <FormField
            id="tarif-nilai-barang"
            label="Nilai barang (Rp)"
            error={errors.goodsValue?.message}
            hint="Isi perkiraan harga barang yang dikirim."
          >
            <Input
              id="tarif-nilai-barang"
              type="number"
              inputMode="numeric"
              min={0}
              step="1000"
              placeholder="0"
              aria-invalid={Boolean(errors.goodsValue)}
              aria-describedby={
                errors.goodsValue
                  ? "tarif-nilai-barang-error"
                  : "tarif-nilai-barang-hint"
              }
              {...register("goodsValue", { setValueAs: keAngka })}
            />
          </FormField>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isCalculating}>
        {isCalculating ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Calculator className="size-4" aria-hidden="true" />
        )}
        {isCalculating ? "Menghitung…" : "Hitung Tarif"}
      </Button>
    </form>
  )
}
