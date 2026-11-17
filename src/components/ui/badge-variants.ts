import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-card text-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        brand: "border-transparent bg-primary text-primary-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-800",
        warning: "border-transparent bg-amber-100 text-amber-900",
        info: "border-transparent bg-blue-100 text-blue-900",
        destructive: "border-transparent bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]
