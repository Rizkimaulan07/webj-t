import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  asLink?: boolean
  tone?: "brand" | "light" | "dark"
}

const TONE = {
  brand: "text-primary",
  light: "text-white",
  dark: "text-foreground",
} as const

const LOGO_MASK_STYLE = {
  aspectRatio: "142 / 31",
  maskImage: 'url("/jnt-express-logo.png")',
  maskPosition: "center",
  maskRepeat: "no-repeat",
  maskSize: "contain",
  WebkitMaskImage: 'url("/jnt-express-logo.png")',
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
} as const

export function Logo({
  className,
  asLink = true,
  tone = "brand",
}: LogoProps) {
  const mark = (
    <span
      className={cn(
        "inline-block h-10 shrink-0 bg-current",
        TONE[tone],
        className,
      )}
      style={LOGO_MASK_STYLE}
      aria-hidden={asLink || undefined}
      role={asLink ? undefined : "img"}
      aria-label={asLink ? undefined : "J&T Express"}
    />
  )

  if (!asLink) return mark

  return (
    <Link
      to="/"
      aria-label="J&T Express — ke beranda"
      className="inline-flex min-h-11 items-center rounded-md transition-opacity hover:opacity-85"
    >
      {mark}
    </Link>
  )
}
