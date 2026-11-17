import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { SHIPMENT_STEPS } from "./steps"

interface ShipmentStepperProps {
  step: number
  onStepClick: (step: number) => void
}

export function ShipmentStepper({ step, onStepClick }: ShipmentStepperProps) {
  const current = SHIPMENT_STEPS.find((item) => item.id === step)
  const progress = (step / SHIPMENT_STEPS.length) * 100

  return (
    <nav aria-label="Langkah pembuatan pengiriman" className="grid gap-3">
      <div>
        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
          <span>Langkah {step} dari {SHIPMENT_STEPS.length}</span>
          <span className="text-muted-foreground">{current?.title}</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={SHIPMENT_STEPS.length}
          aria-valuenow={step}
          aria-label={`Progres pembuatan pengiriman: langkah ${step} dari ${SHIPMENT_STEPS.length}`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {SHIPMENT_STEPS.map((item) => {
          const done = item.id < step
          const active = item.id === step
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onStepClick(item.id)}
                disabled={item.id > step}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex min-h-11 w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  active && "border-primary bg-secondary/60",
                  done &&
                    "border-border bg-card hover:border-primary/40 hover:bg-secondary/40",
                  !done && !active && "bg-muted/40 text-muted-foreground",
                  item.id > step && "cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold",
                    active &&
                      "border-primary bg-primary text-primary-foreground",
                    done &&
                      "border-primary/30 bg-primary/10 text-primary",
                    !done && !active && "border-border bg-card",
                  )}
                >
                  {done ? (
                    <Check
                      className="size-3.5"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  ) : (
                    item.id
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs leading-tight font-bold sm:text-sm">
                    {item.title}
                  </span>
                  <span className="mt-0.5 hidden text-[0.68rem] leading-tight text-muted-foreground sm:block">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
