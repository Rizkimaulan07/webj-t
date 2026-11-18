import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuthStore } from "@/features/auth/useAuthStore"

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  const ready = useAuthStore((state) => state.ready)
  const authError = useAuthStore((state) => state.authError)
  const location = useLocation()

  if (!ready) {
    return (
      <div className="page-container py-16 text-center" role="status">
        Memeriksa sesi akun…
      </div>
    )
  }

  if (authError) {
    return (
      <div className="page-container py-16 text-center">
        <p role="alert" className="font-semibold text-destructive">
          {authError}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Pastikan backend dan PostgreSQL berjalan, lalu muat ulang halaman.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 min-h-11 rounded-lg bg-primary px-4 font-bold text-primary-foreground"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/masuk"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}
