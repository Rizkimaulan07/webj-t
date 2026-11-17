import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator } from "lucide-react"
import { z } from "zod"

import { FormField } from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TariffInput } from "@/types/tariff"
import { CityCombobox } from "./CityCombobox"

const quickSchema = z.object({
  originId: z.string().min(1, "Pilih kota asal."),
  destinationId: z.string().min(1, "Pilih kota tujuan."),
  weightKg: z
    .number()
    .positive("Berat harus lebih dari 0 kg.")
    .max(1_000, "Maksimal 1.000 kg."),
})

type QuickFormValues = z.infer<typeof quickSchema>

interface QuickTariffFormProps {
  onSubmit: (input: Pick<TariffInput, "originId" | "destinationId" | "weightKg">) => void
}

const keAngka = (value: unknown): number => {
  if (value === "" || value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function QuickTariffForm({ onSubmit }: QuickTariffFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickFormValues>({
    resolver: zodResolver(quickSchema),
    defaultValues: { originId: "", destinationId: "", weightKg: 1 },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="originId"
          render={({ field }) => (
            <FormField
              id="quick-asal"
              label="Kota asal"
              error={errors.originId?.message}
            >
              <CityCombobox
                id="quick-asal"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Cari kota asal…"
                invalid={Boolean(errors.originId)}
                describedBy={
                  errors.originId ? "quick-asal-error" : undefined
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
              id="quick-tujuan"
              label="Kota tujuan"
              error={errors.destinationId?.message}
            >
              <CityCombobox
                id="quick-tujuan"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Cari kota tujuan…"
                invalid={Boolean(errors.destinationId)}
                describedBy={
                  errors.destinationId ? "quick-tujuan-error" : undefined
                }
              />
            </FormField>
          )}
        />
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <FormField
          id="quick-berat"
          label="Berat (kg)"
          error={errors.weightKg?.message}
        >
          <Input
            id="quick-berat"
            type="number"
            inputMode="decimal"
            min={0.1}
            step="0.1"
            placeholder="1"
            aria-invalid={Boolean(errors.weightKg)}
            aria-describedby={
              errors.weightKg ? "quick-berat-error" : undefined
            }
            {...register("weightKg", { setValueAs: keAngka })}
          />
        </FormField>
        <Button type="submit" variant="accent" className="w-full sm:w-auto">
          <Calculator className="size-4" aria-hidden="true" />
          Cek Tarif
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Hasil lengkap bisa disesuaikan dengan dimensi dan asuransi di halaman
        tarif.
      </p>
    </form>
  )
}
