import { NavLink, Outlet, Link } from "react-router-dom"
import { BookUser, Package, PackagePlus, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { inisialNama } from "@/lib/format"
import { cn } from "@/lib/utils"

const accountNav = [
  { to: "/akun/pesanan", label: "Pesanan saya", icon: Package },
  { to: "/akun/alamat", label: "Buku alamat", icon: BookUser },
]

export function AccountLayout() {
  const user = useAuthStore((state) => state.user)

  return (
    <>
      <section className="relative overflow-hidden border-b border-primary/10 bg-[#fff7f7] py-7 sm:py-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(0.55 0.23 27 / 0.16) 1px, transparent 0)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(to bottom, black, transparent 75%)",
          }}
        />
        <div className="page-container relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-base font-extrabold text-primary-foreground shadow-soft ring-4 ring-white">
              {user ? inisialNama(user.name) : "J&T"}
            </span>
            <div>
              <p className="text-[0.68rem] font-extrabold tracking-[0.16em] text-primary uppercase">
                Akun J&amp;T Express
              </p>
              <h1 className="mt-0.5 text-2xl leading-tight font-extrabold sm:text-3xl">
                Halo, {user?.name.split(" ")[0] ?? "Sahabat J&T"}
              </h1>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck
                  className="size-3.5 text-success"
                  aria-hidden="true"
                />
                {user?.identifier}
              </p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link to="/kirim">
              <PackagePlus className="size-4" aria-hidden="true" />
              Buat pengiriman
            </Link>
          </Button>
        </div>
      </section>

      <div className="page-container py-6 sm:py-8">
        <nav aria-label="Navigasi akun" className="mb-6">
          <ul className="flex flex-wrap gap-2">
            {accountNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-bold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-primary",
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Outlet />
      </div>
    </>
  )
}
