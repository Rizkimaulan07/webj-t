import { BusinessCta } from "@/features/home/BusinessCta"
import { BranchPreviewSection } from "@/features/home/BranchPreviewSection"
import { FaqPreviewSection } from "@/features/home/FaqPreviewSection"
import { Hero } from "@/features/home/Hero"
import { HowItWorksSection } from "@/features/home/HowItWorksSection"
import { ServicesSection } from "@/features/home/ServicesSection"
import { TestimonialsSection } from "@/features/home/TestimonialsSection"
import { TrustStrip } from "@/features/home/TrustStrip"

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <BranchPreviewSection />
      <FaqPreviewSection />
      <BusinessCta />
    </>
  )
}
