import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Printer } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { useOrderByAwb } from "@/features/orders/useOrders"
import { ShippingLabel } from "@/features/label/ShippingLabel"

export function LabelPage() {
  const { awb } = useParams<{ awb: string }>()
  const user = useAuthStore((state) => state.user)
  const { data: order, isPending, isError } = useOrderByAwb(awb)

  const bukanMilik = order && order.ownerId !== user?.id

  return (
    <div className="bg-muted/30 py-8 print:bg-white print:py-0">
      <div className="page-container">
        <div className="no-print mx-auto mb-5 flex max-w-[30rem] flex-col gap-4">
          <Button asChild variant="ghost" className="w-fit -ml-3">
            <Link to="/akun/pesanan">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Kembali ke pesanan
            </Link>
          </Button>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Label pengiriman
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cetak label A6 lalu tempelkan pada paket. Barcode Code 128 dibuat
                langsung di browser.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => window.print()}
              disabled={!order || Boolean(bukanMilik)}
            >
              <Printer className="size-4" aria-hidden="true" />
              Cetak label
            </Button>
          </div>
        </div>

        {isPending && (
          <Skeleton className="mx-auto h-[520px] w-full max-w-[30rem] rounded-xl" />
        )}

        {(isError || bukanMilik) && (
          <EmptyState
            icon={Printer}
            title="Label tidak ditemukan"
            description="Label hanya bisa dibuka oleh pemilik pesanan. Periksa nomor resi atau kembali ke daftar pesanan."
            action={
              <Button asChild variant="outline">
                <Link to="/akun/pesanan">Lihat daftar pesanan</Link>
              </Button>
            }
            className="mx-auto max-w-[30rem] bg-card"
          />
        )}

        {order && !bukanMilik && (
          <>
            <ShippingLabel order={order} />
            <div className="no-print mx-auto mt-4 max-w-[30rem] rounded-lg border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">
                Tips mencetak
              </p>
              <p className="mt-1">
                Gunakan ukuran kertas A6 (10,5 × 14,8 cm) atau pilih “Fit to
                page”. Matikan header dan footer pada dialog cetak agar label
                pas. Anda juga bisa menyimpan sebagai PDF.
              </p>
              <Link
                to={`/lacak/${encodeURIComponent(order.awb)}`}
                className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-primary underline underline-offset-4"
              >
                Lacak paket ini
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
