import { Link } from "react-router-dom"
import { PackageSearch } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <PackageSearch className="size-8" aria-hidden="true" />
      </span>
      <p className="mt-5 text-xs font-bold tracking-[0.18em] text-accent-foreground uppercase">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
        Halaman ini tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Mungkin tautannya berubah atau halaman sudah dipindahkan. Kamu bisa
        kembali ke beranda atau langsung melacak paket.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link to="/">Kembali ke beranda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/lacak">Lacak paket</Link>
        </Button>
      </div>
    </div>
  )
}
