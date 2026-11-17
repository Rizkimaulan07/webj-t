import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { Footer } from "./Footer"
import { Navbar } from "./Navbar"

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(hash.slice(1))
        target?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
      return () => window.cancelAnimationFrame(frame)
    }
    window.scrollTo({ top: 0, behavior: "auto" })
    return undefined
  }, [pathname, hash])

  return null
}

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-50 inline-flex min-h-11 min-w-11 items-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
