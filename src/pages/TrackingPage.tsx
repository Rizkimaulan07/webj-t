import { useNavigate, useParams } from "react-router-dom"
import { LifeBuoy, Search } from "lucide-react"

import { TrackingPanel } from "@/features/tracking/TrackingPanel"
import { DEMO_TRACKING_CODES } from "@/mocks/shipments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const demoResi = [
  { label: "Dalam perjalanan", awb: DEMO_TRACKING_CODES.inTransit },
  { label: "Sudah diterima", awb: DEMO_TRACKING_CODES.delivered },
]

export function TrackingPage() {
  const { resi } = useParams<{ resi?: string }>()
  const navigate = useNavigate()
  const awb = resi ? decodeURIComponent(resi) : null

  return (
    <>
      <section className="border-b bg-card/60 py-8 sm:py-12">
        <div className="page-container">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent-foreground">
            <Search className="size-3.5" aria-hidden="true" />
            Pelacakan paket
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Temukan posisi paketmu
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Masukkan nomor resi untuk melihat status dan riwayat perjalanan
            terbaru. Nomor resi bisa kamu temukan pada bukti pembayaran atau
            label pengiriman.
          </p>
        </div>
      </section>

      <div className="page-container grid gap-6 py-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Lacak nomor resi</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingPanel
              awb={awb}
              onSearch={(kode) =>
                navigate(`/lacak/${encodeURIComponent(kode)}`)
              }
            />
          </CardContent>
        </Card>

        <aside className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="size-5 text-accent-foreground" aria-hidden="true" />
                Pakai resi demo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ingin mencoba tanpa membuat pengiriman? Pilih salah satu nomor
                resi contoh berikut.
              </p>
              {demoResi.map((item) => (
                <Button
                  key={item.awb}
                  type="button"
                  variant="outline"
                  className="h-auto min-h-11 justify-between gap-3 py-2.5"
                  onClick={() =>
                    navigate(`/lacak/${encodeURIComponent(item.awb)}`)
                  }
                >
                  <span className="text-left">
                    <span className="block text-xs font-medium text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="block font-extrabold tracking-wide">
                      {item.awb}
                    </span>
                  </span>
                  <Search className="size-4" aria-hidden="true" />
                </Button>
              ))}
              <Separator className="my-1" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Nama penerima pada halaman ini disamarkan untuk menjaga
                privasi.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-base">Resi bermasalah?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-primary-foreground/75">
                Hubungi layanan pelanggan kami di{" "}
                <a
                  href="tel:+622155501122"
                  className="inline-flex min-h-11 items-center font-bold text-accent underline underline-offset-4"
                >
                  1500-123
                </a>{" "}
                atau email halo@jntexpress.id dengan menyertakan nomor resi.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}
