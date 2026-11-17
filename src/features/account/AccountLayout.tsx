import { NavLink, Outlet, Link } from "react-router-dom"
import { BookUser, Package, PackagePlus } from "lucide-react"

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
      <section className="border-b bg-card/60 py-7 sm:py-9">
        <div className="page-container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
              {user ? inisialNama(user.name) : "JE"}
            </span>
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                Akun J&T Express
              </p>
              <h1 className="text-2xl leading-tight font-extrabold">
                Halo, {user?.name.split(" ")[0] ?? "Sahabat J&T"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.identifier}
              </p>
            </div>
          </div>
          <Button asChild>
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
                      "inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary hover:text-foreground",
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
