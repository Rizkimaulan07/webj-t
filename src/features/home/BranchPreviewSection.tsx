import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { useBranches } from "@/features/branches/useBranches"
import { BranchCard } from "@/features/branches/BranchCard"
import { BranchListSkeleton } from "@/features/branches/BranchList"

export function BranchPreviewSection() {
  const { data, isPending } = useBranches("")

  return (
    <section className="py-14 sm:py-20">
      <div className="page-container">
        <SectionHeading
          eyebrow="Cabang"
          title="Serahkan paket di cabang terdekat"
          description="Pilih jemput kurir saat membuat pengiriman, atau antar sendiri paket ke hub, drop point, dan agen kami."
          action={
            <Button asChild variant="outline">
              <Link to="/cabang">
                Lihat semua cabang
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <div className="mt-8">
          {isPending ? (
            <BranchListSkeleton count={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.slice(0, 3).map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
