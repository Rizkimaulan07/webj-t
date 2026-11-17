import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FaqItem } from "@/lib/faqs"

interface FaqAccordionProps {
  items: FaqItem[]
  className?: string
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  return (
    <div className={cn("grid gap-2.5", className)}>
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-xl border border-border/80 bg-card shadow-soft transition-colors open:border-primary/25"
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left text-sm font-bold transition-colors hover:text-primary sm:px-5 [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-transform duration-200 group-open:rotate-45">
              <Plus className="size-4" aria-hidden="true" />
            </span>
          </summary>
          <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  )
}
