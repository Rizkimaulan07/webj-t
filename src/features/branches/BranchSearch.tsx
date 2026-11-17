import { useId } from "react"
import { Search, X } from "lucide-react"

interface BranchSearchProps {
  value: string
  onChange: (value: string) => void
}

export function BranchSearch({ value, onChange }: BranchSearchProps) {
  const id = useId()
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        Cari cabang
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Cari kota, alamat, atau nama cabang…"
          className="flex h-12 w-full rounded-md border border-input bg-card py-2 pr-12 pl-10 text-sm font-medium shadow-xs transition-[border-color,box-shadow] outline-none placeholder:font-normal placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Hapus pencarian"
            className="absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
