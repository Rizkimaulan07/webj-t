import { Check, Circle, Truck } from "lucide-react"

import { tanggal } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TrackingEvent } from "@/types/shipment"

interface TrackTimelineProps {
  events: TrackingEvent[]
}

function EventIcon({ event }: { event: TrackingEvent }) {
  if (!event.done) {
    return <Circle className="size-4" aria-hidden="true" />
  }
  const isTransit = /perjalanan|berangkat|tiba|diproses/i.test(event.title)
  if (isTransit) return <Truck className="size-4" aria-hidden="true" />
  return <Check className="size-4" strokeWidth={3} aria-hidden="true" />
}

export function TrackTimeline({ events }: TrackTimelineProps) {
  const selesai = events
    .filter((event) => event.done)
    .sort((a, b) => b.time.localeCompare(a.time))
  const berikutnya = events
    .filter((event) => !event.done)
    .sort((a, b) => a.time.localeCompare(b.time))
  const urut = [...selesai, ...berikutnya]

  if (urut.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada riwayat perjalanan untuk paket ini.
      </p>
    )
  }

  return (
    <ol className="relative space-y-0">
      {urut.map((event, index) => {
        const isLast = index === urut.length - 1
        const active = index === 0 && event.done
        return (
          <li key={`${event.time}-${event.title}`} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                  event.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                  active && "ring-4 ring-accent/25",
                )}
              >
                <EventIcon event={event} />
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "w-px flex-1",
                    event.done ? "bg-primary/25" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className={cn("min-w-0 pb-5", isLast && "pb-0")}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    !event.done && "text-muted-foreground",
                  )}
                >
                  {event.title}
                </p>
                {active && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[0.65rem] font-bold text-accent-foreground">
                    Terbaru
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.location}
                <span aria-hidden="true"> · </span>
                {event.done ? tanggal(event.time) : `Perkiraan ${tanggal(event.time)}`}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
