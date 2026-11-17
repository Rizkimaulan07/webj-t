import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, MapPin, Plus, UserRound } from "lucide-react"

import { FormField } from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { AddressFormDialog } from "@/features/address/AddressFormDialog"
import { AddressPicker } from "@/features/address/AddressPicker"
import { useAddresses } from "@/features/address/useAddressBook"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { CityCombobox } from "@/features/tariff/CityCombobox"
import type { SavedAddress } from "@/types/user"
import {
  normalisasiTelepon,
  partySchema,
  type PartyValues,
} from "./schemas"
import { useShipmentDraft, type ShipmentRole } from "./useShipmentDraft"

interface PartyStepProps {
  role: ShipmentRole
}

const COPY = {
  sender: {
    title: "Data pengirim",
    description:
      "Alamat asal paket. Kurir akan menjemput di alamat ini jika memilih layanan jemput.",
    icon: UserRound,
  },
  receiver: {
    title: "Data penerima",
    description:
      "Pastikan nama dan alamat penerima lengkap agar paket sampai tanpa kendala.",
    icon: MapPin,
  },
} as const

export function PartyStep({ role }: PartyStepProps) {
  const user = useAuthStore((state) => state.user)
  const party = useShipmentDraft((state) => state[role])
  const saveParty = useShipmentDraft((state) => state.saveParty)
  const setStep = useShipmentDraft((state) => state.setStep)
  const { data: addresses, isPending: addressesLoading } = useAddresses(
    user?.id,
  )
  const [pickedId, setPickedId] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartyValues>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: party.name,
      phone: party.phone,
      address: party.address,
      cityId: party.cityId,
      postalCode: party.postalCode,
    },
  })

  const copy = COPY[role]
  const Icon = copy.icon

  const pakaiAlamat = (address: SavedAddress) => {
    setPickedId(address.id)
    reset({
      name: address.name,
      phone: address.phone,
      address: address.address,
      cityId: address.cityId,
      postalCode: address.postalCode,
    })
  }

  const submit = (values: PartyValues) => {
    saveParty(role, {
      ...values,
      phone: normalisasiTelepon(values.phone),
    })
    setStep(role === "sender" ? 2 : 3)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription className="mt-1">
              {copy.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <AddressPicker
          addresses={addresses}
          isLoading={addressesLoading}
          selectedId={pickedId}
          onSelect={pakaiAlamat}
          action={
            user ? (
              <AddressFormDialog
                userId={user.id}
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="size-4" aria-hidden="true" />
                    Alamat baru
                  </Button>
                }
                onSaved={pakaiAlamat}
              />
            ) : undefined
          }
        />

        <Separator />

        <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id={`${role}-nama`}
              label={role === "sender" ? "Nama pengirim" : "Nama penerima"}
              error={errors.name?.message}
            >
              <Input
                id={`${role}-nama`}
                autoComplete={role === "sender" ? "name" : "shipping name"}
                placeholder="Nama lengkap"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? `${role}-nama-error` : undefined
                }
                {...register("name")}
              />
            </FormField>
            <FormField
              id={`${role}-telepon`}
              label="Nomor HP"
              error={errors.phone?.message}
            >
              <Input
                id={`${role}-telepon`}
                type="tel"
                inputMode="tel"
                autoComplete={role === "sender" ? "tel" : "tel"}
                placeholder="08123456789"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                  errors.phone ? `${role}-telepon-error` : undefined
                }
                {...register("phone")}
              />
            </FormField>
          </div>

          <FormField
            id={`${role}-alamat`}
            label="Alamat lengkap"
            error={errors.address?.message}
            hint="Sertakan nama jalan, nomor rumah, RT/RW, dan kelurahan."
          >
            <Textarea
              id={`${role}-alamat`}
              autoComplete="street-address"
              placeholder="Jl. Contoh No. 10, RT 01/RW 02, Kelurahan…"
              aria-invalid={Boolean(errors.address)}
              aria-describedby={
                errors.address ? `${role}-alamat-error` : `${role}-alamat-hint`
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
                  id={`${role}-kota`}
                  label="Kota"
                  error={errors.cityId?.message}
                >
                  <CityCombobox
                    id={`${role}-kota`}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Cari kota…"
                    invalid={Boolean(errors.cityId)}
                    describedBy={
                      errors.cityId ? `${role}-kota-error` : undefined
                    }
                  />
                </FormField>
              )}
            />
            <FormField
              id={`${role}-kodepos`}
              label="Kode pos"
              error={errors.postalCode?.message}
            >
              <Input
                id={`${role}-kodepos`}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                placeholder="40131"
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={
                  errors.postalCode ? `${role}-kodepos-error` : undefined
                }
                {...register("postalCode")}
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
            {role === "receiver" ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit">
              {role === "sender" ? "Lanjut ke penerima" : "Lanjut ke paket"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
