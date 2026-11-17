import { useEffect, useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormField } from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DEMO_TRACKING_CODES } from "@/mocks/shipments"
import { cn } from "@/lib/utils"
import { TrackingResult } from "./TrackingResult"

const trackingSchema = z.object({
  awb: z
    .string()
    .trim()
    .min(6, "Nomor resi minimal 6 karakter.")
    .max(24, "Nomor resi terlalu panjang.")
    .regex(/^[A-Za-z0-9]+$/, "Nomor resi hanya berisi huruf dan angka."),
})

type TrackingFormValues = z.infer<typeof trackingSchema>

interface TrackingPanelProps {
  awb: string | null
  onSearch: (awb: string) => void
  className?: string
}

export function TrackingPanel({ awb, onSearch, className }: TrackingPanelProps) {
  const fieldId = useId()
  const awbId = `${fieldId}-awb`
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { awb: awb ?? "" },
  })

  useEffect(() => {
    if (awb) setValue("awb", awb)
  }, [awb, setValue])

  const submit = (values: TrackingFormValues) => {
    const kode = values.awb.trim().toUpperCase()
    setValue("awb", kode)
    onSearch(kode)
  }

  const cariDemo = () => {
    const kode = DEMO_TRACKING_CODES.inTransit
    setValue("awb", kode)
    onSearch(kode)
  }

  return (
    <div className={cn("grid gap-4", className)}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-3" noValidate>
        <FormField
          id={awbId}
          label="Nomor resi"
          error={errors.awb?.message}
          hint="Huruf dan angka, tanpa spasi. Contoh: LJX1234567890"
        >
          <Input
            id={awbId}
            autoComplete="off"
            inputMode="text"
            placeholder="LJX1234567890"
            className="h-12 text-base font-semibold tracking-wide uppercase"
            aria-invalid={Boolean(errors.awb)}
            aria-describedby={
              errors.awb ? `${awbId}-error` : `${awbId}-hint`
            }
            {...register("awb")}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={cariDemo}
            className="inline-flex min-h-11 items-center justify-center rounded-md px-2 text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-primary/80"
          >
            Coba resi demo
          </button>
          <Button type="submit" className="w-full sm:w-auto sm:min-w-32">
            <Search className="size-4" aria-hidden="true" />
            Lacak Paket
          </Button>
        </div>
      </form>

      <div aria-live="polite" aria-atomic="false">
        {awb && <TrackingResult awb={awb} onTryDemo={cariDemo} />}
      </div>
    </div>
  )
}
