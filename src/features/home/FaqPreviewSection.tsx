import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { FaqAccordion } from "@/features/help/FaqAccordion"
import { FAQS } from "@/lib/faqs"

export function FaqPreviewSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="page-container grid gap-8 lg:grid-cols-[0.85fr_1.4fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Bantuan"
            title="Pertanyaan yang sering muncul"
            description="Belum menemukan jawaban? Pusat bantuan kami merangkum pertanyaan seputar pengiriman, pembayaran, dan akun."
          />
          <Button asChild className="mt-5">
            <Link to="/bantuan">
              Buka pusat bantuan
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <FaqAccordion items={FAQS.slice(0, 4)} />
      </div>
    </section>
  )
}
