import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-xs transition-[border-color,box-shadow] outline-none",
        "placeholder:font-normal placeholder:text-muted-foreground/80",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
        "file:mr-2 file:h-8 file:rounded-sm file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-semibold file:text-secondary-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
