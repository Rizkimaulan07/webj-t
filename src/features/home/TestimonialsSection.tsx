import { Quote, Star } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"

const testimonials = [
  {
    quote:
      "Pesanan toko online saya jadi lebih rapi. Label langsung jadi, tinggal cetak dan serahkan ke kurir.",
    name: "Nadia P.",
    role: "Pemilik toko hijab, Bandung",
  },
  {
    quote:
      "Suka bisa bandingin tarif sebelum bayar. Estimasi Express-nya juga jelas, jadi pelanggan tidak bertanya terus.",
    name: "Rangga S.",
    role: "Penjual elektronik, Surabaya",
  },
  {
    quote:
      "Lacak resi dari HP gampang, riwayat perjalanannya lengkap. Kirim dokumen penting jadi lebih tenang.",
    name: "Maya L.",
    role: "Freelancer, Jakarta",
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-[#fbf5f5] py-14 sm:py-20">
      <div className="page-container">
        <SectionHeading
          eyebrow="Testimoni"
          title="Dipercaya untuk kiriman sehari-hari"
          description="Cerita dari pelanggan yang memakai J&T Express untuk kebutuhan pribadi dan bisnis."
          align="center"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="relative flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-soft"
            >
              <Quote
                className="size-7 text-primary/20"
                aria-hidden="true"
              />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">
                “{item.quote}”
              </blockquote>
              <div
                className="mt-4 flex items-center gap-1 text-primary"
                aria-label="Rating 5 dari 5"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="size-3.5 fill-current"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <figcaption className="mt-3 border-t pt-3">
                <p className="text-sm font-extrabold">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
