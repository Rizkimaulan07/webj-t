import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"

import { FormField } from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CityCombobox } from "@/features/tariff/CityCombobox"
import type { AddressInput, SavedAddress } from "@/types/user"
import {
  addressSchema,
  normalisasiTelepon,
  type AddressValues,
} from "@/features/shipment/schemas"

interface AddressFormProps {
  initial?: SavedAddress
  pending: boolean
  submitLabel: string
  onSubmit: (values: AddressInput) => void
  onCancel?: () => void
}

export function AddressForm({
  initial,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initial?.label ?? "",
      name: initial?.name ?? "",
      phone: initial?.phone ?? "",
      address: initial?.address ?? "",
      cityId: initial?.cityId ?? "",
      postalCode: initial?.postalCode ?? "",
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          ...values,
          phone: normalisasiTelepon(values.phone),
        }),
      )}
      className="grid gap-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="alamat-label"
          label="Label alamat"
          error={errors.label?.message}
          hint="Misalnya Rumah, Kantor, atau Gudang."
        >
          <Input
            id="alamat-label"
            placeholder="Rumah"
            aria-invalid={Boolean(errors.label)}
            aria-describedby={
              errors.label ? "alamat-label-error" : "alamat-label-hint"
            }
            {...register("label")}
          />
        </FormField>
        <FormField
          id="alamat-nama"
          label="Nama lengkap"
          error={errors.name?.message}
        >
          <Input
            id="alamat-nama"
            autoComplete="name"
            placeholder="Nama penerima atau pengirim"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name ? "alamat-nama-error" : undefined
            }
            {...register("name")}
          />
        </FormField>
      </div>

      <FormField
        id="alamat-telepon"
        label="Nomor HP"
        error={errors.phone?.message}
      >
        <Input
          id="alamat-telepon"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="08123456789"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={
            errors.phone ? "alamat-telepon-error" : undefined
          }
          {...register("phone")}
        />
      </FormField>

      <FormField
        id="alamat-lengkap"
        label="Alamat lengkap"
        error={errors.address?.message}
        hint="Sertakan nama jalan, nomor rumah, RT/RW, dan kelurahan."
      >
        <Textarea
          id="alamat-lengkap"
          autoComplete="street-address"
          placeholder="Jl. Contoh No. 10, RT 01/RW 02, Kelurahan…"
          aria-invalid={Boolean(errors.address)}
          aria-describedby={
            errors.address ? "alamat-lengkap-error" : "alamat-lengkap-hint"
          }
          {...register("address")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="cityId"
          render={({ field }) => (
            <FormField
              id="alamat-kota"
              label="Kota"
              error={errors.cityId?.message}
            >
              <CityCombobox
                id="alamat-kota"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Cari kota…"
                invalid={Boolean(errors.cityId)}
                describedBy={
                  errors.cityId ? "alamat-kota-error" : undefined
                }
              />
            </FormField>
          )}
        />
        <FormField
          id="alamat-kodepos"
          label="Kode pos"
          error={errors.postalCode?.message}
        >
          <Input
            id="alamat-kodepos"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="40131"
            aria-invalid={Boolean(errors.postalCode)}
            aria-describedby={
              errors.postalCode ? "alamat-kodepos-error" : undefined
            }
            {...register("postalCode")}
          />
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
