import { useId, useRef, useState, type KeyboardEvent } from "react"
import { ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { useCities } from "./useCities"

interface CityComboboxProps {
  id: string
  value: string
  onChange: (cityId: string) => void
  onBlur?: () => void
  placeholder?: string
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

export function CityCombobox({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Ketik nama kota…",
  invalid,
  describedBy,
  disabled,
}: CityComboboxProps) {
  const cities = useCities()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selected = cities.find((city) => city.id === value)
  const [query, setQuery] = useState(selected?.name ?? "")
  const [syncedValue, setSyncedValue] = useState(value)
  if (value !== syncedValue) {
    setSyncedValue(value)
    if (value) {
      setQuery(cities.find((city) => city.id === value)?.name ?? "")
    }
  }

  const isShowingSelected = selected && query.trim() === selected.name
  const normalized = query.trim().toLowerCase()
  const filtered =
    !normalized || isShowingSelected
      ? cities
      : cities.filter((city) =>
          `${city.name} ${city.province}`.toLowerCase().includes(normalized),
        )

  const pilihKota = (cityId: string) => {
    const city = cities.find((item) => item.id === cityId)
    onChange(cityId)
    setQuery(city?.name ?? "")
    setOpen(false)
    onBlur?.()
  }

  const tutup = () => {
    setOpen(false)
    setQuery(selected?.name ?? "")
    onBlur?.()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        event.preventDefault()
        pilihKota(filtered[activeIndex].id)
      } else {
        setOpen(true)
      }
    } else if (event.key === "Escape") {
      setOpen(false)
      setQuery(selected?.name ?? "")
    }
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        disabled={disabled}
        value={query}
        placeholder={placeholder}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex]
            ? `${listId}-${filtered[activeIndex].id}`
            : undefined
        }
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onFocus={() => {
          setOpen(true)
          const index = filtered.findIndex((city) => city.id === value)
          setActiveIndex(index >= 0 ? index : 0)
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActiveIndex(0)
          if (value) onChange("")
        }}
        onKeyDown={handleKeyDown}
        onBlur={tutup}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-card py-2 pr-12 pl-9 text-sm font-medium shadow-xs transition-[border-color,box-shadow] outline-none",
          "placeholder:font-normal placeholder:text-muted-foreground/80",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
          "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? "Tutup daftar kota" : "Buka daftar kota"}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setOpen((state) => !state)
          inputRef.current?.focus()
        }}
        className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary"
      >
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Daftar kota"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-lift"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-3 text-sm text-muted-foreground">
              Kota tidak ditemukan. Coba kata kunci lain.
            </li>
          )}
          {filtered.map((city, index) => (
            <li
              key={city.id}
              id={`${listId}-${city.id}`}
              role="option"
              aria-selected={city.id === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pilihKota(city.id)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm",
                index === activeIndex && "bg-secondary",
                city.id === value && "font-bold",
              )}
            >
              <span>{city.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {city.province}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
