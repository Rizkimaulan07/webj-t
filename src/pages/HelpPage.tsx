import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Calculator, MapPin, Search } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { FaqAccordion } from "@/features/help/FaqAccordion"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FAQ_CATEGORIES, FAQS } from "@/lib/faqs"
import type { FaqCategory } from "@/lib/faqs"

const quickLinks = [
  {
    title: "Lacak paket",
    description: "Lihat status dan riwayat perjalanan kiriman.",
    to: "/lacak",
    icon: Search,
  },
  {
    title: "Cek tarif",
    description: "Bandingkan layanan dan estimasi biaya kirim.",
    to: "/tarif",
    icon: Calculator,
  },
  {
    title: "Cari cabang",
    description: "Temukan hub, drop point, atau agen terdekat.",
    to: "/cabang",
    icon: MapPin,
  },
]

export function HelpPage() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "Semua">(
    "Semua",
  )
  const normalizedQuery = query.trim().toLocaleLowerCase("id")
  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory =
      activeCategory === "Semua" || faq.category === activeCategory
    const matchesQuery =
      !normalizedQuery ||
      `${faq.question} ${faq.answer}`
        .toLocaleLowerCase("id")
        .includes(normalizedQuery)

    return matchesCategory && matchesQuery
  })

  return (
    <>
      <PageHeader
        eyebrow="Pusat bantuan"
        title="Ada yang bisa kami bantu?"
        description="Cari jawaban seputar pengiriman, pembayaran, dan akun. Pilih kategori atau ketik pertanyaanmu."
      >
        <label className="relative block w-full max-w-xl">
          <span className="sr-only">Cari pertanyaan bantuan</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Contoh: cara melacak paket"
            className="h-12 bg-white pl-10"
          />
        </label>
      </PageHeader>

      <div className="page-container grid gap-10 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)] lg:gap-12">
        <section aria-labelledby="faq-title" className="min-w-0">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold tracking-[0.14em] text-primary uppercase">
                  FAQ
                </p>
                <h2 id="faq-title" className="mt-1 text-xl font-extrabold">
                  Pertanyaan yang sering muncul
                </h2>
              </div>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {filteredFaqs.length} jawaban
              </p>
            </div>

            <div
              className="flex flex-wrap gap-2"
              aria-label="Filter kategori pertanyaan"
            >
              {(["Semua", ...FAQ_CATEGORIES] as const).map((category) => (
                <Button
                  key={category}
                  type="button"
                  size="sm"
                  variant={activeCategory === category ? "accent" : "outline"}
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {filteredFaqs.length > 0 ? (
              <FaqAccordion items={filteredFaqs} />
            ) : (
              <EmptyState
                icon={Search}
                title="Jawaban belum ditemukan"
                description="Coba kata kunci lain atau pilih kategori Semua untuk melihat semua pertanyaan."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setQuery("")
                      setActiveCategory("Semua")
                    }}
                  >
                    Hapus filter
                  </Button>
                }
              />
            )}
          </div>
        </section>

        <aside className="grid content-start gap-3">
          <div className="mb-1">
            <p className="text-xs font-extrabold tracking-[0.14em] text-primary uppercase">
              Akses cepat
            </p>
            <h2 className="mt-1 text-xl font-extrabold">Kelola kirimanmu</h2>
          </div>
          {quickLinks.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{item.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              </span>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          ))}
        </aside>
      </div>
    </>
  )
}
