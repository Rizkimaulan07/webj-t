import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  icon?: LucideIcon
  children?: ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-primary/10 bg-[#fff7f7]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-24 right-[-4rem] size-72 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(214 0 28 / 0.16) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />
      <div className="page-container relative py-9 sm:py-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1.5 text-xs font-extrabold tracking-[0.12em] text-primary uppercase shadow-xs">
          {Icon && <Icon className="size-3.5" aria-hidden="true" />}
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl leading-[1.08] font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}
