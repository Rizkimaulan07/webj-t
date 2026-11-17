const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

const angkaFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
})

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const tanggalSingkatFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function rupiah(value: number): string {
  return rupiahFormatter.format(value).replace(/\u00a0/g, " ")
}

export function angka(value: number): string {
  return angkaFormatter.format(value).replace(/\u00a0/g, " ")
}

export function tanggal(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "-"
  return tanggalFormatter.format(date).replace(/\u00a0/g, " ")
}

export function tanggalSingkat(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "-"
  return tanggalSingkatFormatter.format(date)
}

/** Menyamarkan nama penerima, mis. "Budi Santoso" -> "B*** S*****". */
export function samarkanNama(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const first = part.charAt(0).toUpperCase()
      return `${first}${"*".repeat(Math.max(3, part.length - 1))}`
    })
    .join(" ")
}

export function inisialNama(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}
