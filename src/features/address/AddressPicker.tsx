import type { ReactNode } from "react"
import { Check, MapPin } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getCityName } from "@/mocks/cities"
import type { SavedAddress } from "@/types/user"

interface AddressPickerProps {
  addresses: SavedAddress[] | undefined
  isLoading: boolean
  selectedId: string | null
  onSelect: (address: SavedAddress) => void
  action?: ReactNode
}

export function AddressPicker({
  addresses,
  isLoading,
  selectedId,
  onSelect,
  action,
}: AddressPickerProps) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">Gunakan alamat tersimpan</h3>
        {action}
      </div>

      {isLoading && (
        <div className="grid gap-2 sm:grid-cols-2" aria-busy="true">
          <span className="sr-only">Memuat buku alamat…</span>
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (!addresses || addresses.length === 0) && (
        <p className="rounded-lg border border-dashed bg-muted/40 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
          Belum ada alamat tersimpan. Isi formulir di bawah, atau tambahkan
          alamat ke buku alamat untuk dipakai lagi nanti.
        </p>
      )}

      {!isLoading && addresses && addresses.length > 0 && (
        <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {addresses.map((address) => {
            const selected = address.id === selectedId
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelect(address)}
                aria-pressed={selected}
                className={cn(
                  "relative rounded-lg border bg-card p-3 pr-8 text-left transition-colors hover:border-primary/40 hover:bg-secondary/40",
                  selected && "border-primary bg-secondary/60",
                )}
              >
                {selected && (
                  <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
                <span className="block text-[0.68rem] font-bold tracking-wide text-accent-foreground uppercase">
                  {address.label}
                </span>
                <span className="mt-0.5 block truncate text-sm font-bold">
                  {address.name}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                  {address.address}, {getCityName(address.cityId)}{" "}
                  {address.postalCode}
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" aria-hidden="true" />
                  {address.phone}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
