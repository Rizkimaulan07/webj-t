import { encodeCode128B } from "@/lib/code128"
import { cn } from "@/lib/utils"

interface BarcodeProps {
  value: string
  className?: string
  label?: string
}

export function Barcode({ value, className, label }: BarcodeProps) {
  const { bars, width } = encodeCode128B(value)

  return (
    <svg
      viewBox={`0 0 ${width} 60`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      role="img"
      aria-label={label ?? `Barcode nomor resi ${value}`}
      className={cn("block w-full text-black", className)}
    >
      <rect width={width} height={60} fill="#ffffff" />
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={0}
          width={bar.width}
          height={60}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
