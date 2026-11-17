import { useMemo } from "react"

import { cn } from "@/lib/utils"

interface QrSimulasiProps {
  value: string
  className?: string
}

const SIZE = 21
const FINDER_POSITIONS = [
  [0, 0],
  [0, SIZE - 7],
  [SIZE - 7, 0],
] as const

function dalamFinder(row: number, col: number): boolean {
  return FINDER_POSITIONS.some(
    ([top, left]) =>
      row >= top && row < top + 7 && col >= left && col < left + 7,
  )
}

function finderTerisi(row: number, col: number): boolean {
  const posisi = FINDER_POSITIONS.find(
    ([top, left]) =>
      row >= top && row < top + 7 && col >= left && col < left + 7,
  )
  if (!posisi) return false
  const r = row - posisi[0]
  const c = col - posisi[1]
  if (r === 0 || r === 6 || c === 0 || c === 6) return true
  return r >= 2 && r <= 4 && c >= 2 && c <= 4
}

function nilaiSeed(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

export function QrSimulasi({ value, className }: QrSimulasiProps) {
  const sel = useMemo(() => {
    const seed = nilaiSeed(value)
    const cells: Array<{ row: number; col: number }> = []
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (dalamFinder(row, col)) {
          if (finderTerisi(row, col)) cells.push({ row, col })
          continue
        }
        const campuran =
          (seed + row * 928371 + col * 364479 + row * col * 17) % 7
        if (campuran < 3) cells.push({ row, col })
      }
    }
    return cells
  }, [value])

  return (
    <svg
      viewBox={`0 0 ${SIZE + 2} ${SIZE + 2}`}
      className={cn("size-40", className)}
      role="img"
      aria-label="Kode QRIS simulasi, bukan kode pembayaran asli"
      shapeRendering="crispEdges"
    >
      <rect width={SIZE + 2} height={SIZE + 2} fill="#ffffff" />
      <g transform="translate(1 1)">
        {sel.map((cell) => (
          <rect
            key={`${cell.row}-${cell.col}`}
            x={cell.col}
            y={cell.row}
            width={1}
            height={1}
            fill="currentColor"
          />
        ))}
      </g>
    </svg>
  )
}
