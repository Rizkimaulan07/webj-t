import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  Calculator,
  CircleHelp,
  LogOut,
  MapPin,
  Menu,
  Package,
  PackagePlus,
  Phone,
  Search,
  Truck,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { inisialNama } from "@/lib/format"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Lacak", to: "/lacak", icon: Search },
  { label: "Cek Tarif", to: "/tarif", icon: Calculator },
  { label: "Layanan", to: "/#layanan", icon: Package },
  { label: "Cara Kerja", to: "/#cara-kerja", icon: Truck },
  { label: "Cabang", to: "/cabang", icon: MapPin },
]

export function Navbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const keluar = async () => {
    try {
      await logout()
      setMobileOpen(false)
      toast.success("Kamu sudah keluar dari akun.")
      navigate("/")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal keluar dari akun.",
      )
    }
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/80 bg-white/95 shadow-[0_8px_24px_-20px_rgba(80,0,10,0.5)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="brand-gradient h-1" aria-hidden="true" />
      <div className="hidden bg-[#191314] text-white/65 md:block">
        <div className="page-container flex h-11 items-center justify-between gap-4 text-xs font-medium">
          <p className="inline-flex items-center gap-2 text-white/80">
            <Truck className="size-3.5 text-[#ff6b78]" aria-hidden="true" />
            Jaringan pengiriman ke 500+ kota di Indonesia
          </p>
          <nav aria-label="Navigasi bantuan" className="flex items-center gap-5">
            <Link
              to="/lacak"
              className="inline-flex min-h-11 items-center transition-colors hover:text-white"
            >
              Lacak resi
            </Link>
            <Link
              to="/bantuan"
              className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-white"
            >
              <CircleHelp className="size-3.5" aria-hidden="true" />
              Bantuan
            </Link>
            <a
              href="tel:+622155501122"
              className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-white"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              CS 1500-123
            </a>
          </nav>
        </div>
      </div>

      <div className="page-container flex h-16 items-center justify-between gap-3 lg:h-[4.75rem]">
        <Logo className="h-8 sm:h-9 lg:h-10" />

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-0.5 rounded-2xl bg-[#fff7f7] p-1 xl:flex"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground transition-[color,background-color,box-shadow] hover:bg-white hover:text-primary xl:px-3.5",
                  isActive &&
                    !item.to.includes("#") &&
                    "bg-white text-primary shadow-sm ring-1 ring-primary/10",
                )
              }
            >
              <item.icon
                className="size-4 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          {user ? (
            <>
              <Link
                to="/akun/pesanan"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
                aria-label={`Akun ${user.name}`}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground shadow-sm">
                  {inisialNama(user.name)}
                </span>
                <span className="hidden max-w-28 truncate xl:inline">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={keluar}
                aria-label="Keluar dari akun"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
              <Button asChild>
                <Link to="/kirim">
                  <PackagePlus className="size-4" aria-hidden="true" />
                  Kirim Paket
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/masuk">
                  <UserRound className="size-4" aria-hidden="true" />
                  Masuk
                </Link>
              </Button>
              <Button asChild>
                <Link to="/daftar">
                  Daftar
                  <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 xl:hidden">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Lacak paket"
            className="size-11 rounded-xl bg-accent/70 text-primary hover:bg-primary hover:text-white sm:w-auto sm:px-3"
          >
            <Link to="/lacak">
              <Search className="size-5" aria-hidden="true" />
              <span className="hidden sm:inline">Lacak</span>
            </Link>
          </Button>

          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Buka menu navigasi"
                className="size-11 rounded-xl border-border bg-white shadow-sm"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="top-0 right-0 left-auto h-svh max-h-svh w-[min(90vw,23rem)] max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none rounded-l-2xl border-y-0 border-r-0 p-0 [&>button]:text-white [&>button]:hover:bg-white/15"
            >
              <DialogTitle className="sr-only">Menu navigasi</DialogTitle>
              <DialogDescription className="sr-only">
                Tautan navigasi utama dan akses akun J&amp;T Express.
              </DialogDescription>

              <div className="brand-gradient px-5 pt-7 pb-7 text-white">
                <div className="pr-12">
                  <Logo asLink={false} tone="light" className="h-9" />
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.68rem] font-bold tracking-[0.12em] text-white/85 uppercase ring-1 ring-white/15">
                    <Truck className="size-3.5" aria-hidden="true" />
                    Laju sampai tujuan
                  </p>
                </div>
                {user ? (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 ring-1 ring-white/15">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-primary">
                      {inisialNama(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{user.name}</p>
                      <p className="truncate text-xs text-white/65">
                        {user.identifier}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-relaxed text-white/75">
                    Masuk untuk menyimpan alamat, membuat pengiriman, dan
                    memantau semua resi dalam satu tempat.
                  </p>
                )}
              </div>

              <div className="grid gap-6 p-5">
                <nav aria-label="Navigasi seluler" className="grid gap-1">
                  {navItems.map((item) => (
                    <DialogClose asChild key={item.label}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "group inline-flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-bold text-foreground transition-colors hover:bg-accent hover:text-primary",
                            isActive &&
                              !item.to.includes("#") &&
                              "bg-accent text-primary",
                          )
                        }
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-white">
                          <item.icon
                            className="size-4"
                            aria-hidden="true"
                          />
                        </span>
                        {item.label}
                      </NavLink>
                    </DialogClose>
                  ))}
                  <DialogClose asChild>
                    <NavLink
                      to="/bantuan"
                      className={({ isActive }) =>
                        cn(
                          "group inline-flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-bold text-foreground transition-colors hover:bg-accent hover:text-primary",
                          isActive && "bg-accent text-primary",
                        )
                      }
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-white">
                        <CircleHelp className="size-4" aria-hidden="true" />
                      </span>
                      Bantuan
                    </NavLink>
                  </DialogClose>
                </nav>

                <div className="grid gap-2 border-t pt-5">
                  {user ? (
                    <>
                      <DialogClose asChild>
                        <Button asChild>
                          <Link to="/kirim">
                            <PackagePlus className="size-4" aria-hidden="true" />
                            Buat Pengiriman
                          </Link>
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button asChild variant="outline">
                          <Link to="/akun/pesanan">
                            <UserRound className="size-4" aria-hidden="true" />
                            Akun &amp; Pesanan
                          </Link>
                        </Button>
                      </DialogClose>
                      <Button variant="ghost" onClick={keluar}>
                        <LogOut className="size-4" aria-hidden="true" />
                        Keluar
                      </Button>
                    </>
                  ) : (
                    <>
                      <DialogClose asChild>
                        <Button asChild>
                          <Link to="/daftar">Daftar gratis</Link>
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button asChild variant="outline">
                          <Link to="/masuk">Masuk</Link>
                        </Button>
                      </DialogClose>
                    </>
                  )}
                </div>

                <a
                  href="tel:+622155501122"
                  className="inline-flex min-h-11 items-center gap-2 border-t pt-4 text-sm font-semibold text-muted-foreground"
                >
                  <Phone className="size-4 text-primary" aria-hidden="true" />
                  Layanan pelanggan 1500-123
                </a>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
